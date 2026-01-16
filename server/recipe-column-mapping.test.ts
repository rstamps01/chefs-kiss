/**
 * Test to verify frontend column IDs are correctly mapped to backend field names
 */

import { describe, it, expect } from "vitest";
import { recipesToCSV } from "./csv-helpers";

describe("Recipe Export Column Mapping", () => {
  it("should map frontend 'price' column to backend 'sellingPrice' field", () => {
    const recipes = [
      {
        id: 1,
        name: "Test Recipe",
        sellingPrice: "19.99",
        ingredients: [],
      },
    ];

    // Frontend sends "price" as the column ID
    const csv = recipesToCSV(recipes, ["name", "price"]);
    
    console.log("✓ Generated CSV with 'price' column:");
    console.log(csv);
    
    const lines = csv.split("\n");
    const headers = lines[0].split(",");
    const values = lines[1].split(",");
    
    // Backend should map "price" → "sellingPrice"
    expect(headers).toContain("sellingPrice");
    expect(headers).not.toContain("price");
    
    const priceIndex = headers.indexOf("sellingPrice");
    expect(values[priceIndex]).toBe("19.99");
    
    console.log("✓ Frontend 'price' correctly mapped to backend 'sellingPrice'");
  });

  it("should map frontend 'foodCost' column to backend 'foodCostPercent' field", () => {
    const recipes = [
      {
        id: 1,
        name: "Test Recipe",
        foodCostPercent: "27.51",
        ingredients: [],
      },
    ];

    // Frontend sends "foodCost" as the column ID
    const csv = recipesToCSV(recipes, ["name", "foodCost"]);
    
    console.log("✓ Generated CSV with 'foodCost' column:");
    console.log(csv);
    
    const lines = csv.split("\n");
    const headers = lines[0].split(",");
    
    // Backend should map "foodCost" → "foodCostPercent"
    expect(headers).toContain("foodCostPercent");
    expect(headers).not.toContain("foodCost");
    
    console.log("✓ Frontend 'foodCost' correctly mapped to backend 'foodCostPercent'");
  });

  it("should map frontend 'margin' column to backend 'marginPercent' field", () => {
    const recipes = [
      {
        id: 1,
        name: "Test Recipe",
        marginPercent: "72.49",
        ingredients: [],
      },
    ];

    // Frontend sends "margin" as the column ID
    const csv = recipesToCSV(recipes, ["name", "margin"]);
    
    console.log("✓ Generated CSV with 'margin' column:");
    console.log(csv);
    
    const lines = csv.split("\n");
    const headers = lines[0].split(",");
    
    // Backend should map "margin" → "marginPercent"
    expect(headers).toContain("marginPercent");
    expect(headers).not.toContain("margin");
    
    console.log("✓ Frontend 'margin' correctly mapped to backend 'marginPercent'");
  });

  it("should map all frontend financial columns correctly", () => {
    const recipes = [
      {
        id: 42,
        name: "California Roll",
        sellingPrice: "12.99",
        totalCost: "3.50",
        foodCostPercent: "26.94",
        marginPercent: "73.06",
        ingredients: [],
      },
    ];

    // Frontend sends: id, name, price, totalCost, foodCost, margin
    const csv = recipesToCSV(recipes, ["id", "name", "price", "totalCost", "foodCost", "margin"]);
    
    console.log("✓ Generated CSV with all frontend financial columns:");
    console.log(csv);
    
    const lines = csv.split("\n");
    const headers = lines[0].split(",");
    const values = lines[1].split(",");
    
    // Verify all mappings
    expect(headers).toEqual(["id", "name", "sellingPrice", "totalCost", "foodCostPercent", "marginPercent"]);
    
    // Verify values
    expect(values[0]).toBe("42");
    expect(values[1]).toBe("California Roll");
    expect(values[2]).toBe("12.99");
    expect(values[3]).toBe("3.50");
    expect(values[4]).toBe("26.94");
    expect(values[5]).toBe("73.06");
    
    console.log("✓ All frontend columns correctly mapped:");
    console.log("  - id → id");
    console.log("  - name → name");
    console.log("  - price → sellingPrice");
    console.log("  - totalCost → totalCost");
    console.log("  - foodCost → foodCostPercent");
    console.log("  - margin → marginPercent");
  });
});
