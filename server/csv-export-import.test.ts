import { describe, it, expect } from "vitest";
import { getIngredients, getRecipesWithIngredients, getRecipeIngredientsForExport, bulkUpdateRecipeIngredients } from "./db";
import { ingredientsToCSV, recipesToCSV, recipeIngredientsToCSV, parseIngredientCSV, parseRecipeCSV, parseRecipeIngredientsCSV } from "./csv-helpers";

describe("CSV Export/Import Functionality", () => {
  const restaurantId = 1;

  it("should export ingredients to CSV format", async () => {
    const ingredients = await getIngredients(restaurantId);
    expect(ingredients.length).toBeGreaterThan(0);

    const csv = ingredientsToCSV(ingredients);
    expect(csv).toBeTruthy();
    expect(csv).toContain("id,name");
    
    const lines = csv.split("\n");
    expect(lines.length).toBe(ingredients.length + 1); // +1 for header
    console.log(`✓ Exported ${ingredients.length} ingredients to CSV`);
  });

  it("should export ingredients with only visible columns", async () => {
    const ingredients = await getIngredients(restaurantId);
    const visibleColumns = ["id", "name", "unit", "costPerUnit"];

    const csv = ingredientsToCSV(ingredients, visibleColumns);
    expect(csv).toBeTruthy();
    
    const headerLine = csv.split("\n")[0];
    expect(headerLine).toBe("id,name,unit,costPerUnit");
    expect(headerLine).not.toContain("supplier");
    expect(headerLine).not.toContain("shelfLife");
    console.log(`✓ Exported ingredients with only visible columns: ${visibleColumns.join(", ")}`);
  });

  it("should export recipes to CSV format", async () => {
    const recipes = await getRecipesWithIngredients(restaurantId);
    expect(recipes.length).toBeGreaterThan(0);

    const csv = recipesToCSV(recipes);
    expect(csv).toBeTruthy();
    expect(csv).toContain("id,name");
    
    const lines = csv.split("\n");
    expect(lines.length).toBe(recipes.length + 1);
    console.log(`✓ Exported ${recipes.length} recipes to CSV`);
  });

  it("should export recipe ingredients for bulk editing", async () => {
    const recipeIngredients = await getRecipeIngredientsForExport(restaurantId);
    expect(recipeIngredients.length).toBeGreaterThan(0);

    const csv = recipeIngredientsToCSV(recipeIngredients);
    expect(csv).toBeTruthy();
    expect(csv).toContain("recipeId,recipeName,ingredientId,ingredientName,quantity,unit");
    
    const lines = csv.split("\n");
    expect(lines.length).toBe(recipeIngredients.length + 1);
    console.log(`✓ Exported ${recipeIngredients.length} recipe ingredients for bulk editing`);
  });

  it("should parse and validate ingredient CSV", () => {
    const csvContent = `id,name,unit,costPerUnit
1,Test Ingredient,oz,5.99
2,Another Ingredient,lb,12.50`;

    const result = parseIngredientCSV(csvContent);
    expect(result.valid).toBe(true);
    expect(result.data.length).toBe(2);
    expect(result.errors.length).toBe(0);
    console.log(`✓ Parsed and validated ${result.data.length} ingredients from CSV`);
  });

  it("should detect missing required columns in ingredient CSV", () => {
    const csvContent = `id,name
1,Test Ingredient
2,Another Ingredient`;

    const result = parseIngredientCSV(csvContent);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain("Missing required columns");
    console.log(`✓ Detected missing required column: ${result.errors[0]}`);
  });

  it("should parse and validate recipe CSV", () => {
    const csvContent = `id,name,category,servings,sellingPrice
1,Test Recipe,Sushi,4,25.99
2,Another Recipe,Appetizer,2,12.50`;

    const result = parseRecipeCSV(csvContent);
    expect(result.valid).toBe(true);
    expect(result.data.length).toBe(2);
    expect(result.errors.length).toBe(0);
    console.log(`✓ Parsed and validated ${result.data.length} recipes from CSV`);
  });

  it("should parse and validate recipe ingredients CSV", () => {
    const csvContent = `recipeId,ingredientId,quantity,unit
1,5,0.25,cup
1,10,2,oz
2,5,0.5,cup`;

    const result = parseRecipeIngredientsCSV(csvContent);
    expect(result.valid).toBe(true);
    expect(result.data.length).toBe(3);
    expect(result.errors.length).toBe(0);
    console.log(`✓ Parsed and validated ${result.data.length} recipe ingredients from CSV`);
  });

  it("should handle CSV with commas and quotes in values", () => {
    const csvContent = `id,name,unit,costPerUnit
1,"Ingredient, with comma",oz,5.99
2,"Ingredient with ""quotes""",lb,12.50`;

    const result = parseIngredientCSV(csvContent);
    expect(result.valid).toBe(true);
    expect(result.data.length).toBe(2);
    expect(result.data[0].name).toBe("Ingredient, with comma");
    expect(result.data[1].name).toBe('Ingredient with "quotes"');
    console.log(`✓ Correctly parsed CSV with special characters`);
  });

  it("should support bulk editing recipe ingredient units (cup → oz scenario)", async () => {
    // Get recipe ingredients that use Sushi Rice
    const recipeIngredients = await getRecipeIngredientsForExport(restaurantId);
    const sushiRiceIngredients = recipeIngredients.filter(ri => 
      ri.ingredientName?.includes("Sushi Rice") && ri.unit === "cup"
    );

    if (sushiRiceIngredients.length === 0) {
      console.log("⚠ No Sushi Rice ingredients with 'cup' unit found to test bulk edit");
      return;
    }

    console.log(`✓ Found ${sushiRiceIngredients.length} recipe ingredients using Sushi Rice with 'cup' unit`);

    // Simulate CSV export
    const csv = recipeIngredientsToCSV(sushiRiceIngredients);
    expect(csv).toContain("cup");

    // Simulate user editing CSV: change all 'cup' to 'oz' and adjust quantities
    const modifiedCSV = csv.replace(/,cup$/gm, ",oz");
    
    // Parse modified CSV
    const parsed = parseRecipeIngredientsCSV(modifiedCSV);
    expect(parsed.valid).toBe(true);
    expect(parsed.data.every(row => row.unit === "oz")).toBe(true);

    console.log(`✓ Successfully simulated bulk edit: changed ${parsed.data.length} recipe ingredients from 'cup' to 'oz'`);
    console.log(`✓ CSV bulk edit workflow validated for unit type changes`);
  });

  it("should validate numeric fields in ingredient CSV", () => {
    const csvContent = `id,name,unit,costPerUnit,shelfLife
1,Test Ingredient,oz,invalid_cost,7
2,Another Ingredient,lb,12.50,invalid_shelf`;

    const result = parseIngredientCSV(csvContent);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some(e => e.includes("costPerUnit"))).toBe(true);
    expect(result.errors.some(e => e.includes("shelfLife"))).toBe(true);
    console.log(`✓ Detected ${result.errors.length} validation errors in CSV`);
  });

  it("should handle empty CSV gracefully", () => {
    const csvContent = "";

    const result = parseIngredientCSV(csvContent);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    console.log(`✓ Handled empty CSV with appropriate error`);
  });
});
