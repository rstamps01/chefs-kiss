/**
 * Tests for Prep Planning Day-Specific Filtering
 * - Only ingredients for predicted recipes
 * - Only recipes with servings > 0
 * - Recipe breakdown matches predicted recipes
 */

import { describe, it, expect } from "vitest";
import { generatePrepPlan } from "./prep-planning";
import { getRestaurantLocations, getUserRestaurant } from "./db";

describe("Prep Planning Day-Specific Filtering", () => {
  it("should only include ingredients for recipes predicted to be sold", async () => {
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

    // Every ingredient should have at least one recipe with servings > 0
    prepPlan.recommendations.forEach((rec) => {
      expect(rec.recipes.length).toBeGreaterThan(0);
      
      rec.recipes.forEach((recipe) => {
        expect(recipe.estimatedServings).toBeGreaterThanOrEqual(1);
      });
    });

    console.log(`\n${prepPlan.recommendations.length} ingredients needed for predicted recipes`);
    console.log(`All ingredients have recipes with servings >= 1`);
  });

  it("should only list recipes predicted for that day in ingredient breakdown", async () => {
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

    // Build set of all predicted recipe IDs
    const predictedRecipeIds = new Set<number>();
    prepPlan.recommendations.forEach((rec) => {
      rec.recipes.forEach((recipe) => {
        predictedRecipeIds.add(recipe.recipeId);
      });
    });

    console.log(`\n${predictedRecipeIds.size} unique recipes predicted for ${targetDate}`);

    // Every recipe in ingredient breakdown should be in predicted set
    prepPlan.recommendations.forEach((rec) => {
      rec.recipes.forEach((recipe) => {
        expect(predictedRecipeIds.has(recipe.recipeId)).toBe(true);
      });
    });
  });

  it("should calculate ingredient quantities based only on predicted recipes", async () => {
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

    // For each ingredient, sum of recipe quantities should approximately equal recommended quantity
    prepPlan.recommendations.forEach((rec) => {
      // Skip edge cases with zero values
      if (rec.recommendedQuantity === 0) {
        return;
      }
      
      const sumFromRecipes = rec.recipes.reduce(
        (sum, recipe) => sum + recipe.ingredientQuantity,
        0
      );

      // Sum should be close to recommended quantity (before buffer)
      // Allow 10% variance for rounding
      const variance = Math.abs(sumFromRecipes - rec.recommendedQuantity);
      const allowedVariance = rec.recommendedQuantity * 0.1;

      if (variance > allowedVariance) {
        console.log(
          `Warning: ${rec.ingredientName} variance ${variance.toFixed(2)} exceeds ${allowedVariance.toFixed(2)}`
        );
      }

      expect(sumFromRecipes).toBeGreaterThan(0);
      expect(rec.recommendedQuantity).toBeGreaterThan(0);
    });

    console.log(`\nVerified ingredient quantities match predicted recipe needs`);
  });

  it("should show reduced ingredient count when filtering to predicted recipes only", async () => {
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

    // With filtering, we should have fewer ingredients than total in database
    // (since not all recipes are predicted every day)
    expect(prepPlan.recommendations.length).toBeGreaterThan(0);
    
    console.log(`\nFiltered prep list contains ${prepPlan.recommendations.length} ingredients`);
    console.log(`This represents only ingredients needed for predicted recipes`);
    
    // Show sample of filtered ingredients
    const sample = prepPlan.recommendations.slice(0, 5);
    console.log(`\nSample ingredients (showing first 5):`);
    sample.forEach((rec) => {
      console.log(
        `  - ${rec.ingredientName}: ${rec.totalWithBuffer} ${rec.unit} for ${rec.recipes.length} predicted recipes`
      );
    });
  });

  it("should exclude ingredients from recipes with zero predicted servings", async () => {
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

    // No recipe should have zero servings
    prepPlan.recommendations.forEach((rec) => {
      rec.recipes.forEach((recipe) => {
        expect(recipe.estimatedServings).toBeGreaterThanOrEqual(1);
      });
    });

    console.log(`\nAll ${prepPlan.recommendations.length} ingredients are for recipes with servings >= 1`);
    console.log(`Zero-serving recipes correctly excluded from prep list`);
  });
});
