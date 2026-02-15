import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { bulkDeleteIngredients, bulkDeleteRecipes, createIngredient, createRecipe, addRecipeIngredients, getIngredients, getRecipesWithIngredients } from './db';

describe('Bulk Delete Operations', () => {
  let testRestaurantId: number;
  let testUserId: string;
  let testIngredientIds: number[];
  let testRecipeIds: number[];

  beforeAll(async () => {
    // Setup test data
    testRestaurantId = 1; // Assuming restaurant ID 1 exists
    testUserId = 'test-developer-user';
    testIngredientIds = [];
    testRecipeIds = [];

    // Create test ingredients
    const ingredient1Id = await createIngredient({
      restaurantId: testRestaurantId,
      name: 'Test Ingredient 1 for Bulk Delete',
      category: 'Test Category',
      unit: 'oz',
      costPerUnit: 1.50,
    });
    testIngredientIds.push(ingredient1Id);

    const ingredient2Id = await createIngredient({
      restaurantId: testRestaurantId,
      name: 'Test Ingredient 2 for Bulk Delete',
      category: 'Test Category',
      unit: 'lb',
      costPerUnit: 2.00,
    });
    testIngredientIds.push(ingredient2Id);

    const ingredient3Id = await createIngredient({
      restaurantId: testRestaurantId,
      name: 'Test Ingredient 3 for Bulk Delete (Used in Recipe)',
      category: 'Test Category',
      unit: 'oz',
      costPerUnit: 3.00,
    });
    testIngredientIds.push(ingredient3Id);

    // Create test recipe that uses ingredient3
    const recipeId = await createRecipe({
      restaurantId: testRestaurantId,
      name: 'Test Recipe for Bulk Delete',
      category: 'Test',
      servings: 4,
      sellingPrice: 15.00,
    });
    testRecipeIds.push(recipeId);

    // Add ingredient to recipe
    await addRecipeIngredients({
      recipeId,
      ingredients: [
        {
          ingredientId: ingredient3Id,
          quantity: 5,
          unit: 'oz',
        },
      ],
    });
  });

  afterAll(async () => {
    // Cleanup: delete test recipes first (to remove foreign key constraints)
    if (testRecipeIds.length > 0) {
      await bulkDeleteRecipes(testRestaurantId, testRecipeIds, testUserId);
    }

    // Then delete remaining test ingredients
    if (testIngredientIds.length > 0) {
      await bulkDeleteIngredients(testRestaurantId, testIngredientIds, testUserId);
    }
  });

  describe('bulkDeleteIngredients', () => {
    it('should delete unused ingredients successfully', async () => {
      // Delete first two ingredients (not used in recipes)
      const result = await bulkDeleteIngredients(
        testRestaurantId,
        [testIngredientIds[0], testIngredientIds[1]],
        testUserId
      );

      expect(result.deleted).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.skipped.length).toBe(0);
      expect(result.errors.length).toBe(0);

      // Verify ingredients were deleted
      const remainingIngredients = await getIngredients(testRestaurantId);
      const deletedIds = [testIngredientIds[0], testIngredientIds[1]];
      const foundDeleted = remainingIngredients.filter(i => deletedIds.includes(i.id));
      expect(foundDeleted.length).toBe(0);
    });

    it('should skip ingredients used in recipes', async () => {
      // Try to delete ingredient3 which is used in a recipe
      const result = await bulkDeleteIngredients(
        testRestaurantId,
        [testIngredientIds[2]],
        testUserId
      );

      expect(result.deleted).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.skipped.length).toBe(1);
      expect(result.skipped[0].id).toBe(testIngredientIds[2]);
      expect(result.skipped[0].reason).toContain('Used in recipes');

      // Verify ingredient still exists
      const ingredients = await getIngredients(testRestaurantId);
      const foundIngredient = ingredients.find(i => i.id === testIngredientIds[2]);
      expect(foundIngredient).toBeDefined();
    });

    it('should skip non-existent ingredient IDs', async () => {
      const nonExistentId = 999999;
      const result = await bulkDeleteIngredients(
        testRestaurantId,
        [nonExistentId],
        testUserId
      );

      expect(result.deleted).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.skipped.length).toBe(1);
      expect(result.skipped[0].id).toBe(nonExistentId);
      expect(result.skipped[0].reason).toContain('Not found');
    });
  });

  describe('bulkDeleteRecipes', () => {
    it('should delete recipes and cascade delete recipe ingredients', async () => {
      // Create a new recipe for this test
      const recipeId = await createRecipe({
        restaurantId: testRestaurantId,
        name: 'Test Recipe for Cascade Delete',
        category: 'Test',
        servings: 2,
        sellingPrice: 10.00,
      });

      // Add ingredients to recipe
      await addRecipeIngredients({
        recipeId,
        ingredients: [
          {
            ingredientId: testIngredientIds[2],
            quantity: 3,
            unit: 'oz',
          },
        ],
      });

      // Delete the recipe
      const result = await bulkDeleteRecipes(
        testRestaurantId,
        [recipeId],
        testUserId
      );

      expect(result.deleted).toBe(1);
      expect(result.failed).toBe(0);
      expect(result.skipped.length).toBe(0);
      expect(result.recipeIngredientsDeleted).toBeGreaterThan(0);

      // Verify recipe was deleted
      const recipes = await getRecipesWithIngredients(testRestaurantId);
      const foundRecipe = recipes.find(r => r.id === recipeId);
      expect(foundRecipe).toBeUndefined();
    });

    it('should skip non-existent recipe IDs', async () => {
      const nonExistentId = 999999;
      const result = await bulkDeleteRecipes(
        testRestaurantId,
        [nonExistentId],
        testUserId
      );

      expect(result.deleted).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.skipped.length).toBe(1);
      expect(result.skipped[0].id).toBe(nonExistentId);
      expect(result.skipped[0].reason).toContain('Not found');
    });

    it('should handle bulk delete of multiple recipes', async () => {
      // Create multiple recipes
      const recipe1Id = await createRecipe({
        restaurantId: testRestaurantId,
        name: 'Bulk Test Recipe 1',
        category: 'Test',
        servings: 2,
        sellingPrice: 10.00,
      });

      const recipe2Id = await createRecipe({
        restaurantId: testRestaurantId,
        name: 'Bulk Test Recipe 2',
        category: 'Test',
        servings: 4,
        sellingPrice: 20.00,
      });

      // Delete both recipes
      const result = await bulkDeleteRecipes(
        testRestaurantId,
        [recipe1Id, recipe2Id],
        testUserId
      );

      expect(result.deleted).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.skipped.length).toBe(0);

      // Verify recipes were deleted
      const recipes = await getRecipesWithIngredients(testRestaurantId);
      const foundRecipes = recipes.filter(r => r.id === recipe1Id || r.id === recipe2Id);
      expect(foundRecipes.length).toBe(0);
    });
  });
});
