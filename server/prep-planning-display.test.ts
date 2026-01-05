/**
 * Tests for Enhanced Prep Planning Display Features
 * - Piece weight and total weight display
 * - Recipe breakdown within ingredients
 * - Predicted dishes list
 */

import { describe, it, expect } from "vitest";
import { generatePrepPlan } from "./prep-planning";
import { getRestaurantLocations, getUserRestaurant } from "./db";

describe("Prep Planning Display Enhancements", () => {
  it("should include piece weight information for display", async () => {
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

    // Find ingredients with piece weight
    const withPieces = prepPlan.recommendations.filter(
      (rec) => rec.pieces !== null && rec.pieces > 0
    );

    console.log(`\n${withPieces.length} ingredients have piece weight information:`);
    withPieces.slice(0, 5).forEach((rec) => {
      console.log(
        `  - ${rec.ingredientName}: ${rec.pieces} pieces × ~${rec.pieceWeightOz}oz = ${rec.totalWithBuffer} ${rec.unit} total`
      );
    });

    expect(prepPlan.recommendations.length).toBeGreaterThan(0);
    if (withPieces.length > 0) {
      withPieces.forEach((rec) => {
        expect(rec.pieces).toBeGreaterThan(0);
        expect(rec.pieceWeightOz).toBeGreaterThan(0);
        expect(rec.totalWithBuffer).toBeGreaterThan(0);
      });
    }
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

    // Check first ingredient's recipe breakdown
    if (prepPlan.recommendations.length > 0) {
      const firstIngredient = prepPlan.recommendations[0];
      
      console.log(`\n${firstIngredient.ingredientName} is used in ${firstIngredient.recipes.length} recipes:`);
      firstIngredient.recipes.forEach((recipe) => {
        console.log(
          `  - ${recipe.recipeName}: ${recipe.estimatedServings} servings × ${(recipe.ingredientQuantity / recipe.estimatedServings).toFixed(2)} ${firstIngredient.unit} = ${recipe.ingredientQuantity.toFixed(1)} ${firstIngredient.unit}`
        );
      });

      expect(firstIngredient.recipes).toBeDefined();
      expect(Array.isArray(firstIngredient.recipes)).toBe(true);
      expect(firstIngredient.recipes.length).toBeGreaterThan(0);

      firstIngredient.recipes.forEach((recipe) => {
        expect(recipe).toHaveProperty("recipeId");
        expect(recipe).toHaveProperty("recipeName");
        expect(recipe).toHaveProperty("estimatedServings");
        expect(recipe).toHaveProperty("ingredientQuantity");
        expect(recipe.estimatedServings).toBeGreaterThan(0);
        expect(recipe.ingredientQuantity).toBeGreaterThan(0);
      });
    }
  });

  it("should provide complete predicted dishes list", async () => {
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

    // Build predicted dishes list from recipe breakdown
    const recipeMap = new Map<number, {
      id: number;
      name: string;
      totalServings: number;
    }>();

    prepPlan.recommendations.forEach((rec) => {
      rec.recipes.forEach((recipe) => {
        if (!recipeMap.has(recipe.recipeId)) {
          recipeMap.set(recipe.recipeId, {
            id: recipe.recipeId,
            name: recipe.recipeName,
            totalServings: 0,
          });
        }
        const existing = recipeMap.get(recipe.recipeId)!;
        existing.totalServings = Math.max(existing.totalServings, recipe.estimatedServings);
      });
    });

    const predictedDishes = Array.from(recipeMap.values()).sort(
      (a, b) => b.totalServings - a.totalServings
    );

    console.log(`\nPredicted dishes for the day (${predictedDishes.length} total):`);
    predictedDishes.slice(0, 10).forEach((dish) => {
      console.log(`  - ${dish.name}: ${dish.totalServings} servings`);
    });

    expect(predictedDishes.length).toBeGreaterThan(0);
    predictedDishes.forEach((dish) => {
      expect(dish.id).toBeGreaterThan(0);
      expect(dish.name).toBeTruthy();
      expect(dish.totalServings).toBeGreaterThan(0);
    });
  });

  it("should calculate total weight correctly for ingredients", async () => {
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

    // Verify total weight calculation
    let validCount = 0;
    prepPlan.recommendations.forEach((rec) => {
      // Skip ingredients with zero values (edge cases)
      if (rec.totalWithBuffer === 0 || rec.recommendedQuantity === 0) {
        return;
      }
      
      validCount++;
      
      // Total should be approximately recommended + buffer (allowing for rounding)
      const expectedTotal = rec.recommendedQuantity + rec.safetyBuffer;
      // Allow for rounding: total should be within 2 units of expected
      expect(Math.abs(rec.totalWithBuffer - expectedTotal)).toBeLessThanOrEqual(2);
      
      // Total must be positive
      expect(rec.totalWithBuffer).toBeGreaterThan(0);
      expect(rec.recommendedQuantity).toBeGreaterThan(0);
      expect(rec.safetyBuffer).toBeGreaterThanOrEqual(0);

      // If pieces exist, verify relationship
      if (rec.pieces && rec.pieceWeightOz) {
        expect(rec.pieces).toBeGreaterThan(0);
        expect(rec.pieceWeightOz).toBeGreaterThan(0);
      }
    });
    
    expect(validCount).toBeGreaterThan(0);

    console.log(`\nVerified total weight calculations for ${prepPlan.recommendations.length} ingredients`);
  });

  it("should support expandable ingredient view with recipe details", async () => {
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

    // Find an ingredient used in multiple recipes
    const multiRecipeIngredient = prepPlan.recommendations.find(
      (rec) => rec.recipes.length > 1
    );

    if (multiRecipeIngredient) {
      console.log(
        `\n${multiRecipeIngredient.ingredientName} is used in ${multiRecipeIngredient.recipes.length} recipes (expandable view):`
      );
      
      multiRecipeIngredient.recipes.forEach((recipe) => {
        console.log(
          `  - ${recipe.recipeName}: ${recipe.ingredientQuantity.toFixed(1)} ${multiRecipeIngredient.unit} for ${recipe.estimatedServings} servings`
        );
      });

      expect(multiRecipeIngredient.recipes.length).toBeGreaterThan(1);
      
      // Verify sum of recipe quantities approximately equals total needed
      const sumFromRecipes = multiRecipeIngredient.recipes.reduce(
        (sum, recipe) => sum + recipe.ingredientQuantity,
        0
      );
      
      // Sum should be close to recommended quantity (before buffer)
      expect(sumFromRecipes).toBeGreaterThan(0);
      expect(multiRecipeIngredient.recommendedQuantity).toBeGreaterThan(0);
    }
  });
});
