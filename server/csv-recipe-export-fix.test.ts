/**
 * Tests for Recipe CSV Export Fix
 * 
 * Verifies that recipe CSV export properly handles complex fields like ingredients array
 * and excludes UI-only columns like "actions".
 */

import { describe, it, expect } from "vitest";
import { recipesToCSV } from "./csv-helpers";

describe("Recipe CSV Export Fix", () => {
  it("should convert ingredients array to ingredientsCount", () => {
    const recipes = [
      {
        id: 1,
        name: "California Roll",
        category: "Sushi",
        description: "Classic sushi roll",
        servings: 8,
        prepTime: 15,
        cookTime: 0,
        sellingPrice: "12.99",
        ingredients: [
          { ingredientId: 1, ingredientName: "Sushi Rice", quantity: 0.25, unit: "cup" },
          { ingredientId: 2, ingredientName: "Nori Sheets", quantity: 2, unit: "pc" },
          { ingredientId: 3, ingredientName: "Crab Meat", quantity: 4, unit: "oz" },
        ],
        totalCost: "3.50",
        foodCostPercent: "26.94",
        marginPercent: "73.06",
      },
    ];

    const csv = recipesToCSV(recipes);
    
    console.log("✓ Generated CSV:");
    console.log(csv);
    
    // Check that CSV doesn't contain "[object Object]"
    expect(csv).not.toContain("[object Object]");
    
    // Check that CSV contains ingredientsCount column
    expect(csv).toContain("ingredientsCount");
    
    // Check that ingredientsCount value is 3 (number of ingredients)
    const lines = csv.split("\n");
    const headers = lines[0].split(",");
    const values = lines[1].split(",");
    const ingredientsCountIndex = headers.indexOf("ingredientsCount");
    expect(ingredientsCountIndex).toBeGreaterThan(-1);
    expect(values[ingredientsCountIndex]).toBe("3");
    
    console.log("✓ Ingredients array correctly converted to count: 3");
  });

  it("should exclude 'actions' column from CSV export", () => {
    const recipes = [
      {
        id: 1,
        name: "Test Recipe",
        category: "Test",
        ingredients: [],
      },
    ];

    const csv = recipesToCSV(recipes, ["name", "category", "actions"]);
    
    console.log("✓ Generated CSV with actions column requested:");
    console.log(csv);
    
    // Check that CSV doesn't contain "actions" column
    expect(csv).not.toContain("actions");
    
    // Check that CSV contains name and category
    expect(csv).toContain("name");
    expect(csv).toContain("category");
    
    console.log("✓ Actions column correctly excluded from export");
  });

  it("should exclude 'ingredients' column from CSV export", () => {
    const recipes = [
      {
        id: 1,
        name: "Test Recipe",
        category: "Test",
        ingredients: [
          { ingredientId: 1, ingredientName: "Test Ingredient", quantity: 1, unit: "cup" },
        ],
      },
    ];

    const csv = recipesToCSV(recipes, ["name", "category", "ingredients"]);
    
    console.log("✓ Generated CSV with ingredients column requested:");
    console.log(csv);
    
    // Check that CSV doesn't contain raw "ingredients" column
    const lines = csv.split("\n");
    const headers = lines[0].split(",");
    expect(headers).not.toContain("ingredients");
    
    // But should have ingredientsCount instead
    expect(headers).toContain("ingredientsCount");
    
    console.log("✓ Ingredients column correctly excluded, ingredientsCount included");
  });

  it("should handle recipes with no ingredients", () => {
    const recipes = [
      {
        id: 1,
        name: "Empty Recipe",
        category: "Test",
        ingredients: [],
      },
    ];

    const csv = recipesToCSV(recipes);
    
    console.log("✓ Generated CSV for recipe with no ingredients:");
    console.log(csv);
    
    // Check that ingredientsCount is 0
    const lines = csv.split("\n");
    const headers = lines[0].split(",");
    const values = lines[1].split(",");
    const ingredientsCountIndex = headers.indexOf("ingredientsCount");
    expect(values[ingredientsCountIndex]).toBe("0");
    
    console.log("✓ Empty ingredients array correctly shows count: 0");
  });

  it("should handle recipes with missing ingredients field", () => {
    const recipes = [
      {
        id: 1,
        name: "Recipe Without Ingredients Field",
        category: "Test",
        // No ingredients field at all
      },
    ];

    const csv = recipesToCSV(recipes);
    
    console.log("✓ Generated CSV for recipe without ingredients field:");
    console.log(csv);
    
    // Should not throw error and should set ingredientsCount to 0
    const lines = csv.split("\n");
    const headers = lines[0].split(",");
    const values = lines[1].split(",");
    const ingredientsCountIndex = headers.indexOf("ingredientsCount");
    expect(values[ingredientsCountIndex]).toBe("0");
    
    console.log("✓ Missing ingredients field correctly defaults to count: 0");
  });

  it("should export all scalar recipe fields correctly", () => {
    const recipes = [
      {
        id: 42,
        name: "Full Recipe",
        category: "Sushi",
        description: "A complete recipe with all fields",
        servings: 8,
        prepTime: 15,
        cookTime: 10,
        sellingPrice: "19.99",
        ingredients: [
          { ingredientId: 1, ingredientName: "Ingredient 1", quantity: 1, unit: "cup" },
          { ingredientId: 2, ingredientName: "Ingredient 2", quantity: 2, unit: "oz" },
        ],
        totalCost: "5.50",
        foodCostPercent: "27.51",
        marginPercent: "72.49",
      },
    ];

    const csv = recipesToCSV(recipes);
    
    console.log("✓ Generated CSV with all fields:");
    console.log(csv);
    
    const lines = csv.split("\n");
    const headers = lines[0].split(",");
    const values = lines[1].split(",");
    
    // Verify all expected columns are present
    expect(headers).toContain("id");
    expect(headers).toContain("name");
    expect(headers).toContain("category");
    expect(headers).toContain("description");
    expect(headers).toContain("servings");
    expect(headers).toContain("prepTime");
    expect(headers).toContain("cookTime");
    expect(headers).toContain("sellingPrice");
    expect(headers).toContain("ingredientsCount");
    expect(headers).toContain("totalCost");
    expect(headers).toContain("foodCostPercent");
    expect(headers).toContain("marginPercent");
    
    // Verify values are correct
    const idIndex = headers.indexOf("id");
    const nameIndex = headers.indexOf("name");
    const ingredientsCountIndex = headers.indexOf("ingredientsCount");
    
    expect(values[idIndex]).toBe("42");
    expect(values[nameIndex]).toBe("Full Recipe");
    expect(values[ingredientsCountIndex]).toBe("2");
    
    console.log("✓ All scalar fields correctly exported with proper values");
  });

  it("should respect visible columns filter", () => {
    const recipes = [
      {
        id: 1,
        name: "Test Recipe",
        category: "Test",
        description: "Should not appear",
        ingredients: [],
      },
    ];

    const csv = recipesToCSV(recipes, ["id", "name", "category"]);
    
    console.log("✓ Generated CSV with visible columns filter:");
    console.log(csv);
    
    const lines = csv.split("\n");
    const headers = lines[0].split(",");
    
    // Should only have id, name, category
    expect(headers).toContain("id");
    expect(headers).toContain("name");
    expect(headers).toContain("category");
    expect(headers).not.toContain("description");
    
    console.log("✓ Visible columns filter correctly applied");
  });
});
