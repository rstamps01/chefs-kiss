import { describe, it, expect } from "vitest";
import { getRecipesWithIngredients, updateRecipe, getActiveRecipeCategories } from "./db";

describe("Recipes Table View", () => {
  it("should fetch all recipes with necessary fields for table view", async () => {
    const recipes = await getRecipesWithIngredients(1); // User ID 1
    
    expect(recipes).toBeDefined();
    expect(Array.isArray(recipes)).toBe(true);
    
    if (recipes.length > 0) {
      const recipe = recipes[0];
      expect(recipe).toHaveProperty("id");
      expect(recipe).toHaveProperty("name");
      expect(recipe).toHaveProperty("category");
      expect(recipe).toHaveProperty("description");
      expect(recipe).toHaveProperty("servings");
      expect(recipe).toHaveProperty("prepTime");
      expect(recipe).toHaveProperty("cookTime");
      expect(recipe).toHaveProperty("sellingPrice");
      expect(recipe).toHaveProperty("ingredients");
    }
    
    console.log(`✓ Found ${recipes.length} recipes for table view`);
  });

  it("should fetch available categories for dropdown", async () => {
    const categories = await getActiveRecipeCategories(1); // User ID 1
    
    expect(categories).toBeDefined();
    expect(Array.isArray(categories)).toBe(true);
    
    console.log(`✓ Found ${categories.length} categories for dropdown`);
  });

  it("should update recipe name via inline editing", async () => {
    const recipes = await getRecipesWithIngredients(1);
    
    if (recipes.length === 0) {
      console.log("⊘ No recipes to test inline editing");
      return;
    }
    
    const testRecipe = recipes[0];
    const originalName = testRecipe.name;
    const newName = `${originalName} (Table Edit Test)`;
    
    // Update name
    const result = await updateRecipe(testRecipe.id, {
      name: newName,
    });
    
    expect(result).toBeDefined();
    
    // Verify update
    const updatedRecipes = await getRecipesWithIngredients(1);
    const updatedRecipe = updatedRecipes.find(r => r.id === testRecipe.id);
    expect(updatedRecipe?.name).toBe(newName);
    
    // Restore original name
    await updateRecipe(testRecipe.id, {
      name: originalName,
    });
    
    console.log(`✓ Successfully updated recipe name via inline editing`);
  });

  it("should update recipe category via dropdown", async () => {
    const recipes = await getRecipesWithIngredients(1);
    const categories = await getActiveRecipeCategories(1);
    
    if (recipes.length === 0 || categories.length === 0) {
      console.log("⊘ No recipes or categories to test dropdown");
      return;
    }
    
    const testRecipe = recipes[0];
    const originalCategory = testRecipe.category;
    // getActiveRecipeCategories returns objects with 'category' field
    const categoryNames = categories.map((c: any) => c.category);
    const newCategory = categoryNames.find((c: string) => c !== originalCategory);
    
    if (!newCategory) {
      console.log("⊘ No different category available to test dropdown");
      return;
    }
    
    // Update category
    const result = await updateRecipe(testRecipe.id, {
      category: newCategory,
    });
    
    expect(result).toBeDefined();
    
    // Verify update
    const updatedRecipes = await getRecipesWithIngredients(1);
    const updatedRecipe = updatedRecipes.find(r => r.id === testRecipe.id);
    expect(updatedRecipe?.category).toBe(newCategory);
    
    // Restore original category
    if (originalCategory) {
      await updateRecipe(testRecipe.id, {
        category: originalCategory,
      });
    }
    
    console.log(`✓ Successfully updated recipe category via dropdown`);
  });

  it("should update recipe selling price via inline editing", async () => {
    const recipes = await getRecipesWithIngredients(1);
    
    if (recipes.length === 0) {
      console.log("⊘ No recipes to test price editing");
      return;
    }
    
    const testRecipe = recipes[0];
    const originalPrice = testRecipe.sellingPrice;
    const newPrice = "99.99";
    
    // Update price
    const result = await updateRecipe(testRecipe.id, {
      sellingPrice: newPrice,
    });
    
    expect(result).toBeDefined();
    
    // Verify update
    const updatedRecipes = await getRecipesWithIngredients(1);
    const updatedRecipe = updatedRecipes.find(r => r.id === testRecipe.id);
    expect(parseFloat(updatedRecipe?.sellingPrice || "0")).toBe(99.99);
    
    // Restore original price
    await updateRecipe(testRecipe.id, {
      sellingPrice: originalPrice,
    });
    
    console.log(`✓ Successfully updated recipe price via inline editing`);
  });
});
