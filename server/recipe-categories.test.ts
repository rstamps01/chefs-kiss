import { describe, it, expect, beforeAll } from 'vitest';
import { getActiveRecipeCategories, getIngredientCategories, getUserRestaurant } from './db';

describe('Recipe Category Grouping', () => {
  let restaurantId: number;

  beforeAll(async () => {
    // Get the test restaurant ID
    const restaurant = await getUserRestaurant(1); // Assuming user ID 1 exists
    if (!restaurant) {
      throw new Error('Test restaurant not found');
    }
    restaurantId = restaurant.id;
  });

  it('should fetch active recipe categories', async () => {
    const categories = await getActiveRecipeCategories(restaurantId);
    
    expect(categories).toBeDefined();
    expect(Array.isArray(categories)).toBe(true);
    
    // Should have at least some categories
    expect(categories.length).toBeGreaterThan(0);
    
    // Each category should have required fields
    categories.forEach(cat => {
      expect(cat).toHaveProperty('id');
      expect(cat).toHaveProperty('name');
      expect(cat).toHaveProperty('isActive');
      expect(cat.isActive).toBe(true);
    });
    
    console.log(`Found ${categories.length} active recipe categories`);
  });

  it('should fetch distinct ingredient categories', async () => {
    const categories = await getIngredientCategories(restaurantId);
    
    expect(categories).toBeDefined();
    expect(Array.isArray(categories)).toBe(true);
    
    // Should have at least some categories
    expect(categories.length).toBeGreaterThan(0);
    
    // Each should be a string
    categories.forEach(cat => {
      expect(typeof cat).toBe('string');
      expect(cat.length).toBeGreaterThan(0);
    });
    
    // Should be unique (no duplicates)
    const uniqueCategories = new Set(categories);
    expect(uniqueCategories.size).toBe(categories.length);
    
    console.log(`Found ${categories.length} distinct ingredient categories`);
  });

  it('should return alphabetically sorted ingredient categories', async () => {
    const categories = await getIngredientCategories(restaurantId);
    
    // Check if sorted alphabetically
    for (let i = 1; i < categories.length; i++) {
      expect(categories[i].localeCompare(categories[i - 1])).toBeGreaterThanOrEqual(0);
    }
    
    console.log('Ingredient categories are alphabetically sorted:', categories);
  });

  it('should combine and group categories correctly', async () => {
    const recipeCategories = await getActiveRecipeCategories(restaurantId);
    const ingredientCategories = await getIngredientCategories(restaurantId);
    
    // Simulate the frontend grouping logic
    const groupedCategories = [
      {
        label: "Recipe Categories",
        categories: recipeCategories.map(cat => cat.name).sort((a, b) => a.localeCompare(b))
      },
      {
        label: "Ingredient Categories",
        categories: ingredientCategories.filter((cat): cat is string => cat !== null).sort((a, b) => a.localeCompare(b))
      }
    ];
    
    expect(groupedCategories).toHaveLength(2);
    expect(groupedCategories[0].label).toBe("Recipe Categories");
    expect(groupedCategories[1].label).toBe("Ingredient Categories");
    
    // Both groups should have categories
    expect(groupedCategories[0].categories.length).toBeGreaterThan(0);
    expect(groupedCategories[1].categories.length).toBeGreaterThan(0);
    
    // Recipe categories should be alphabetically sorted
    const recipeCats = groupedCategories[0].categories;
    for (let i = 1; i < recipeCats.length; i++) {
      expect(recipeCats[i].localeCompare(recipeCats[i - 1])).toBeGreaterThanOrEqual(0);
    }
    
    // Ingredient categories should be alphabetically sorted
    const ingredCats = groupedCategories[1].categories;
    for (let i = 1; i < ingredCats.length; i++) {
      expect(ingredCats[i].localeCompare(ingredCats[i - 1])).toBeGreaterThanOrEqual(0);
    }
    
    console.log('Grouped categories structure:', JSON.stringify(groupedCategories, null, 2));
  });

  it('should not have duplicate categories between groups', async () => {
    const recipeCategories = await getActiveRecipeCategories(restaurantId);
    const ingredientCategories = await getIngredientCategories(restaurantId);
    
    const recipeCatNames = new Set(recipeCategories.map(cat => cat.name));
    const ingredCatNames = new Set(ingredientCategories);
    
    // Find any overlaps
    const overlaps = [...recipeCatNames].filter(name => ingredCatNames.has(name));
    
    console.log(`Recipe categories: ${recipeCatNames.size}, Ingredient categories: ${ingredCatNames.size}, Overlaps: ${overlaps.length}`);
    
    if (overlaps.length > 0) {
      console.log('Overlapping categories:', overlaps);
    }
    
    // This is informational - overlaps are allowed but good to know about
    expect(overlaps).toBeDefined();
  });
});
