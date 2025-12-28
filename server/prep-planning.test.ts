import { describe, it, expect, beforeAll } from "vitest";
import { generatePrepPlan, generateMultiDayPrepPlan } from "./prep-planning";
import { getDb } from "./db";
import { recipes, recipeIngredients, ingredients, locations, salesData } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Prep Planning Engine", () => {
  // Note: Many tests will fail if no recipes exist in the database
  // This is expected behavior - prep planning requires recipes with ingredients
  let testLocationId: number;
  let testRecipeId: number;
  let testIngredientId: number;

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

    // Check if we have test recipes and ingredients
    const existingRecipes = await db.select().from(recipes).limit(1);
    const existingIngredients = await db.select().from(ingredients).limit(1);

    if (existingRecipes.length > 0) {
      testRecipeId = existingRecipes[0].id;
    }
    if (existingIngredients.length > 0) {
      testIngredientId = existingIngredients[0].id;
    }
  });

  describe("generatePrepPlan", () => {
    it("should generate prep plan for tomorrow", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const targetDate = tomorrow.toISOString().split("T")[0];

      const result = await generatePrepPlan(testLocationId, targetDate, 10);

      expect(result).toBeDefined();
      expect(result.date).toBe(targetDate);
      expect(result.forecastRevenue).toBeGreaterThan(0);
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.metrics).toBeDefined();
    });

    it("should include all required fields in prep plan", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const targetDate = tomorrow.toISOString().split("T")[0];

      const result = await generatePrepPlan(testLocationId, targetDate, 10);

      expect(result).toHaveProperty("date");
      expect(result).toHaveProperty("forecastRevenue");
      expect(result).toHaveProperty("recommendations");
      expect(result).toHaveProperty("metrics");
      
      expect(result.metrics).toHaveProperty("totalIngredients");
      expect(result.metrics).toHaveProperty("estimatedWasteReduction");
      expect(result.metrics).toHaveProperty("confidenceLevel");
    });

    it("should calculate safety buffer correctly", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const targetDate = tomorrow.toISOString().split("T")[0];

      const result = await generatePrepPlan(testLocationId, targetDate, 15);

      // If we have recommendations, check safety buffer calculation
      if (result.recommendations.length > 0) {
        result.recommendations.forEach((rec) => {
          const expectedBuffer = rec.recommendedQuantity * 0.15;
          const expectedTotal = rec.recommendedQuantity + expectedBuffer;
          
          // Allow small rounding differences
          expect(Math.abs(rec.safetyBuffer - expectedBuffer)).toBeLessThan(0.5);
          expect(Math.abs(rec.totalWithBuffer - expectedTotal)).toBeLessThan(0.5);
        });
      }
    });

    it("should have valid recommendation structure", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const targetDate = tomorrow.toISOString().split("T")[0];

      const result = await generatePrepPlan(testLocationId, targetDate, 10);

      // If we have recommendations, validate structure
      if (result.recommendations.length > 0) {
        const rec = result.recommendations[0];
        
        expect(rec).toHaveProperty("ingredientId");
        expect(rec).toHaveProperty("ingredientName");
        expect(rec).toHaveProperty("recommendedQuantity");
        expect(rec).toHaveProperty("unit");
        expect(rec).toHaveProperty("safetyBuffer");
        expect(rec).toHaveProperty("totalWithBuffer");
        expect(rec).toHaveProperty("recipes");
        
        expect(Array.isArray(rec.recipes)).toBe(true);
      }
    });

    it("should have non-negative quantities", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const targetDate = tomorrow.toISOString().split("T")[0];

      const result = await generatePrepPlan(testLocationId, targetDate, 10);

      result.recommendations.forEach((rec) => {
        expect(rec.recommendedQuantity).toBeGreaterThanOrEqual(0);
        expect(rec.safetyBuffer).toBeGreaterThanOrEqual(0);
        expect(rec.totalWithBuffer).toBeGreaterThanOrEqual(0);
      });
    });

    it("should calculate waste reduction correctly", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const targetDate = tomorrow.toISOString().split("T")[0];

      const result10 = await generatePrepPlan(testLocationId, targetDate, 10);
      const result20 = await generatePrepPlan(testLocationId, targetDate, 20);

      // 10% buffer should have higher waste reduction than 20% buffer
      expect(result10.metrics.estimatedWasteReduction).toBeGreaterThan(
        result20.metrics.estimatedWasteReduction
      );

      // Waste reduction should be between 0 and 100
      expect(result10.metrics.estimatedWasteReduction).toBeGreaterThanOrEqual(0);
      expect(result10.metrics.estimatedWasteReduction).toBeLessThanOrEqual(100);
    });

    it("should have confidence level between 0 and 100", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const targetDate = tomorrow.toISOString().split("T")[0];

      const result = await generatePrepPlan(testLocationId, targetDate, 10);

      expect(result.metrics.confidenceLevel).toBeGreaterThanOrEqual(0);
      expect(result.metrics.confidenceLevel).toBeLessThanOrEqual(100);
    });

    it("should throw error for past dates", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const targetDate = yesterday.toISOString().split("T")[0];

      await expect(
        generatePrepPlan(testLocationId, targetDate, 10)
      ).rejects.toThrow("Target date must be in the future");
    });

    it("should throw error for dates too far in future", async () => {
      const farFuture = new Date();
      farFuture.setDate(farFuture.getDate() + 35);
      const targetDate = farFuture.toISOString().split("T")[0];

      await expect(
        generatePrepPlan(testLocationId, targetDate, 10)
      ).rejects.toThrow("Cannot generate prep plan more than 30 days in advance");
    });

    it("should sort recommendations by total quantity", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const targetDate = tomorrow.toISOString().split("T")[0];

      const result = await generatePrepPlan(testLocationId, targetDate, 10);

      // If we have multiple recommendations, check sorting
      if (result.recommendations.length > 1) {
        for (let i = 1; i < result.recommendations.length; i++) {
          expect(result.recommendations[i - 1].totalWithBuffer).toBeGreaterThanOrEqual(
            result.recommendations[i].totalWithBuffer
          );
        }
      }
    });

    it("should include recipe breakdown in recommendations", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const targetDate = tomorrow.toISOString().split("T")[0];

      const result = await generatePrepPlan(testLocationId, targetDate, 10);

      // If we have recommendations, check recipe breakdown
      if (result.recommendations.length > 0) {
        result.recommendations.forEach((rec) => {
          expect(Array.isArray(rec.recipes)).toBe(true);
          
          rec.recipes.forEach((recipe) => {
            expect(recipe).toHaveProperty("recipeId");
            expect(recipe).toHaveProperty("recipeName");
            expect(recipe).toHaveProperty("estimatedServings");
            expect(recipe).toHaveProperty("ingredientQuantity");
            
            expect(recipe.estimatedServings).toBeGreaterThan(0);
            expect(recipe.ingredientQuantity).toBeGreaterThanOrEqual(0);
          });
        });
      }
    });
  });

  describe("generateMultiDayPrepPlan", () => {
    it("should generate prep plan for multiple days", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const startDate = tomorrow.toISOString().split("T")[0];

      const result = await generateMultiDayPrepPlan(testLocationId, startDate, 3, 10);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
    });

    it("should have sequential dates in multi-day plan", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const startDate = tomorrow.toISOString().split("T")[0];

      const result = await generateMultiDayPrepPlan(testLocationId, startDate, 5, 10);

      for (let i = 1; i < result.length; i++) {
        const prevDate = new Date(result[i - 1].date);
        const currDate = new Date(result[i].date);
        
        const diffInDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        expect(diffInDays).toBe(1);
      }
    });

    it("should generate up to 7 days", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const startDate = tomorrow.toISOString().split("T")[0];

      const result = await generateMultiDayPrepPlan(testLocationId, startDate, 7, 10);

      expect(result.length).toBe(7);
    });

    it("should have consistent safety buffer across all days", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const startDate = tomorrow.toISOString().split("T")[0];
      const bufferPercent = 15;

      const result = await generateMultiDayPrepPlan(testLocationId, startDate, 3, bufferPercent);

      // Each day should have the same waste reduction metric (based on buffer)
      const expectedWasteReduction = Math.round(((30 - bufferPercent) / 30) * 100);
      
      result.forEach((plan) => {
        expect(plan.metrics.estimatedWasteReduction).toBe(expectedWasteReduction);
      });
    });

    it("should have varying forecast revenue across days", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const startDate = tomorrow.toISOString().split("T")[0];

      const result = await generateMultiDayPrepPlan(testLocationId, startDate, 7, 10);

      // Revenue should vary by day of week (not all the same)
      const revenues = result.map((plan) => plan.forecastRevenue);
      const uniqueRevenues = new Set(revenues);
      
      // Should have at least 2 different revenue values across 7 days
      expect(uniqueRevenues.size).toBeGreaterThan(1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle 0% safety buffer", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const targetDate = tomorrow.toISOString().split("T")[0];

      const result = await generatePrepPlan(testLocationId, targetDate, 0);

      expect(result.metrics.estimatedWasteReduction).toBe(100);
      
      // Safety buffer should be 0 for all recommendations
      result.recommendations.forEach((rec) => {
        expect(rec.safetyBuffer).toBe(0);
        expect(rec.totalWithBuffer).toBe(rec.recommendedQuantity);
      });
    });

    it("should handle maximum safety buffer (50%)", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const targetDate = tomorrow.toISOString().split("T")[0];

      const result = await generatePrepPlan(testLocationId, targetDate, 50);

      // Waste reduction should be negative (more waste than baseline)
      expect(result.metrics.estimatedWasteReduction).toBeLessThan(0);
      
      // Safety buffer should be 50% of recommended quantity
      if (result.recommendations.length > 0) {
        result.recommendations.forEach((rec) => {
          const expectedBuffer = rec.recommendedQuantity * 0.5;
          expect(Math.abs(rec.safetyBuffer - expectedBuffer)).toBeLessThan(0.5);
        });
      }
    });
  });
});
