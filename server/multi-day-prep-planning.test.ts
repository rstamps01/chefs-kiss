import { describe, it, expect } from "vitest";
import { generateMultiDayPrepPlan } from "./multi-day-prep-planning";
import { getRestaurantLocations } from "./db";

describe("Multi-Day Prep Planning", () => {
  it("should generate consolidated prep plan for 3 days", async () => {
    // Get first location
    const locations = await getRestaurantLocations(1);
    expect(locations.length).toBeGreaterThan(0);
    const locationId = locations[0].id;

    // Generate 3-day prep plan starting tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startDate = tomorrow.toISOString().split("T")[0];

    const multiDayPlan = await generateMultiDayPrepPlan(locationId, startDate, 3, 10);

    // Verify structure
    expect(multiDayPlan.startDate).toBe(startDate);
    expect(multiDayPlan.totalDays).toBe(3);
    expect(multiDayPlan.ingredients).toBeInstanceOf(Array);
    expect(multiDayPlan.metrics.totalIngredients).toBeGreaterThan(0);
    expect(multiDayPlan.metrics.totalForecastRevenue).toBeGreaterThan(0);
    expect(multiDayPlan.metrics.averageDailyRevenue).toBeGreaterThan(0);

    console.log(`\n3-Day Prep Plan Generated:`);
    console.log(`  - Start Date: ${multiDayPlan.startDate}`);
    console.log(`  - End Date: ${multiDayPlan.endDate}`);
    console.log(`  - Total Ingredients: ${multiDayPlan.metrics.totalIngredients}`);
    console.log(`  - Total Revenue: $${multiDayPlan.metrics.totalForecastRevenue}`);
    console.log(`  - Avg Daily Revenue: $${multiDayPlan.metrics.averageDailyRevenue}`);
  });

  it("should consolidate ingredients across multiple days", async () => {
    const locations = await getRestaurantLocations(1);
    const locationId = locations[0].id;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startDate = tomorrow.toISOString().split("T")[0];

    const multiDayPlan = await generateMultiDayPrepPlan(locationId, startDate, 3, 10);

    // Verify each ingredient has day breakdowns
    expect(multiDayPlan.ingredients.length).toBeGreaterThan(0);
    
    multiDayPlan.ingredients.forEach((ingredient) => {
      expect(ingredient.dayBreakdowns).toBeInstanceOf(Array);
      expect(ingredient.dayBreakdowns.length).toBeGreaterThan(0);
      expect(ingredient.dayBreakdowns.length).toBeLessThanOrEqual(3);
      
      // Verify total quantity equals sum of day quantities
      const sumOfDays = ingredient.dayBreakdowns.reduce(
        (sum, day) => sum + day.quantity,
        0
      );
      
      // Allow small rounding variance
      const variance = Math.abs(sumOfDays - ingredient.totalQuantityAllDays);
      expect(variance).toBeLessThan(5);
    });

    console.log(`\nVerified ingredient consolidation across days`);
  });

  it("should include day-by-day recipe breakdowns", async () => {
    const locations = await getRestaurantLocations(1);
    const locationId = locations[0].id;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startDate = tomorrow.toISOString().split("T")[0];

    const multiDayPlan = await generateMultiDayPrepPlan(locationId, startDate, 3, 10);

    // Check first ingredient has recipe details in day breakdowns
    const firstIngredient = multiDayPlan.ingredients[0];
    expect(firstIngredient.dayBreakdowns.length).toBeGreaterThan(0);

    firstIngredient.dayBreakdowns.forEach((day) => {
      expect(day.date).toBeTruthy();
      expect(day.quantity).toBeGreaterThan(0);
      expect(day.recipes).toBeInstanceOf(Array);
      
      day.recipes.forEach((recipe) => {
        expect(recipe.recipeId).toBeGreaterThan(0);
        expect(recipe.recipeName).toBeTruthy();
        expect(recipe.estimatedServings).toBeGreaterThan(0);
        expect(recipe.ingredientQuantity).toBeGreaterThan(0);
      });
    });

    console.log(`\nVerified day-by-day recipe breakdowns for ${firstIngredient.ingredientName}`);
  });

  it("should generate 7-day (weekly) prep plan", async () => {
    const locations = await getRestaurantLocations(1);
    const locationId = locations[0].id;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startDate = tomorrow.toISOString().split("T")[0];

    const multiDayPlan = await generateMultiDayPrepPlan(locationId, startDate, 7, 10);

    expect(multiDayPlan.totalDays).toBe(7);
    expect(multiDayPlan.ingredients.length).toBeGreaterThan(0);

    // Verify average daily revenue is reasonable
    const avgRevenue = multiDayPlan.metrics.averageDailyRevenue;
    const totalRevenue = multiDayPlan.metrics.totalForecastRevenue;
    expect(Math.abs(avgRevenue * 7 - totalRevenue)).toBeLessThan(10);

    console.log(`\n7-Day (Weekly) Prep Plan:`);
    console.log(`  - Total Ingredients: ${multiDayPlan.metrics.totalIngredients}`);
    console.log(`  - Total Revenue: $${totalRevenue}`);
    console.log(`  - Avg Daily Revenue: $${avgRevenue}`);
  });

  it("should apply safety buffer to consolidated quantities", async () => {
    const locations = await getRestaurantLocations(1);
    const locationId = locations[0].id;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startDate = tomorrow.toISOString().split("T")[0];

    const safetyBuffer = 15; // 15%
    const multiDayPlan = await generateMultiDayPrepPlan(locationId, startDate, 3, safetyBuffer);

    // Verify safety buffer is applied
    multiDayPlan.ingredients.forEach((ingredient) => {
      const expectedWithBuffer = ingredient.totalQuantityAllDays * (1 + safetyBuffer / 100);
      const variance = Math.abs(ingredient.totalWithBuffer - expectedWithBuffer);
      
      // Allow small rounding variance
      expect(variance).toBeLessThan(5);
    });

    console.log(`\nVerified ${safetyBuffer}% safety buffer applied to all ingredients`);
  });
});
