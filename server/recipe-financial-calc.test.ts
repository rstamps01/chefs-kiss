/**
 * Test recipe financial calculations (totalCost, foodCostPercent, marginPercent)
 */

import { describe, it, expect } from "vitest";
import { getRecipesWithIngredients } from "./db";

describe("Recipe Financial Calculations", () => {
  it("should calculate financial fields for recipes with ingredients", async () => {
    // Use restaurant ID 1 (assuming it exists from seed data)
    const recipesData = await getRecipesWithIngredients(1);

    console.log(`✓ Found ${recipesData.length} recipes`);

    // Find a recipe with ingredients and selling price
    const recipeWithData = recipesData.find(
      (r) => r.ingredients.length > 0 && Number(r.sellingPrice || 0) > 0
    );

    if (recipeWithData) {
      console.log(`\n✓ Testing recipe: "${recipeWithData.name}"`);
      console.log(`  - Selling Price: $${recipeWithData.sellingPrice}`);
      console.log(`  - Ingredients: ${recipeWithData.ingredients.length}`);
      console.log(`  - Total Cost: $${recipeWithData.totalCost}`);
      console.log(`  - Food Cost %: ${recipeWithData.foodCostPercent}%`);
      console.log(`  - Margin %: ${recipeWithData.marginPercent}%`);

      // Verify fields are calculated
      expect(recipeWithData.totalCost).toBeDefined();
      expect(recipeWithData.foodCostPercent).toBeDefined();
      expect(recipeWithData.marginPercent).toBeDefined();

      // Verify values are numeric strings
      expect(Number(recipeWithData.totalCost)).toBeGreaterThanOrEqual(0);
      expect(Number(recipeWithData.foodCostPercent)).toBeGreaterThanOrEqual(0);
      expect(Number(recipeWithData.marginPercent)).toBeGreaterThanOrEqual(0);

      // Verify calculation logic
      const totalCost = Number(recipeWithData.totalCost);
      const sellingPrice = Number(recipeWithData.sellingPrice);
      const foodCostPercent = Number(recipeWithData.foodCostPercent);
      const marginPercent = Number(recipeWithData.marginPercent);

      if (sellingPrice > 0) {
        const expectedFoodCost = (totalCost / sellingPrice) * 100;
        const expectedMargin = ((sellingPrice - totalCost) / sellingPrice) * 100;

        expect(foodCostPercent).toBeCloseTo(expectedFoodCost, 1);
        expect(marginPercent).toBeCloseTo(expectedMargin, 1);

        console.log(`\n✓ Financial calculations verified:`);
        console.log(`  - Food Cost % matches: ${foodCostPercent.toFixed(2)}% ≈ ${expectedFoodCost.toFixed(2)}%`);
        console.log(`  - Margin % matches: ${marginPercent.toFixed(2)}% ≈ ${expectedMargin.toFixed(2)}%`);
      }
    } else {
      console.log("⚠ No recipes with ingredients and selling price found");
    }
  });

  it("should handle recipes without selling price", async () => {
    const recipesData = await getRecipesWithIngredients(1);

    const recipeWithoutPrice = recipesData.find(
      (r) => !r.sellingPrice || Number(r.sellingPrice) === 0
    );

    if (recipeWithoutPrice) {
      console.log(`\n✓ Testing recipe without price: "${recipeWithoutPrice.name}"`);
      console.log(`  - Total Cost: $${recipeWithoutPrice.totalCost}`);
      console.log(`  - Food Cost %: ${recipeWithoutPrice.foodCostPercent}%`);
      console.log(`  - Margin %: ${recipeWithoutPrice.marginPercent}%`);

      // Should have 0% for percentages when no selling price
      expect(recipeWithoutPrice.foodCostPercent).toBe("0.00");
      expect(recipeWithoutPrice.marginPercent).toBe("0.00");

      console.log(`✓ Recipes without selling price handled correctly (0% for percentages)`);
    } else {
      console.log("⚠ All recipes have selling prices");
    }
  });

  it("should handle recipes without ingredients", async () => {
    const recipesData = await getRecipesWithIngredients(1);

    const recipeWithoutIngredients = recipesData.find(
      (r) => r.ingredients.length === 0
    );

    if (recipeWithoutIngredients) {
      console.log(`\n✓ Testing recipe without ingredients: "${recipeWithoutIngredients.name}"`);
      console.log(`  - Total Cost: $${recipeWithoutIngredients.totalCost}`);
      console.log(`  - Food Cost %: ${recipeWithoutIngredients.foodCostPercent}%`);
      console.log(`  - Margin %: ${recipeWithoutIngredients.marginPercent}%`);

      // Should have $0 total cost
      expect(recipeWithoutIngredients.totalCost).toBe("0.00");

      console.log(`✓ Recipes without ingredients handled correctly (totalCost = $0.00)`);
    } else {
      console.log("⚠ All recipes have ingredients");
    }
  });

  it("should calculate totalCost as sum of ingredient costs", async () => {
    const recipesData = await getRecipesWithIngredients(1);

    const recipeWithIngredients = recipesData.find(
      (r) => r.ingredients.length > 0 && r.ingredients.some(ing => Number(ing.convertedCost || 0) > 0)
    );

    if (recipeWithIngredients) {
      console.log(`\n✓ Verifying totalCost calculation for: "${recipeWithIngredients.name}"`);
      
      // Calculate sum manually
      const manualSum = recipeWithIngredients.ingredients.reduce(
        (sum, ing) => sum + Number(ing.convertedCost || 0),
        0
      );

      const totalCost = Number(recipeWithIngredients.totalCost);

      console.log(`  - Ingredients:`);
      recipeWithIngredients.ingredients.forEach((ing) => {
        console.log(`    * ${ing.ingredientName}: $${ing.convertedCost}`);
      });
      console.log(`  - Manual sum: $${manualSum.toFixed(2)}`);
      console.log(`  - Calculated totalCost: $${totalCost.toFixed(2)}`);

      expect(totalCost).toBeCloseTo(manualSum, 2);

      console.log(`✓ Total cost matches sum of ingredient costs`);
    } else {
      console.log("⚠ No recipes with costed ingredients found");
    }
  });
});
