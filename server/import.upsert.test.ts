import { describe, it, expect, beforeAll } from 'vitest';
import { bulkUpdateIngredients, bulkUpdateRecipes } from './db';

describe('CSV Import Upsert Logic', () => {
  const testRestaurantId = 1; // Assuming restaurant ID 1 exists

  describe('Ingredient Import Upsert', () => {
    it('should update existing ingredient when name matches (no ID provided)', async () => {
      // First, create a test ingredient
      const createResult = await bulkUpdateIngredients(testRestaurantId, [
        {
          name: 'Test Upsert Ingredient',
          category: 'Test Category',
          unit: 'lb',
          costPerUnit: 5.0,
          supplier: 'Original Supplier',
          shelfLife: 7,
          minStock: 10.0,
        },
      ]);

      expect(createResult.created).toBe(1);
      expect(createResult.updated).toBe(0);
      const createdId = createResult.createdIds[0];

      // Now, re-import with same name but different data (no ID)
      const upsertResult = await bulkUpdateIngredients(testRestaurantId, [
        {
          name: 'Test Upsert Ingredient',
          category: 'Updated Category',
          unit: 'lb',
          costPerUnit: 7.5,
          supplier: 'Updated Supplier',
          shelfLife: 14,
          minStock: 20.0,
        },
      ]);

      expect(upsertResult.created).toBe(0);
      expect(upsertResult.updated).toBe(1);
      expect(upsertResult.updatedIds[0]).toBe(createdId);
    });

    it('should create new ingredient when name does not exist (no ID provided)', async () => {
      const uniqueName = `New Ingredient ${Date.now()}`;
      
      const result = await bulkUpdateIngredients(testRestaurantId, [
        {
          name: uniqueName,
          category: 'Test Category',
          unit: 'lb',
          costPerUnit: 10.0,
          supplier: 'Test Supplier',
          shelfLife: 30,
          minStock: 5.0,
        },
      ]);

      expect(result.created).toBe(1);
      expect(result.updated).toBe(0);
      expect(result.createdIds.length).toBe(1);
    });

    it('should update ingredient when valid ID is provided', async () => {
      // Create a test ingredient first
      const createResult = await bulkUpdateIngredients(testRestaurantId, [
        {
          name: 'Test ID Update Ingredient',
          category: 'Test',
          unit: 'lb',
          costPerUnit: 5.0,
        },
      ]);

      const createdId = createResult.createdIds[0];

      // Update using the ID
      const updateResult = await bulkUpdateIngredients(testRestaurantId, [
        {
          id: createdId,
          name: 'Test ID Update Ingredient',
          category: 'Updated Test',
          unit: 'lb',
          costPerUnit: 8.0,
        },
      ]);

      expect(updateResult.created).toBe(0);
      expect(updateResult.updated).toBe(1);
      expect(updateResult.updatedIds[0]).toBe(createdId);
    });
  });

  describe('Recipe Import Upsert', () => {
    it('should update existing recipe when name matches (no ID provided)', async () => {
      // First, create a test recipe
      const createResult = await bulkUpdateRecipes([
        {
          name: 'Test Upsert Recipe',
          category: 'Test Category',
          description: 'Original description',
          servings: 4,
          prepTime: 10,
          cookTime: 20,
          sellingPrice: 15.0,
          restaurantId: testRestaurantId,
        },
      ]);

      expect(createResult.created).toBe(1);
      expect(createResult.updated).toBe(0);
      const createdId = createResult.createdIds[0];

      // Now, re-import with same name but different data (no ID)
      const upsertResult = await bulkUpdateRecipes([
        {
          name: 'Test Upsert Recipe',
          category: 'Updated Category',
          description: 'Updated description',
          servings: 6,
          prepTime: 15,
          cookTime: 25,
          sellingPrice: 20.0,
          restaurantId: testRestaurantId,
        },
      ]);

      expect(upsertResult.created).toBe(0);
      expect(upsertResult.updated).toBe(1);
      expect(upsertResult.updatedIds[0]).toBe(createdId);
    });

    it('should create new recipe when name does not exist (no ID provided)', async () => {
      const uniqueName = `New Recipe ${Date.now()}`;
      
      const result = await bulkUpdateRecipes([
        {
          name: uniqueName,
          category: 'Test Category',
          description: 'Test description',
          servings: 4,
          prepTime: 10,
          cookTime: 20,
          sellingPrice: 15.0,
          restaurantId: testRestaurantId,
        },
      ]);

      expect(result.created).toBe(1);
      expect(result.updated).toBe(0);
      expect(result.createdIds.length).toBe(1);
    });
  });
});
