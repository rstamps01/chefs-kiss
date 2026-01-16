/**
 * Test to verify critical fields (id, totalCost) are always included in recipe CSV export
 * regardless of column visibility settings
 */

import { describe, it, expect } from "vitest";
import { recipesToCSV } from "./csv-helpers";

describe("Recipe Export Critical Fields", () => {
  it("should always include id and totalCost even when not in visible columns", () => {
    const recipes = [
      {
        id: 42,
        name: "California Roll",
        category: "Sushi",
        sellingPrice: "12.99",
        totalCost: "3.50",
        foodCostPercent: "26.94",
        marginPercent: "73.06",
        ingredients: [],
      },
    ];

    // Export with only name and category visible (id and totalCost hidden)
    const csv = recipesToCSV(recipes, ["name", "category"]);
    
    console.log("✓ Generated CSV with only name and category visible:");
    console.log(csv);
    
    const lines = csv.split("\n");
    const headers = lines[0].split(",");
    const values = lines[1].split(",");
    
    // Critical fields should still be present
    expect(headers).toContain("id");
    expect(headers).toContain("totalCost");
    
    // Also check the requested visible columns are present
    expect(headers).toContain("name");
    expect(headers).toContain("category");
    
    // Verify values
    const idIndex = headers.indexOf("id");
    const totalCostIndex = headers.indexOf("totalCost");
    const nameIndex = headers.indexOf("name");
    
    expect(values[idIndex]).toBe("42");
    expect(values[totalCostIndex]).toBe("3.50");
    expect(values[nameIndex]).toBe("California Roll");
    
    console.log("✓ Critical fields always included:");
    console.log(`  - Recipe ID: ${values[idIndex]}`);
    console.log(`  - Total Cost: $${values[totalCostIndex]}`);
  });

  it("should include id and totalCost at the beginning of CSV", () => {
    const recipes = [
      {
        id: 1,
        name: "Test Recipe",
        totalCost: "5.00",
        ingredients: [],
      },
    ];

    // Export with only name visible
    const csv = recipesToCSV(recipes, ["name"]);
    
    console.log("✓ Generated CSV:");
    console.log(csv);
    
    const lines = csv.split("\n");
    const headers = lines[0].split(",");
    
    // Critical fields should be at the beginning
    const idIndex = headers.indexOf("id");
    const totalCostIndex = headers.indexOf("totalCost");
    
    expect(idIndex).toBeLessThan(3); // Should be in first 3 columns
    expect(totalCostIndex).toBeLessThan(3); // Should be in first 3 columns
    
    console.log("✓ Critical fields positioned at beginning of CSV");
  });

  it("should not duplicate id and totalCost if already in visible columns", () => {
    const recipes = [
      {
        id: 1,
        name: "Test Recipe",
        totalCost: "5.00",
        ingredients: [],
      },
    ];

    // Export with id and totalCost explicitly included
    const csv = recipesToCSV(recipes, ["id", "name", "totalCost"]);
    
    console.log("✓ Generated CSV with explicit id and totalCost:");
    console.log(csv);
    
    const lines = csv.split("\n");
    const headers = lines[0].split(",");
    
    // Count occurrences of id and totalCost
    const idCount = headers.filter(h => h === "id").length;
    const totalCostCount = headers.filter(h => h === "totalCost").length;
    
    expect(idCount).toBe(1);
    expect(totalCostCount).toBe(1);
    
    console.log("✓ No duplicate critical fields");
  });

  it("should include all financial fields when exporting with minimal visible columns", () => {
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

    // Export with only name visible (simulating user hiding all other columns)
    const csv = recipesToCSV(recipes, ["name"]);
    
    console.log("✓ Generated CSV with only name visible:");
    console.log(csv);
    
    const lines = csv.split("\n");
    const headers = lines[0].split(",");
    
    // Critical fields must be present
    expect(headers).toContain("id");
    expect(headers).toContain("totalCost");
    
    // User's visible column must be present
    expect(headers).toContain("name");
    
    console.log("✓ Export includes critical fields plus user's visible columns:");
    console.log(`  Headers: ${headers.join(", ")}`);
  });

  it("should work correctly with default export (no visible columns specified)", () => {
    const recipes = [
      {
        id: 1,
        name: "Test Recipe",
        totalCost: "5.00",
        ingredients: [],
      },
    ];

    // Export without specifying visible columns (should include all fields)
    const csv = recipesToCSV(recipes);
    
    console.log("✓ Generated CSV with default export:");
    console.log(csv);
    
    const lines = csv.split("\n");
    const headers = lines[0].split(",");
    
    // All default columns should be present
    expect(headers).toContain("id");
    expect(headers).toContain("name");
    expect(headers).toContain("totalCost");
    
    console.log("✓ Default export includes all fields");
  });
});
