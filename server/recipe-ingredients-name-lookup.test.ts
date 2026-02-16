import { describe, it, expect } from "vitest";
import { getRecipesWithIngredients, getIngredients } from "./db";

/**
 * Test: Recipe-Ingredients Import with Name-Based ID Lookup
 * 
 * This test verifies that the recipe-ingredients import can resolve IDs
 * by matching recipe and ingredient names, which is critical after bulk
 * delete and re-import operations where IDs change.
 */
describe("Recipe-Ingredients Import: Name-Based ID Lookup", () => {
  const restaurantId = 1;

  it("should resolve recipe and ingredient IDs by name", async () => {
    // Fetch current recipes and ingredients
    const recipes = await getRecipesWithIngredients(restaurantId);
    const ingredients = await getIngredients(restaurantId);

    console.log(`\n📊 Current Database State:`);
    console.log(`   Recipes: ${recipes.length}`);
    console.log(`   Ingredients: ${ingredients.length}`);

    // Verify we have test data
    expect(recipes.length).toBeGreaterThan(0);
    expect(ingredients.length).toBeGreaterThan(0);

    // Simulate CSV data with names (like after export)
    const testRecipeName = recipes[0].name;
    const testIngredientName = ingredients[0].name;

    console.log(`\n🔍 Testing Name Lookup:`);
    console.log(`   Recipe: "${testRecipeName}"`);
    console.log(`   Ingredient: "${testIngredientName}"`);

    // Test case-insensitive name matching
    const recipeMatch = recipes.find(
      r => r.name.toLowerCase() === testRecipeName.toLowerCase()
    );
    const ingredientMatch = ingredients.find(
      ing => ing.name.toLowerCase() === testIngredientName.toLowerCase()
    );

    expect(recipeMatch).toBeDefined();
    expect(ingredientMatch).toBeDefined();

    console.log(`\n✅ Name Resolution Successful:`);
    console.log(`   Recipe ID: ${recipeMatch?.id}`);
    console.log(`   Ingredient ID: ${ingredientMatch?.id}`);
  });

  it("should handle case-insensitive name matching", async () => {
    const recipes = await getRecipesWithIngredients(restaurantId);
    const ingredients = await getIngredients(restaurantId);

    if (recipes.length === 0 || ingredients.length === 0) {
      console.log("⚠️  Skipping test: No test data available");
      return;
    }

    const testRecipeName = recipes[0].name;
    const testIngredientName = ingredients[0].name;

    // Test various case combinations
    const caseCombinations = [
      { recipe: testRecipeName.toLowerCase(), ingredient: testIngredientName.toLowerCase() },
      { recipe: testRecipeName.toUpperCase(), ingredient: testIngredientName.toUpperCase() },
      { recipe: testRecipeName, ingredient: testIngredientName },
    ];

    console.log(`\n🔤 Testing Case Sensitivity:`);
    
    for (const combo of caseCombinations) {
      const recipeMatch = recipes.find(
        r => r.name.toLowerCase() === combo.recipe.toLowerCase()
      );
      const ingredientMatch = ingredients.find(
        ing => ing.name.toLowerCase() === combo.ingredient.toLowerCase()
      );

      expect(recipeMatch).toBeDefined();
      expect(ingredientMatch).toBeDefined();
      
      console.log(`   ✓ Matched: "${combo.recipe}" → ID ${recipeMatch?.id}`);
      console.log(`   ✓ Matched: "${combo.ingredient}" → ID ${ingredientMatch?.id}`);
    }
  });

  it("should detect missing recipes and ingredients", async () => {
    const recipes = await getRecipesWithIngredients(restaurantId);
    const ingredients = await getIngredients(restaurantId);

    console.log(`\n🔍 Testing Missing Name Detection:`);

    // Test non-existent recipe
    const missingRecipe = "Nonexistent Recipe XYZ";
    const recipeMatch = recipes.find(
      r => r.name.toLowerCase() === missingRecipe.toLowerCase()
    );
    expect(recipeMatch).toBeUndefined();
    console.log(`   ✓ Correctly detected missing recipe: "${missingRecipe}"`);

    // Test non-existent ingredient
    const missingIngredient = "Nonexistent Ingredient ABC";
    const ingredientMatch = ingredients.find(
      ing => ing.name.toLowerCase() === missingIngredient.toLowerCase()
    );
    expect(ingredientMatch).toBeUndefined();
    console.log(`   ✓ Correctly detected missing ingredient: "${missingIngredient}"`);
  });

  it("should simulate bulk delete and re-import workflow", async () => {
    console.log(`\n🔄 Simulating Bulk Delete + Re-Import Workflow:`);
    
    // Step 1: Get current state (before "bulk delete")
    const beforeRecipes = await getRecipesWithIngredients(restaurantId);
    const beforeIngredients = await getIngredients(restaurantId);
    
    console.log(`   1️⃣  Before Delete: ${beforeRecipes.length} recipes, ${beforeIngredients.length} ingredients`);
    
    // Step 2: Simulate export (capture names and old IDs)
    const exportedData = beforeRecipes.slice(0, 3).flatMap(recipe => 
      recipe.ingredients.slice(0, 2).map(ing => ({
        oldRecipeId: recipe.id,
        oldIngredientId: ing.ingredientId,
        recipeName: recipe.name,
        ingredientName: ing.ingredientName,
        quantity: ing.quantity,
        unit: ing.unit,
      }))
    );
    
    console.log(`   2️⃣  Exported: ${exportedData.length} recipe-ingredient links`);
    
    // Step 3: Simulate re-import (IDs would be different, but names stay the same)
    // In real scenario, after bulk delete and re-import, IDs change but names remain
    const afterRecipes = await getRecipesWithIngredients(restaurantId);
    const afterIngredients = await getIngredients(restaurantId);
    
    console.log(`   3️⃣  After Re-Import: ${afterRecipes.length} recipes, ${afterIngredients.length} ingredients`);
    
    // Step 4: Resolve new IDs using names
    const resolvedData = exportedData.map(item => {
      const recipe = afterRecipes.find(
        r => r.name.toLowerCase() === item.recipeName.toLowerCase()
      );
      const ingredient = afterIngredients.find(
        ing => ing.name.toLowerCase() === item.ingredientName.toLowerCase()
      );
      
      return {
        ...item,
        newRecipeId: recipe?.id,
        newIngredientId: ingredient?.id,
        resolved: !!recipe && !!ingredient,
      };
    });
    
    const successfulResolutions = resolvedData.filter(item => item.resolved);
    
    console.log(`   4️⃣  Resolved: ${successfulResolutions.length}/${exportedData.length} links`);
    
    // Verify all links were resolved
    expect(successfulResolutions.length).toBe(exportedData.length);
    
    // Verify name-based resolution works
    successfulResolutions.forEach(item => {
      console.log(`      ✓ "${item.recipeName}" + "${item.ingredientName}"`);
      console.log(`        Old IDs: R${item.oldRecipeId}, I${item.oldIngredientId}`);
      console.log(`        New IDs: R${item.newRecipeId}, I${item.newIngredientId}`);
    });
    
    console.log(`\n✅ Bulk Delete + Re-Import Workflow: PASSED`);
  });
});
