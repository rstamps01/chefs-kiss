import { describe, it, expect, beforeAll } from 'vitest';
import { getRecipeCategories, getActiveRecipeCategories, createRecipeCategory, getUserRestaurant } from './db';

describe('Category Type Separation', () => {
  let testRestaurantId: number;
  let recipeCategoryId: number;
  let ingredientCategoryId: number;

  beforeAll(async () => {
    // Get test restaurant (assuming user ID 1 exists from auth tests)
    const restaurant = await getUserRestaurant(1);
    if (!restaurant) {
      throw new Error('No restaurant found for testing');
    }
    testRestaurantId = restaurant.id;

    // Create test categories using the helper function
    const recipeCategory = await createRecipeCategory({
      restaurantId: testRestaurantId,
      name: 'Test Recipe Category ' + Date.now(),
      categoryType: 'recipe',
      isActive: true,
    });
    recipeCategoryId = recipeCategory.id;

    const ingredientCategory = await createRecipeCategory({
      restaurantId: testRestaurantId,
      name: 'Test Ingredient Category ' + Date.now(),
      categoryType: 'ingredient',
      isActive: true,
    });
    ingredientCategoryId = ingredientCategory.id;
  });

  it('should filter recipe categories by type', async () => {
    const recipeCats = await getRecipeCategories(testRestaurantId, 'recipe');
    expect(recipeCats.every(cat => cat.categoryType === 'recipe')).toBe(true);
    expect(recipeCats.length).toBeGreaterThan(0);
  });

  it('should filter ingredient categories by type', async () => {
    const ingredientCats = await getRecipeCategories(testRestaurantId, 'ingredient');
    expect(ingredientCats.every(cat => cat.categoryType === 'ingredient')).toBe(true);
    expect(ingredientCats.length).toBeGreaterThan(0);
  });

  it('should have separate recipe and ingredient categories', async () => {
    const recipeCats = await getRecipeCategories(testRestaurantId, 'recipe');
    const ingredientCats = await getRecipeCategories(testRestaurantId, 'ingredient');

    expect(recipeCats.length).toBeGreaterThan(0);
    expect(ingredientCats.length).toBeGreaterThan(0);
    console.log(`✓ Found ${recipeCats.length} recipe categories and ${ingredientCats.length} ingredient categories`);
  });

  it('should return all categories when no type filter is provided', async () => {
    const allCats = await getRecipeCategories(testRestaurantId);
    const recipeCats = await getRecipeCategories(testRestaurantId, 'recipe');
    const ingredientCats = await getRecipeCategories(testRestaurantId, 'ingredient');

    expect(allCats.length).toBeGreaterThanOrEqual(recipeCats.length + ingredientCats.length);
  });
});
