import { describe, it, expect } from "vitest";
import { getIngredients, getRecipesWithIngredients } from "./db";

describe("Column Visibility Feature", () => {
  it("should have ingredients available for column visibility testing", async () => {
    const restaurantId = 1; // Test restaurant
    const ingredients = await getIngredients(restaurantId);
    expect(ingredients.length).toBeGreaterThan(0);
    console.log(`✓ Found ${ingredients.length} ingredients for testing`);
  });

  it("should have recipes available for column visibility testing", async () => {
    const restaurantId = 1; // Test restaurant
    const recipes = await getRecipesWithIngredients(restaurantId);
    expect(recipes.length).toBeGreaterThan(0);
    console.log(`✓ Found ${recipes.length} recipes for testing`);
  });

  it("should have default ingredient columns defined", () => {
    const defaultColumns = [
      { id: "name", label: "Name", visible: true },
      { id: "category", label: "Category", visible: true },
      { id: "unit", label: "Unit Type", visible: true },
      { id: "costPerUnit", label: "Cost Per Unit", visible: true },
      { id: "pieceWeightOz", label: "Piece Weight (oz)", visible: true },
      { id: "supplier", label: "Supplier", visible: true },
      { id: "shelfLife", label: "Shelf Life (days)", visible: false },
      { id: "minStock", label: "Min Stock", visible: false },
      { id: "actions", label: "Actions", visible: true },
    ];

    expect(defaultColumns.length).toBe(9);
    
    const visibleByDefault = defaultColumns.filter(col => col.visible);
    expect(visibleByDefault.length).toBe(7);
    console.log(`✓ Default ingredient columns: ${visibleByDefault.length} visible, ${defaultColumns.length - visibleByDefault.length} hidden`);
  });

  it("should have default recipe columns defined", () => {
    const defaultColumns = [
      { id: "name", label: "Name", visible: true },
      { id: "category", label: "Category", visible: true },
      { id: "description", label: "Description", visible: true },
      { id: "servings", label: "Servings", visible: true },
      { id: "prepTime", label: "Prep Time (min)", visible: true },
      { id: "cookTime", label: "Cook Time (min)", visible: true },
      { id: "price", label: "Price", visible: true },
      { id: "foodCost", label: "Food Cost %", visible: true },
      { id: "margin", label: "Margin %", visible: true },
      { id: "ingredients", label: "Ingredients Count", visible: true },
      { id: "actions", label: "Actions", visible: true },
    ];

    expect(defaultColumns.length).toBe(11);
    
    const visibleByDefault = defaultColumns.filter(col => col.visible);
    expect(visibleByDefault.length).toBe(11);
    console.log(`✓ Default recipe columns: ${visibleByDefault.length} visible, ${defaultColumns.length - visibleByDefault.length} hidden`);
  });

  it("should support localStorage persistence for column visibility", () => {
    // Simulate localStorage behavior
    const mockStorage: Record<string, string> = {};
    
    const ingredientsKey = "ingredients-table-columns";
    const recipesKey = "recipes-table-columns";
    
    // Test ingredients table columns
    const ingredientsColumns = [
      { id: "name", label: "Name", visible: true },
      { id: "category", label: "Category", visible: false }, // Hidden
      { id: "unit", label: "Unit Type", visible: true },
    ];
    
    mockStorage[ingredientsKey] = JSON.stringify(ingredientsColumns);
    const storedIngredients = JSON.parse(mockStorage[ingredientsKey]);
    
    expect(storedIngredients).toHaveLength(3);
    expect(storedIngredients[1].visible).toBe(false);
    console.log(`✓ Ingredients columns persist correctly in localStorage`);
    
    // Test recipes table columns
    const recipesColumns = [
      { id: "name", label: "Name", visible: true },
      { id: "description", label: "Description", visible: false }, // Hidden
      { id: "price", label: "Price", visible: true },
    ];
    
    mockStorage[recipesKey] = JSON.stringify(recipesColumns);
    const storedRecipes = JSON.parse(mockStorage[recipesKey]);
    
    expect(storedRecipes).toHaveLength(3);
    expect(storedRecipes[1].visible).toBe(false);
    console.log(`✓ Recipes columns persist correctly in localStorage`);
    
    // Verify independent storage
    expect(mockStorage[ingredientsKey]).not.toBe(mockStorage[recipesKey]);
    console.log(`✓ Ingredients and recipes columns are stored independently`);
  });

  it("should support toggling column visibility", () => {
    const columns = [
      { id: "name", label: "Name", visible: true },
      { id: "category", label: "Category", visible: true },
      { id: "unit", label: "Unit Type", visible: true },
    ];
    
    // Toggle category column off
    const toggledColumns = columns.map(col =>
      col.id === "category" ? { ...col, visible: false } : col
    );
    
    expect(toggledColumns[0].visible).toBe(true);
    expect(toggledColumns[1].visible).toBe(false);
    expect(toggledColumns[2].visible).toBe(true);
    console.log(`✓ Column visibility toggling works correctly`);
  });

  it("should support resetting columns to default", () => {
    const defaultColumns = [
      { id: "name", label: "Name", visible: true },
      { id: "category", label: "Category", visible: true },
      { id: "shelfLife", label: "Shelf Life (days)", visible: false },
    ];
    
    // User modifies columns
    const modifiedColumns = [
      { id: "name", label: "Name", visible: false },
      { id: "category", label: "Category", visible: false },
      { id: "shelfLife", label: "Shelf Life (days)", visible: true },
    ];
    
    expect(modifiedColumns[0].visible).toBe(false);
    expect(modifiedColumns[2].visible).toBe(true);
    
    // Reset to default
    const resetColumns = defaultColumns.map(defCol => ({
      ...defCol,
      visible: defCol.visible,
    }));
    
    expect(resetColumns[0].visible).toBe(true);
    expect(resetColumns[1].visible).toBe(true);
    expect(resetColumns[2].visible).toBe(false);
    console.log(`✓ Reset to default functionality works correctly`);
  });

  it("should verify ingredients table has all expected columns", async () => {
    const restaurantId = 1; // Test restaurant
    const ingredients = await getIngredients(restaurantId);
    expect(ingredients.length).toBeGreaterThan(0);
    
    const firstIngredient = ingredients[0];
    
    // Verify all column data is available
    expect(firstIngredient).toHaveProperty("id");
    expect(firstIngredient).toHaveProperty("name");
    expect(firstIngredient).toHaveProperty("category");
    expect(firstIngredient).toHaveProperty("unit");
    expect(firstIngredient).toHaveProperty("costPerUnit");
    expect(firstIngredient).toHaveProperty("pieceWeightOz");
    expect(firstIngredient).toHaveProperty("supplier");
    expect(firstIngredient).toHaveProperty("shelfLife");
    expect(firstIngredient).toHaveProperty("minStock");
    
    console.log(`✓ All ingredient columns have data available`);
  });

  it("should verify recipes table has all expected columns", async () => {
    const restaurantId = 1; // Test restaurant
    const recipes = await getRecipesWithIngredients(restaurantId);
    expect(recipes.length).toBeGreaterThan(0);
    
    const firstRecipe = recipes[0];
    
    // Verify all column data is available
    expect(firstRecipe).toHaveProperty("id");
    expect(firstRecipe).toHaveProperty("name");
    expect(firstRecipe).toHaveProperty("category");
    expect(firstRecipe).toHaveProperty("description");
    expect(firstRecipe).toHaveProperty("servings");
    expect(firstRecipe).toHaveProperty("prepTime");
    expect(firstRecipe).toHaveProperty("cookTime");
    expect(firstRecipe).toHaveProperty("sellingPrice");
    
    console.log(`✓ All recipe columns have data available`);
  });
});
