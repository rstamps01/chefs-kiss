/**
 * Test to verify recipe CSV export includes all required financial fields
 */

import { describe, it, expect } from "vitest";
import { recipesToCSV } from "./csv-helpers";

describe("Recipe Export Financial Fields", () => {
  it("should include recipe ID, price, food cost, and margin in default export", () => {
    const recipes = [
      {
        id: 42,
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
        ],
        totalCost: "3.50",
        foodCostPercent: "26.94",
        marginPercent: "73.06",
      },
    ];

    const csv = recipesToCSV(recipes);
    
    console.log("✓ Generated CSV:");
    console.log(csv);
    
    const lines = csv.split("\n");
    const headers = lines[0].split(",");
    const values = lines[1].split(",");
    
    // Check that all required fields are present in headers
    expect(headers).toContain("id");
    expect(headers).toContain("sellingPrice");
    expect(headers).toContain("totalCost");
    expect(headers).toContain("foodCostPercent");
    expect(headers).toContain("marginPercent");
    
    // Check that values are correct
    const idIndex = headers.indexOf("id");
    const priceIndex = headers.indexOf("sellingPrice");
    const costIndex = headers.indexOf("totalCost");
    const foodCostPercentIndex = headers.indexOf("foodCostPercent");
    const marginPercentIndex = headers.indexOf("marginPercent");
    
    expect(values[idIndex]).toBe("42");
    expect(values[priceIndex]).toBe("12.99");
    expect(values[costIndex]).toBe("3.50");
    expect(values[foodCostPercentIndex]).toBe("26.94");
    expect(values[marginPercentIndex]).toBe("73.06");
    
    console.log("✓ All financial fields present and correct:");
    console.log(`  - Recipe ID: ${values[idIndex]}`);
    console.log(`  - Price: $${values[priceIndex]}`);
    console.log(`  - Food Cost: $${values[costIndex]}`);
    console.log(`  - Food Cost %: ${values[foodCostPercentIndex]}%`);
    console.log(`  - Margin %: ${values[marginPercentIndex]}%`);
  });

  it("should include financial fields even with column visibility filter", () => {
    const recipes = [
      {
        id: 1,
        name: "Test Recipe",
        category: "Test",
        sellingPrice: "19.99",
        totalCost: "5.50",
        foodCostPercent: "27.51",
        marginPercent: "72.49",
        ingredients: [],
      },
    ];

    // Export with specific visible columns including financial data
    const csv = recipesToCSV(recipes, ["id", "name", "sellingPrice", "totalCost", "foodCostPercent", "marginPercent"]);
    
    console.log("✓ Generated CSV with financial columns:");
    console.log(csv);
    
    const lines = csv.split("\n");
    const headers = lines[0].split(",");
    
    expect(headers).toEqual(["id", "name", "sellingPrice", "totalCost", "foodCostPercent", "marginPercent"]);
    
    console.log("✓ Financial columns correctly included in filtered export");
  });

  it("should handle recipes with missing financial data gracefully", () => {
    const recipes = [
      {
        id: 1,
        name: "Incomplete Recipe",
        category: "Test",
        // Missing sellingPrice, totalCost, foodCostPercent, marginPercent
        ingredients: [],
      },
    ];

    const csv = recipesToCSV(recipes);
    
    console.log("✓ Generated CSV for recipe with missing financial data:");
    console.log(csv);
    
    const lines = csv.split("\n");
    const headers = lines[0].split(",");
    
    // Headers should still include financial fields
    expect(headers).toContain("id");
    expect(headers).toContain("sellingPrice");
    expect(headers).toContain("totalCost");
    expect(headers).toContain("foodCostPercent");
    expect(headers).toContain("marginPercent");
    
    console.log("✓ Financial field columns present even when data is missing");
  });
});
