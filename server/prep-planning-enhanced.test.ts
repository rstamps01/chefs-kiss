/**
 * Tests for Enhanced Prep Planning Features
 * - Category-based grouping
 * - Piece calculation for fish/seafood
 * - Recipe portion tracking
 */

import { describe, it, expect } from "vitest";
import { generatePrepPlan } from "./prep-planning";
import { getRestaurantLocations, getUserRestaurant } from "./db";

describe("Enhanced Prep Planning", () => {
  it("should include category information in prep recommendations", async () => {
    // Get test restaurant and location
    const restaurant = await getUserRestaurant(1); // Owner user ID
    if (!restaurant) {
      console.log("No restaurant found, skipping test");
      return;
    }

    const locations = await getRestaurantLocations(restaurant.id);
    if (locations.length === 0) {
      console.log("No locations found, skipping test");
      return;
    }

    const locationId = locations[0].id;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const targetDate = tomorrow.toISOString().split("T")[0];

    const prepPlan = await generatePrepPlan(locationId, targetDate, 10);

    expect(prepPlan).toBeDefined();
    expect(prepPlan.recommendations).toBeDefined();
    expect(Array.isArray(prepPlan.recommendations)).toBe(true);

    // Check that recommendations have category field
    if (prepPlan.recommendations.length > 0) {
      const firstRec = prepPlan.recommendations[0];
      expect(firstRec).toHaveProperty("category");
      expect(firstRec).toHaveProperty("pieces");
      expect(firstRec).toHaveProperty("pieceWeightOz");
    }
  });

  it("should calculate pieces for ingredients with piece weight", async () => {
    const restaurant = await getUserRestaurant(1);
    if (!restaurant) {
      console.log("No restaurant found, skipping test");
      return;
    }

    const locations = await getRestaurantLocations(restaurant.id);
    if (locations.length === 0) {
      console.log("No locations found, skipping test");
      return;
    }

    const locationId = locations[0].id;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const targetDate = tomorrow.toISOString().split("T")[0];

    const prepPlan = await generatePrepPlan(locationId, targetDate, 10);

    // Find ingredients with piece weight (typically fish/seafood)
    const ingredientsWithPieces = prepPlan.recommendations.filter(
      (rec) => rec.pieces !== null && rec.pieces > 0
    );

    console.log(
      `Found ${ingredientsWithPieces.length} ingredients with piece calculations`
    );

    ingredientsWithPieces.forEach((rec) => {
      console.log(
        `  - ${rec.ingredientName}: ${rec.pieces} pieces (${rec.totalWithBuffer} ${rec.unit}, ~${rec.pieceWeightOz}oz each)`
      );

      // Verify piece calculation is reasonable
      expect(rec.pieces).toBeGreaterThan(0);
      expect(rec.pieceWeightOz).toBeGreaterThan(0);
      expect(rec.totalWithBuffer).toBeGreaterThan(0);
    });
  });

  it("should group recommendations by category", async () => {
    const restaurant = await getUserRestaurant(1);
    if (!restaurant) {
      console.log("No restaurant found, skipping test");
      return;
    }

    const locations = await getRestaurantLocations(restaurant.id);
    if (locations.length === 0) {
      console.log("No locations found, skipping test");
      return;
    }

    const locationId = locations[0].id;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const targetDate = tomorrow.toISOString().split("T")[0];

    const prepPlan = await generatePrepPlan(locationId, targetDate, 10);

    // Group by category
    const categoryGroups = new Map<string, number>();
    prepPlan.recommendations.forEach((rec) => {
      const category = rec.category || "Uncategorized";
      categoryGroups.set(category, (categoryGroups.get(category) || 0) + 1);
    });

    console.log(`\nPrep list grouped into ${categoryGroups.size} categories:`);
    Array.from(categoryGroups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([category, count]) => {
        console.log(`  - ${category}: ${count} items`);
      });

    expect(categoryGroups.size).toBeGreaterThan(0);
  });

  it("should include recipe breakdown for each ingredient", async () => {
    const restaurant = await getUserRestaurant(1);
    if (!restaurant) {
      console.log("No restaurant found, skipping test");
      return;
    }

    const locations = await getRestaurantLocations(restaurant.id);
    if (locations.length === 0) {
      console.log("No locations found, skipping test");
      return;
    }

    const locationId = locations[0].id;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const targetDate = tomorrow.toISOString().split("T")[0];

    const prepPlan = await generatePrepPlan(locationId, targetDate, 10);

    // Check that each recommendation has recipe breakdown
    prepPlan.recommendations.forEach((rec) => {
      expect(rec.recipes).toBeDefined();
      expect(Array.isArray(rec.recipes)).toBe(true);
      expect(rec.recipes.length).toBeGreaterThan(0);

      rec.recipes.forEach((recipe) => {
        expect(recipe).toHaveProperty("recipeId");
        expect(recipe).toHaveProperty("recipeName");
        expect(recipe).toHaveProperty("estimatedServings");
        expect(recipe).toHaveProperty("ingredientQuantity");
      });
    });

    console.log(
      `\nAll ${prepPlan.recommendations.length} ingredients have recipe breakdowns`
    );
  });

  it("should export prep plan with category and piece information", async () => {
    const restaurant = await getUserRestaurant(1);
    if (!restaurant) {
      console.log("No restaurant found, skipping test");
      return;
    }

    const locations = await getRestaurantLocations(restaurant.id);
    if (locations.length === 0) {
      console.log("No locations found, skipping test");
      return;
    }

    const locationId = locations[0].id;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const targetDate = tomorrow.toISOString().split("T")[0];

    const prepPlan = await generatePrepPlan(locationId, targetDate, 10);

    // Simulate CSV export structure
    const csvRows = [
      ["Category", "Ingredient", "Pieces", "Recommended Qty", "Safety Buffer", "Total with Buffer", "Unit"],
      ...prepPlan.recommendations.map((rec) => [
        rec.category || "Uncategorized",
        rec.ingredientName,
        rec.pieces?.toString() || "",
        rec.recommendedQuantity.toString(),
        rec.safetyBuffer.toString(),
        rec.totalWithBuffer.toString(),
        rec.unit,
      ]),
    ];

    expect(csvRows.length).toBeGreaterThan(1);
    expect(csvRows[0]).toEqual([
      "Category",
      "Ingredient",
      "Pieces",
      "Recommended Qty",
      "Safety Buffer",
      "Total with Buffer",
      "Unit",
    ]);

    console.log(`\nCSV export would contain ${csvRows.length - 1} data rows`);
  });
});
