import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseCSV } from './csv-helpers';
import { 
  createRestaurant, 
  bulkImportIngredients, 
  bulkImportRecipes,
  getIngredientsForRestaurant,
  getRecipesWithIngredients
} from './db';

describe('CSV Import Integration Tests', () => {
  let testRestaurantId: number;

  beforeEach(async () => {
    // Create a test restaurant for each test
    const restaurant = await createRestaurant({
      name: 'CSV Test Restaurant',
      ownerId: 1,
      ownerName: 'Test Owner'
    });
    testRestaurantId = restaurant.id;
  });

  describe('Ingredients Import', () => {
    it('should import ingredients from CSV file', async () => {
      const csvPath = join(__dirname, '../../test-ingredients-import.csv');
      const csvContent = readFileSync(csvPath, 'utf-8');
      const parsed = await parseCSV(csvContent);

      expect(parsed.data.length).toBeGreaterThan(0);
      expect(parsed.data[0]).toHaveProperty('name');
      expect(parsed.data[0]).toHaveProperty('category');
      expect(parsed.data[0]).toHaveProperty('unit');
    });

    it('should successfully import valid ingredients data', async () => {
      const ingredientsData = [
        {
          name: 'Test Salmon',
          category: 'Seafood',
          unit: 'lb',
          costPerUnit: '15.99',
          pieceWeightOz: '',
          supplier: '',
          shelfLife: '3',
          minStock: '5'
        },
        {
          name: 'Test Avocado',
          category: 'Produce',
          unit: 'pc',
          costPerUnit: '1.25',
          pieceWeightOz: '5.5',
          supplier: 'Fresh Farms',
          shelfLife: '7',
          minStock: '20'
        }
      ];

      const result = await bulkImportIngredients(testRestaurantId, ingredientsData);
      
      expect(result.success).toBe(true);
      expect(result.imported).toBe(2);
      expect(result.errors).toHaveLength(0);

      // Verify ingredients were actually created
      const ingredients = await getIngredientsForRestaurant(testRestaurantId);
      expect(ingredients.length).toBeGreaterThanOrEqual(2);
      
      const salmon = ingredients.find(i => i.name === 'Test Salmon');
      expect(salmon).toBeDefined();
      expect(salmon?.category).toBe('Seafood');
      expect(salmon?.unit).toBe('lb');
      expect(salmon?.costPerUnit).toBe('15.99');
    });

    it('should handle optional fields correctly', async () => {
      const ingredientsData = [
        {
          name: 'Minimal Ingredient',
          category: '',
          unit: 'oz',
          costPerUnit: '',
          pieceWeightOz: '',
          supplier: '',
          shelfLife: '',
          minStock: ''
        }
      ];

      const result = await bulkImportIngredients(testRestaurantId, ingredientsData);
      
      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);

      const ingredients = await getIngredientsForRestaurant(testRestaurantId);
      const minimal = ingredients.find(i => i.name === 'Minimal Ingredient');
      expect(minimal).toBeDefined();
      expect(minimal?.unit).toBe('oz');
    });

    it('should validate required fields', async () => {
      const ingredientsData = [
        {
          name: '',  // Missing required name
          category: 'Test',
          unit: 'lb',
          costPerUnit: '10.00',
          pieceWeightOz: '',
          supplier: '',
          shelfLife: '',
          minStock: ''
        },
        {
          name: 'Valid Item',
          category: 'Test',
          unit: '',  // Missing required unit
          costPerUnit: '10.00',
          pieceWeightOz: '',
          supplier: '',
          shelfLife: '',
          minStock: ''
        }
      ];

      const result = await bulkImportIngredients(testRestaurantId, ingredientsData);
      
      expect(result.success).toBe(false);
      expect(result.imported).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle numeric field conversion', async () => {
      const ingredientsData = [
        {
          name: 'Numeric Test',
          category: 'Test',
          unit: 'lb',
          costPerUnit: '12.50',
          pieceWeightOz: '8.5',
          supplier: '',
          shelfLife: '30',
          minStock: '10'
        }
      ];

      const result = await bulkImportIngredients(testRestaurantId, ingredientsData);
      
      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);

      const ingredients = await getIngredientsForRestaurant(testRestaurantId);
      const item = ingredients.find(i => i.name === 'Numeric Test');
      expect(item).toBeDefined();
      expect(item?.costPerUnit).toBe('12.50');
      expect(item?.pieceWeightOz).toBe('8.5');
      expect(item?.shelfLife).toBe(30);
      expect(item?.minStock).toBe(10);
    });
  });

  describe('Recipes Import', () => {
    it('should import recipes from CSV file', async () => {
      const csvPath = join(__dirname, '../../test-recipes-import.csv');
      const csvContent = readFileSync(csvPath, 'utf-8');
      const parsed = await parseCSV(csvContent);

      expect(parsed.data.length).toBeGreaterThan(0);
      expect(parsed.data[0]).toHaveProperty('name');
      expect(parsed.data[0]).toHaveProperty('category');
    });

    it('should successfully import valid recipes data', async () => {
      const recipesData = [
        {
          name: 'Test Spicy Tuna Roll',
          description: 'Fresh tuna with spicy mayo',
          category: 'Sushi Rolls',
          servings: '8',
          prepTime: '15',
          cookTime: '0',
          costPerServing: '2.50',
          sellingPrice: '12.99'
        },
        {
          name: 'Test Philadelphia Roll',
          description: 'Salmon and cream cheese',
          category: 'Sushi Rolls',
          servings: '8',
          prepTime: '12',
          cookTime: '0',
          costPerServing: '3.25',
          sellingPrice: '14.99'
        }
      ];

      const result = await bulkImportRecipes(testRestaurantId, recipesData);
      
      expect(result.success).toBe(true);
      expect(result.imported).toBe(2);
      expect(result.errors).toHaveLength(0);

      // Verify recipes were actually created
      const recipes = await getRecipesWithIngredients(testRestaurantId);
      expect(recipes.length).toBeGreaterThanOrEqual(2);
      
      const spicyTuna = recipes.find(r => r.name === 'Test Spicy Tuna Roll');
      expect(spicyTuna).toBeDefined();
      expect(spicyTuna?.category).toBe('Sushi Rolls');
      expect(spicyTuna?.servings).toBe(8);
      expect(spicyTuna?.sellingPrice).toBe('12.99');
    });

    it('should handle optional recipe fields', async () => {
      const recipesData = [
        {
          name: 'Minimal Recipe',
          description: '',
          category: '',
          servings: '',
          prepTime: '',
          cookTime: '',
          costPerServing: '',
          sellingPrice: ''
        }
      ];

      const result = await bulkImportRecipes(testRestaurantId, recipesData);
      
      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);

      const recipes = await getRecipesWithIngredients(testRestaurantId);
      const minimal = recipes.find(r => r.name === 'Minimal Recipe');
      expect(minimal).toBeDefined();
    });

    it('should validate required recipe name', async () => {
      const recipesData = [
        {
          name: '',  // Missing required name
          description: 'Test description',
          category: 'Test',
          servings: '4',
          prepTime: '10',
          cookTime: '20',
          costPerServing: '5.00',
          sellingPrice: '15.00'
        }
      ];

      const result = await bulkImportRecipes(testRestaurantId, recipesData);
      
      expect(result.success).toBe(false);
      expect(result.imported).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed CSV data gracefully', async () => {
      const malformedCSV = 'name,category,unit\n"Unclosed quote,Test,lb';
      
      try {
        const parsed = await parseCSV(malformedCSV);
        // If parsing succeeds, check that errors are reported
        expect(parsed.errors).toBeDefined();
      } catch (error) {
        // If parsing throws, that's also acceptable
        expect(error).toBeDefined();
      }
    });

    it('should report partial success when some rows fail', async () => {
      const mixedData = [
        {
          name: 'Valid Item',
          category: 'Test',
          unit: 'lb',
          costPerUnit: '10.00',
          pieceWeightOz: '',
          supplier: '',
          shelfLife: '',
          minStock: ''
        },
        {
          name: '',  // Invalid - missing name
          category: 'Test',
          unit: 'oz',
          costPerUnit: '5.00',
          pieceWeightOz: '',
          supplier: '',
          shelfLife: '',
          minStock: ''
        },
        {
          name: 'Another Valid Item',
          category: 'Test',
          unit: 'pc',
          costPerUnit: '2.00',
          pieceWeightOz: '',
          supplier: '',
          shelfLife: '',
          minStock: ''
        }
      ];

      const result = await bulkImportIngredients(testRestaurantId, mixedData);
      
      // Should import the valid rows even if some fail
      expect(result.imported).toBeGreaterThan(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
