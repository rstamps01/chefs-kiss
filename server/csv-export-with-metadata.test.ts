/**
 * Tests for CSV export with metadata rows
 * 
 * Verifies that exported CSV files include metadata rows at the top
 * and can be successfully re-imported.
 */

import { describe, it, expect } from 'vitest';
import { ingredientsToCSV, recipesToCSV, recipeIngredientsToCSV, parseIngredientCSV, parseRecipeCSV, parseRecipeIngredientsCSV } from './csv-helpers';

describe('CSV Export with Metadata Rows', () => {
  it('should include metadata rows in ingredient export', () => {
    const ingredients = [
      {
        id: 1,
        name: 'Sushi Rice',
        category: 'Grains',
        unit: 'lb',
        costPerUnit: 2.50,
        pieceWeightOz: null,
        supplier: 'Asian Foods Co',
        shelfLife: 365,
        minStock: 50
      }
    ];

    const csv = ingredientsToCSV(ingredients);

    // Should start with comment header
    expect(csv).toContain('# INGREDIENTS DATA EXPORT');
    expect(csv).toContain('# This file can be edited and re-imported');
    
    // Should contain instructions
    expect(csv).toContain('# INSTRUCTIONS:');
    expect(csv).toContain('# 4. To UPDATE existing ingredients: Keep the id column value');
    expect(csv).toContain('# 5. To CREATE new ingredients: Leave the id column empty');
    
    // Should contain metadata rows
    expect(csv).toContain('REQUIRED');
    expect(csv).toContain('OPTIONAL');
    expect(csv).toContain('STRING');
    expect(csv).toContain('INTEGER');
    expect(csv).toContain('DECIMAL');
    
    // Should contain actual data
    expect(csv).toContain('Sushi Rice');
    expect(csv).toContain('Asian Foods Co');
  });

  it('should include metadata rows in recipe export', () => {
    const recipes = [
      {
        id: 1,
        name: 'California Roll',
        category: 'Sushi',
        description: 'Classic roll',
        servings: 8,
        prepTime: 15,
        cookTime: 0,
        sellingPrice: 12.99,
        ingredients: [],
        totalCost: 3.50,
        foodCostPercent: 26.94,
        marginPercent: 73.06
      }
    ];

    const csv = recipesToCSV(recipes);

    // Should start with comment header
    expect(csv).toContain('# RECIPES DATA EXPORT');
    expect(csv).toContain('# This file can be edited and re-imported');
    
    // Should contain instructions
    expect(csv).toContain('# INSTRUCTIONS:');
    expect(csv).toContain('# - Financial fields (totalCost, foodCostPercent, marginPercent) are READ-ONLY and calculated automatically');
    
    // Should contain metadata rows
    expect(csv).toContain('REQUIRED');
    expect(csv).toContain('READ-ONLY');
    
    // Should contain actual data
    expect(csv).toContain('California Roll');
    expect(csv).toContain('12.99');
  });

  it('should include metadata rows in recipe ingredients export', () => {
    const recipeIngredients = [
      {
        recipeId: 1,
        recipeName: 'California Roll',
        ingredientId: 5,
        ingredientName: 'Sushi Rice',
        quantity: 0.25,
        unit: 'cup'
      }
    ];

    const csv = recipeIngredientsToCSV(recipeIngredients);

    // Should start with comment header
    expect(csv).toContain('# RECIPE INGREDIENTS DATA EXPORT');
    expect(csv).toContain('# This file can be edited and re-imported for bulk ingredient updates');
    
    // Should contain instructions
    expect(csv).toContain('# INSTRUCTIONS:');
    expect(csv).toContain('# COMMON USE CASE: Bulk unit conversion');
    
    // Should contain metadata rows
    expect(csv).toContain('REQUIRED');
    expect(csv).toContain('OPTIONAL');
    
    // Should contain actual data
    expect(csv).toContain('California Roll');
    expect(csv).toContain('Sushi Rice');
    expect(csv).toContain('0.25');
  });

  it('should successfully parse exported ingredient CSV with metadata', () => {
    const ingredients = [
      {
        id: 1,
        name: 'Sushi Rice',
        category: 'Grains',
        unit: 'lb',
        costPerUnit: 2.50,
        pieceWeightOz: null,
        supplier: 'Asian Foods Co',
        shelfLife: 365,
        minStock: 50
      },
      {
        id: 2,
        name: 'Nori Sheets',
        category: 'Seaweed',
        unit: 'pc',
        costPerUnit: 0.50,
        pieceWeightOz: 0.1,
        supplier: 'Asian Foods Co',
        shelfLife: 180,
        minStock: 100
      }
    ];

    // Export with metadata
    const csv = ingredientsToCSV(ingredients);

    // Parse it back
    const result = parseIngredientCSV(csv);

    // Should be valid
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);

    // Should have correct number of records
    expect(result.data).toHaveLength(2);

    // Should have correct data
    expect(result.data[0].name).toBe('Sushi Rice');
    expect(result.data[0].unit).toBe('lb');
    expect(result.data[1].name).toBe('Nori Sheets');
    expect(result.data[1].unit).toBe('pc');
  });

  it('should successfully parse exported recipe CSV with metadata', () => {
    const recipes = [
      {
        id: 1,
        name: 'California Roll',
        category: 'Sushi',
        description: 'Classic roll',
        servings: 8,
        prepTime: 15,
        cookTime: 0,
        sellingPrice: 12.99,
        ingredients: [],
        totalCost: 3.50,
        foodCostPercent: 26.94,
        marginPercent: 73.06
      }
    ];

    // Export with metadata
    const csv = recipesToCSV(recipes);

    // Parse it back
    const result = parseRecipeCSV(csv);

    // Should be valid
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);

    // Should have correct data
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe('California Roll');
    expect(result.data[0].sellingPrice).toBe('12.99');
  });

  it('should successfully parse exported recipe ingredients CSV with metadata', () => {
    const recipeIngredients = [
      {
        recipeId: 1,
        recipeName: 'California Roll',
        ingredientId: 5,
        ingredientName: 'Sushi Rice',
        quantity: 0.25,
        unit: 'cup'
      },
      {
        recipeId: 1,
        recipeName: 'California Roll',
        ingredientId: 10,
        ingredientName: 'Nori Sheets',
        quantity: 2,
        unit: 'pc'
      }
    ];

    // Export with metadata
    const csv = recipeIngredientsToCSV(recipeIngredients);

    // Parse it back
    const result = parseRecipeIngredientsCSV(csv);

    // Debug: log errors if any
    if (!result.valid) {
      console.log('Parsing errors:', result.errors);
      console.log('CSV content:', csv);
    }

    // Should be valid
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);

    // Should have correct data
    expect(result.data).toHaveLength(2);
    expect(result.data[0].ingredientName).toBe('Sushi Rice');
    expect(result.data[0].quantity).toBe('0.25');
    expect(result.data[1].ingredientName).toBe('Nori Sheets');
    expect(result.data[1].quantity).toBe('2');
  });

  it('should handle edited ingredient CSV (user modified values)', () => {
    const ingredients = [
      {
        id: 1,
        name: 'Sushi Rice',
        category: 'Grains',
        unit: 'lb',
        costPerUnit: 2.50,
        pieceWeightOz: null,
        supplier: 'Asian Foods Co',
        shelfLife: 365,
        minStock: 50
      }
    ];

    // Export with metadata
    let csv = ingredientsToCSV(ingredients);

    // Simulate user editing the CSV (change cost and supplier)
    csv = csv.replace('2.5', '3.00');
    csv = csv.replace('Asian Foods Co', 'New Supplier Inc');

    // Parse it back
    const result = parseIngredientCSV(csv);

    // Should be valid
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);

    // Should have updated values
    expect(result.data[0].costPerUnit).toBe('3.00');
    expect(result.data[0].supplier).toBe('New Supplier Inc');
  });

  it('should filter out metadata rows during parsing', () => {
    const csv = `# INGREDIENTS DATA EXPORT
# This file can be edited and re-imported
# Lines starting with # are comments and will be ignored during import
#
# INSTRUCTIONS:
# 1. Rows 1-22 contain instructions and metadata
# 2. Row 23 contains column headers
# 3. Starting from row 24, you can edit ingredient data
#
id,name,category,unit,costPerUnit
OPTIONAL,REQUIRED,OPTIONAL,REQUIRED,OPTIONAL
INTEGER,STRING,STRING,STRING,DECIMAL
"Whole number","Text, max 255 characters","Text, max 100 characters","Unit name","Number with up to 4 decimal places"
"If provided, must match existing ingredient ID","Must be unique","Use existing categories","Must match existing unit names","Positive number"

1,Sushi Rice,Grains,lb,2.50
2,Nori Sheets,Seaweed,pc,0.50`;

    const result = parseIngredientCSV(csv);

    // Should be valid
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);

    // Should only have data rows (not metadata rows)
    expect(result.data).toHaveLength(2);
    expect(result.data[0].name).toBe('Sushi Rice');
    expect(result.data[1].name).toBe('Nori Sheets');

    // Should NOT have metadata keywords in parsed data
    expect(result.data.some((row: any) => row.name === 'REQUIRED')).toBe(false);
    expect(result.data.some((row: any) => row.name === 'STRING')).toBe(false);
  });
});
