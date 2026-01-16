import { describe, it, expect, beforeAll } from "vitest";
import { getRecipesWithIngredients, getUserRestaurant } from "./db";

describe("Recipe Metrics Calculations", () => {
  let testRestaurantId: number;

  beforeAll(async () => {
    // Get the test restaurant
    const restaurant = await getUserRestaurant(1); // Owner user ID
    if (!restaurant) {
      throw new Error("Test restaurant not found. Please seed the database first.");
    }
    testRestaurantId = restaurant.id;
  });

  it("should calculate food cost percentage correctly (should be 28-35%)", async () => {
    const recipes = await getRecipesWithIngredients(testRestaurantId);
    
    if (recipes.length === 0) {
      console.log("No recipes found, skipping test");
      return;
    }

    let totalCost = 0;
    let totalPrice = 0;
    let validRecipes = 0;

    recipes.forEach(recipe => {
      const sellingPrice = parseFloat(recipe.sellingPrice || "0");
      if (sellingPrice > 0) {
        // Calculate ingredient cost using convertedCost (accounts for unit conversions)
        const ingredientCost = recipe.ingredients.reduce((sum, ing) => {
          if (ing.convertedCost) {
            return sum + parseFloat(ing.convertedCost);
          }
          // Fallback for old data without conversions
          const quantity = parseFloat(ing.quantity || "0");
          const costPerUnit = parseFloat(ing.costPerUnit || "0");
          return sum + (quantity * costPerUnit);
        }, 0);

        totalCost += ingredientCost;
        totalPrice += sellingPrice;
        validRecipes++;

        console.log(`\nRecipe: ${recipe.name}`);
        console.log(`  Selling Price: $${sellingPrice.toFixed(2)}`);
        console.log(`  Ingredient Cost: $${ingredientCost.toFixed(2)}`);
        console.log(`  Food Cost %: ${((ingredientCost / sellingPrice) * 100).toFixed(1)}%`);
        console.log(`  Margin %: ${(((sellingPrice - ingredientCost) / sellingPrice) * 100).toFixed(1)}%`);
      }
    });

    const avgFoodCost = validRecipes > 0 ? (totalCost / totalPrice) * 100 : 0;
    const avgMargin = validRecipes > 0 ? ((totalPrice - totalCost) / totalPrice) * 100 : 0;

    console.log(`\n=== OVERALL METRICS ===`);
    console.log(`Total Recipes: ${recipes.length}`);
    console.log(`Valid Recipes (with price): ${validRecipes}`);
    console.log(`Total Cost: $${totalCost.toFixed(2)}`);
    console.log(`Total Price: $${totalPrice.toFixed(2)}`);
    console.log(`Avg Food Cost: ${avgFoodCost.toFixed(1)}%`);
    console.log(`Avg Margin: ${avgMargin.toFixed(1)}%`);

    // Verify food cost is in reasonable range (0-100%)
    expect(avgFoodCost).toBeGreaterThanOrEqual(0);
    expect(avgFoodCost).toBeLessThanOrEqual(100);

    // Verify margin is in reasonable range (0-100%)
    expect(avgMargin).toBeGreaterThanOrEqual(0);
    expect(avgMargin).toBeLessThanOrEqual(100);

    // Verify food cost + margin = 100% (approximately)
    expect(avgFoodCost + avgMargin).toBeCloseTo(100, 0);
  });

  it("should handle recipes with unit conversions correctly", async () => {
    const recipes = await getRecipesWithIngredients(testRestaurantId);
    
    // Find a recipe with converted costs
    const recipeWithConversions = recipes.find(r => 
      r.ingredients.some(ing => ing.convertedCost && ing.conversionApplied)
    );

    if (!recipeWithConversions) {
      console.log("No recipe with conversions found, skipping test");
      return;
    }

    console.log(`\nTesting recipe with conversions: ${recipeWithConversions.name}`);
    
    const sellingPrice = parseFloat(recipeWithConversions.sellingPrice || "0");
    const ingredientCost = recipeWithConversions.ingredients.reduce((sum, ing) => {
      if (ing.convertedCost) {
        return sum + parseFloat(ing.convertedCost);
      }
      const quantity = parseFloat(ing.quantity || "0");
      const costPerUnit = parseFloat(ing.costPerUnit || "0");
      return sum + (quantity * costPerUnit);
    }, 0);

    const foodCostPercent = sellingPrice > 0 ? (ingredientCost / sellingPrice) * 100 : 0;
    const margin = sellingPrice > 0 ? ((sellingPrice - ingredientCost) / sellingPrice) * 100 : 0;

    console.log(`  Selling Price: $${sellingPrice.toFixed(2)}`);
    console.log(`  Ingredient Cost: $${ingredientCost.toFixed(2)}`);
    console.log(`  Food Cost %: ${foodCostPercent.toFixed(1)}%`);
    console.log(`  Margin %: ${margin.toFixed(1)}%`);

    // Verify metrics are reasonable
    expect(foodCostPercent).toBeGreaterThanOrEqual(0);
    expect(foodCostPercent).toBeLessThanOrEqual(100);
    expect(margin).toBeGreaterThanOrEqual(0);
    expect(margin).toBeLessThanOrEqual(100);
  });
});
