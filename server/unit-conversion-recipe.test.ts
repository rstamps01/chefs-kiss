import { describe, it, expect } from "vitest";
import { getActiveIngredientUnits } from "./db";

describe("Recipe Unit Conversion Logic", () => {
  it("should allow gallon to fluid ounce conversion (same category)", async () => {
    const units = await getActiveIngredientUnits(1);
    
    // Find gallon and fluid ounce units
    const gallon = units.find(u => u.name === 'gal');
    const fluidOunce = units.find(u => u.name === 'fl oz');
    
    expect(gallon).toBeDefined();
    expect(fluidOunce).toBeDefined();
    
    console.log(`\nGallon: categoryId = ${gallon?.categoryId}`);
    console.log(`Fluid Ounce: categoryId = ${fluidOunce?.categoryId}`);
    
    // They should have the same categoryId (Volume = 2)
    expect(gallon?.categoryId).toBe(2);
    expect(fluidOunce?.categoryId).toBe(2);
    expect(gallon?.categoryId).toBe(fluidOunce?.categoryId);
    
    // Simulate the RecipeEditModal logic
    const ingredientCategoryId = gallon?.categoryId;
    const disabledUnits = new Set<string>();
    
    if (ingredientCategoryId) {
      units.forEach(unit => {
        if (unit.categoryId !== ingredientCategoryId) {
          disabledUnits.add(unit.name);
        }
      });
    }
    
    console.log(`\nDisabled units when ingredient is gallon: ${Array.from(disabledUnits).join(', ')}`);
    console.log(`Is fl oz disabled? ${disabledUnits.has('fl oz')}`);
    
    // Fluid ounce should NOT be disabled when ingredient is gallon
    expect(disabledUnits.has('fl oz')).toBe(false);
  });
  
  it("should prevent weight to volume conversions", async () => {
    const units = await getActiveIngredientUnits(1);
    
    const pound = units.find(u => u.name === 'lb');
    const gallon = units.find(u => u.name === 'gal');
    
    expect(pound?.categoryId).toBe(1); // Weight
    expect(gallon?.categoryId).toBe(2); // Volume
    
    // Simulate the RecipeEditModal logic with pound as ingredient unit
    const ingredientCategoryId = pound?.categoryId;
    const disabledUnits = new Set<string>();
    
    if (ingredientCategoryId) {
      units.forEach(unit => {
        if (unit.categoryId !== ingredientCategoryId) {
          disabledUnits.add(unit.name);
        }
      });
    }
    
    // Gallon SHOULD be disabled when ingredient is pound
    expect(disabledUnits.has('gal')).toBe(true);
  });
});
