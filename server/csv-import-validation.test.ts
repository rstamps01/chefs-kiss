import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseCSV, parseIngredientCSV, parseRecipeCSV, parseRecipeIngredientsCSV } from './csv-helpers';

describe('CSV Import Validation Tests', () => {
  describe('Generic CSV Parsing', () => {
    it('should parse ingredients CSV file successfully', async () => {
      const csvPath = join(__dirname, '../test-ingredients-import.csv');
      const csvContent = readFileSync(csvPath, 'utf-8');
      const parsed = parseCSV(csvContent);

      expect(parsed).toBeDefined();
      expect(parsed.length).toBe(7); // 7 ingredients in test file
      expect(parsed[0]).toHaveProperty('name');
      expect(parsed[0]).toHaveProperty('category');
      expect(parsed[0]).toHaveProperty('unit');
      expect(parsed[0].name).toBe('Salmon Fillet');
    });

    it('should parse recipes CSV file successfully', async () => {
      const csvPath = join(__dirname, '../test-recipes-import.csv');
      const csvContent = readFileSync(csvPath, 'utf-8');
      const parsed = parseCSV(csvContent);

      expect(parsed).toBeDefined();
      expect(parsed.length).toBe(4); // 4 recipes in test file
      expect(parsed[0]).toHaveProperty('name');
      expect(parsed[0]).toHaveProperty('description');
      expect(parsed[0]).toHaveProperty('category');
      expect(parsed[0].name).toBe('Spicy Tuna Roll');
    });

    it('should handle CSV with quoted fields', async () => {
      const csvWithQuotes = `name,description,category
"Spicy Tuna Roll","Fresh tuna with spicy mayo, cucumber","Sushi Rolls"
"Philadelphia Roll","Salmon and cream cheese","Sushi Rolls"`;
      
      const parsed = parseCSV(csvWithQuotes);
      
      expect(parsed.length).toBe(2);
      expect(parsed[0].description).toBe('Fresh tuna with spicy mayo, cucumber');
    });

    it('should handle empty fields correctly', async () => {
      const csvWithEmpty = `name,category,unit,costPerUnit
"Test Item","",lb,
"Another Item",Produce,pc,1.25`;
      
      const parsed = parseCSV(csvWithEmpty);
      
      expect(parsed.length).toBe(2);
      expect(parsed[0].category).toBe('');
      expect(parsed[0].costPerUnit).toBe('');
      expect(parsed[1].category).toBe('Produce');
    });
  });

  describe('Ingredient CSV Validation', () => {
    it('should validate ingredient CSV with all required fields', () => {
      const validCSV = `id,name,category,unit,costPerUnit,pieceWeightOz,supplier,shelfLife,minStock
1,Salmon Fillet,Seafood,lb,15.99,,,3,5
2,Avocado,Produce,pc,1.25,5.5,Fresh Farms,7,20`;
      
      const parsed = parseIngredientCSV(validCSV);
      
      expect(parsed.valid).toBe(true);
      expect(parsed.data.length).toBe(2);
      expect(parsed.errors).toHaveLength(0);
    });

    it('should reject ingredient CSV missing required id field', () => {
      const invalidCSV = `id,name,category,unit,costPerUnit
,Salmon Fillet,Seafood,lb,15.99
2,Avocado,Produce,pc,1.25`;
      
      const parsed = parseIngredientCSV(invalidCSV);
      
      expect(parsed.valid).toBe(false);
      expect(parsed.errors.length).toBeGreaterThan(0);
      expect(parsed.errors[0]).toContain('id');
    });

    it('should reject ingredient CSV missing required name field', () => {
      const invalidCSV = `id,name,category,unit,costPerUnit
1,,Seafood,lb,15.99`;
      
      const parsed = parseIngredientCSV(invalidCSV);
      
      expect(parsed.valid).toBe(false);
      expect(parsed.errors.length).toBeGreaterThan(0);
      expect(parsed.errors[0]).toContain('name');
    });

    it('should reject ingredient CSV missing required unit field', () => {
      const invalidCSV = `id,name,category,unit,costPerUnit
1,Salmon Fillet,Seafood,,15.99`;
      
      const parsed = parseIngredientCSV(invalidCSV);
      
      expect(parsed.valid).toBe(false);
      expect(parsed.errors.length).toBeGreaterThan(0);
      expect(parsed.errors[0]).toContain('unit');
    });

    it('should accept optional fields as empty', () => {
      const validCSV = `id,name,category,unit,costPerUnit,pieceWeightOz,supplier,shelfLife,minStock
1,Minimal Item,,lb,,,,`;
      
      const parsed = parseIngredientCSV(validCSV);
      
      expect(parsed.valid).toBe(true);
      expect(parsed.data.length).toBe(1);
      expect(parsed.data[0].category).toBe('');
      expect(parsed.data[0].costPerUnit).toBe('');
    });
  });

  describe('Recipe CSV Validation', () => {
    it('should validate recipe CSV with all required fields', () => {
      const validCSV = `id,name,description,category,servings,prepTime,cookTime,costPerServing,sellingPrice
1,Spicy Tuna Roll,Fresh tuna with spicy mayo,Sushi Rolls,8,15,0,2.50,12.99
2,Philadelphia Roll,Salmon and cream cheese,Sushi Rolls,8,12,0,3.25,14.99`;
      
      const parsed = parseRecipeCSV(validCSV);
      
      expect(parsed.valid).toBe(true);
      expect(parsed.data.length).toBe(2);
      expect(parsed.errors).toHaveLength(0);
    });

    it('should reject recipe CSV missing required id field', () => {
      const invalidCSV = `id,name,description,category
,Spicy Tuna Roll,Fresh tuna,Sushi Rolls`;
      
      const parsed = parseRecipeCSV(invalidCSV);
      
      expect(parsed.valid).toBe(false);
      expect(parsed.errors.length).toBeGreaterThan(0);
      expect(parsed.errors[0]).toContain('id');
    });

    it('should reject recipe CSV missing required name field', () => {
      const invalidCSV = `id,name,description,category
1,,Fresh tuna,Sushi Rolls`;
      
      const parsed = parseRecipeCSV(invalidCSV);
      
      expect(parsed.valid).toBe(false);
      expect(parsed.errors.length).toBeGreaterThan(0);
      expect(parsed.errors[0]).toContain('name');
    });

    it('should accept optional recipe fields as empty', () => {
      const validCSV = `id,name,description,category,servings,prepTime,cookTime,costPerServing,sellingPrice
1,Minimal Recipe,,,,,,,`;
      
      const parsed = parseRecipeCSV(validCSV);
      
      expect(parsed.valid).toBe(true);
      expect(parsed.data.length).toBe(1);
      expect(parsed.data[0].description).toBe('');
      expect(parsed.data[0].category).toBe('');
    });
  });

  describe('Recipe Ingredient CSV Validation', () => {
    it('should validate recipe ingredient CSV with all required fields', () => {
      const validCSV = `recipeId,recipeName,ingredientId,ingredientName,quantity,unit
1,California Roll,10,Sushi Rice,2,cup
1,California Roll,11,Nori Sheets,2,sheet`;
      
      const parsed = parseRecipeIngredientsCSV(validCSV);
      
      expect(parsed.valid).toBe(true);
      expect(parsed.data.length).toBe(2);
      expect(parsed.errors).toHaveLength(0);
    });

    it('should reject recipe ingredient CSV missing required recipeId', () => {
      const invalidCSV = `recipeId,recipeName,ingredientId,ingredientName,quantity,unit
,California Roll,10,Sushi Rice,2,cup`;
      
      const parsed = parseRecipeIngredientsCSV(invalidCSV);
      
      expect(parsed.valid).toBe(false);
      expect(parsed.errors.length).toBeGreaterThan(0);
      expect(parsed.errors[0]).toContain('recipeId');
    });

    it('should reject recipe ingredient CSV missing required ingredientId', () => {
      const invalidCSV = `recipeId,recipeName,ingredientId,ingredientName,quantity,unit
1,California Roll,,Sushi Rice,2,cup`;
      
      const parsed = parseRecipeIngredientsCSV(invalidCSV);
      
      expect(parsed.valid).toBe(false);
      expect(parsed.errors.length).toBeGreaterThan(0);
      expect(parsed.errors[0]).toContain('ingredientId');
    });

    it('should reject recipe ingredient CSV missing required quantity', () => {
      const invalidCSV = `recipeId,recipeName,ingredientId,ingredientName,quantity,unit
1,California Roll,10,Sushi Rice,,cup`;
      
      const parsed = parseRecipeIngredientsCSV(invalidCSV);
      
      expect(parsed.valid).toBe(false);
      expect(parsed.errors.length).toBeGreaterThan(0);
      expect(parsed.errors[0]).toContain('quantity');
    });

    it('should reject recipe ingredient CSV missing required unit', () => {
      const invalidCSV = `recipeId,recipeName,ingredientId,ingredientName,quantity,unit
1,California Roll,10,Sushi Rice,2,`;
      
      const parsed = parseRecipeIngredientsCSV(invalidCSV);
      
      expect(parsed.valid).toBe(false);
      expect(parsed.errors.length).toBeGreaterThan(0);
      expect(parsed.errors[0]).toContain('unit');
    });

    it('should accept recipeName and ingredientName as optional reference fields', () => {
      const validCSV = `recipeId,recipeName,ingredientId,ingredientName,quantity,unit
1,,10,,2,cup`;
      
      const parsed = parseRecipeIngredientsCSV(validCSV);
      
      expect(parsed.valid).toBe(true);
      expect(parsed.data.length).toBe(1);
      expect(parsed.data[0].recipeName).toBe('');
      expect(parsed.data[0].ingredientName).toBe('');
    });
  });

  describe('Error Reporting', () => {
    it('should report multiple validation errors', () => {
      const invalidCSV = `id,name,category,unit,costPerUnit
,,,
1,,Produce,,5.00`;
      
      const parsed = parseIngredientCSV(invalidCSV);
      
      expect(parsed.valid).toBe(false);
      expect(parsed.errors.length).toBeGreaterThan(1);
    });

    it('should include row numbers in error messages', () => {
      const invalidCSV = `id,name,category,unit,costPerUnit
1,Valid Item,Test,lb,10.00
,,Invalid,,
3,Another Valid,Test,oz,5.00`;
      
      const parsed = parseIngredientCSV(invalidCSV);
      
      expect(parsed.valid).toBe(false);
      expect(parsed.errors.some(err => err.includes('row') || err.includes('Row'))).toBe(true);
    });
  });
});
