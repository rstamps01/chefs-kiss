import { describe, it, expect, beforeAll } from "vitest";
import { generateForecast } from "./forecasting";
import { getDb } from "./db";
import { salesData, locations, restaurants } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Sales Forecasting Engine", () => {
  let testLocationId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get existing location from test data
    const existingLocations = await db.select().from(locations).limit(1);
    if (existingLocations.length > 0) {
      testLocationId = existingLocations[0].id;
    } else {
      throw new Error("No test location found");
    }
  });

  describe("generateForecast", () => {
    it("should generate forecast for 7 days", async () => {
      const result = await generateForecast(testLocationId, 7);

      expect(result).toBeDefined();
      expect(result.forecasts).toHaveLength(7);
      expect(result.accuracy).toBeDefined();
      expect(result.insights).toBeDefined();
    });

    it("should generate forecast for 14 days", async () => {
      const result = await generateForecast(testLocationId, 14);

      expect(result.forecasts).toHaveLength(14);
    });

    it("should generate forecast for 30 days", async () => {
      const result = await generateForecast(testLocationId, 30);

      expect(result.forecasts).toHaveLength(30);
    });

    it("should include all required forecast fields", async () => {
      const result = await generateForecast(testLocationId, 7);
      const forecast = result.forecasts[0];

      expect(forecast).toHaveProperty("date");
      expect(forecast).toHaveProperty("predictedRevenue");
      expect(forecast).toHaveProperty("confidenceLower");
      expect(forecast).toHaveProperty("confidenceUpper");
      expect(forecast).toHaveProperty("dayOfWeek");
    });

    it("should have valid date format", async () => {
      const result = await generateForecast(testLocationId, 7);
      const forecast = result.forecasts[0];

      // Date should be in YYYY-MM-DD format
      expect(forecast.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      
      // Date should be parseable
      const date = new Date(forecast.date);
      expect(date.toString()).not.toBe("Invalid Date");
    });

    it("should have valid day of week", async () => {
      const result = await generateForecast(testLocationId, 7);
      const validDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      result.forecasts.forEach((forecast) => {
        expect(validDays).toContain(forecast.dayOfWeek);
      });
    });

    it("should have non-negative predicted revenue", async () => {
      const result = await generateForecast(testLocationId, 7);

      result.forecasts.forEach((forecast) => {
        expect(forecast.predictedRevenue).toBeGreaterThanOrEqual(0);
      });
    });

    it("should have valid confidence intervals", async () => {
      const result = await generateForecast(testLocationId, 7);

      result.forecasts.forEach((forecast) => {
        // Lower bound should be less than predicted
        expect(forecast.confidenceLower).toBeLessThanOrEqual(forecast.predictedRevenue);
        
        // Upper bound should be greater than predicted
        expect(forecast.confidenceUpper).toBeGreaterThanOrEqual(forecast.predictedRevenue);
        
        // Lower bound should be non-negative
        expect(forecast.confidenceLower).toBeGreaterThanOrEqual(0);
      });
    });

    it("should have sequential dates", async () => {
      const result = await generateForecast(testLocationId, 7);

      for (let i = 1; i < result.forecasts.length; i++) {
        const prevDate = new Date(result.forecasts[i - 1].date);
        const currDate = new Date(result.forecasts[i].date);
        
        // Each date should be exactly 1 day after the previous
        const diffInDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        expect(diffInDays).toBe(1);
      }
    });

    it("should include accuracy metrics", async () => {
      const result = await generateForecast(testLocationId, 7);

      expect(result.accuracy).toHaveProperty("mape");
      expect(result.accuracy).toHaveProperty("rmse");
      
      // MAPE should be a percentage (0-100)
      expect(result.accuracy.mape).toBeGreaterThanOrEqual(0);
      expect(result.accuracy.mape).toBeLessThanOrEqual(100);
      
      // RMSE should be non-negative
      expect(result.accuracy.rmse).toBeGreaterThanOrEqual(0);
    });

    it("should include actionable insights", async () => {
      const result = await generateForecast(testLocationId, 7);

      expect(Array.isArray(result.insights)).toBe(true);
      expect(result.insights.length).toBeGreaterThan(0);
      
      // Each insight should be a non-empty string
      result.insights.forEach((insight) => {
        expect(typeof insight).toBe("string");
        expect(insight.length).toBeGreaterThan(0);
      });
    });

    it("should throw error for insufficient historical data", async () => {
      // Create a location with no sales data
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const restaurants = await db.select().from(locations).limit(1);
      if (restaurants.length === 0) {
        throw new Error("No restaurant found for test");
      }

      // Insert a new location with no sales data
      const [newLocation] = await db.insert(locations).values({
        restaurantId: restaurants[0].restaurantId,
        name: "Test Location No Data",
        address: "123 Test St",
        city: "Test City",
        state: "CA",
        zipCode: "12345",
      });

      // Try to generate forecast - should fail
      await expect(
        generateForecast(newLocation.insertId, 7)
      ).rejects.toThrow("Insufficient historical data");

      // Clean up
      await db.delete(locations).where(eq(locations.id, newLocation.insertId));
    });

    it("should detect peak days correctly", async () => {
      const result = await generateForecast(testLocationId, 14);

      // Find insight about busiest day
      const peakDayInsight = result.insights.find((insight) =>
        insight.includes("busiest day")
      );

      expect(peakDayInsight).toBeDefined();
      expect(peakDayInsight).toMatch(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/);
    });

    it("should detect trends correctly", async () => {
      const result = await generateForecast(testLocationId, 14);

      // Should have a trend insight
      const trendInsight = result.insights.find(
        (insight) =>
          insight.includes("upward trend") ||
          insight.includes("downward trend") ||
          insight.includes("stable")
      );

      expect(trendInsight).toBeDefined();
    });

    it("should have consistent day-of-week patterns", async () => {
      const result = await generateForecast(testLocationId, 14);

      // Group forecasts by day of week
      const byDayOfWeek: Record<string, number[]> = {};
      result.forecasts.forEach((forecast) => {
        if (!byDayOfWeek[forecast.dayOfWeek]) {
          byDayOfWeek[forecast.dayOfWeek] = [];
        }
        byDayOfWeek[forecast.dayOfWeek].push(forecast.predictedRevenue);
      });

      // For days that appear multiple times, predictions should be similar
      Object.entries(byDayOfWeek).forEach(([day, revenues]) => {
        if (revenues.length > 1) {
          const avg = revenues.reduce((sum, r) => sum + r, 0) / revenues.length;
          const maxDeviation = Math.max(...revenues.map((r) => Math.abs(r - avg)));
          
          // Max deviation should be less than 20% of average (allowing for trend)
          expect(maxDeviation / avg).toBeLessThan(0.2);
        }
      });
    });

    it("should have reasonable forecast values", async () => {
      const result = await generateForecast(testLocationId, 7);

      result.forecasts.forEach((forecast) => {
        // Revenue should be reasonable (not negative, not absurdly high)
        expect(forecast.predictedRevenue).toBeGreaterThan(0);
        expect(forecast.predictedRevenue).toBeLessThan(1000000); // $1M seems like a reasonable upper bound
        
        // Confidence interval should not be too wide
        const intervalWidth = forecast.confidenceUpper - forecast.confidenceLower;
        const relativeWidth = intervalWidth / forecast.predictedRevenue;
        
        // Interval should not be more than 100% of the predicted value
        expect(relativeWidth).toBeLessThan(1.0);
      });
    });
  });
});
