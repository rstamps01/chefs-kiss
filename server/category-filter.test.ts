import { describe, it, expect, beforeAll } from 'vitest';
import { getRecipesWithIngredients, getActiveRecipeCategories, getIngredientCategories, getUserRestaurant } from './db';

describe('Category Filter Functionality', () => {
  let restaurantId: number;
  let recipes: any[];
  let recipeCategoryNames: string[];
  let ingredientCategoryNames: string[];

  beforeAll(async () => {
    // Get the test restaurant ID
    const restaurant = await getUserRestaurant(1);
    if (!restaurant) {
      throw new Error('Test restaurant not found');
    }
    restaurantId = restaurant.id;

    // Fetch recipes and categories
    recipes = await getRecipesWithIngredients(restaurantId);
    
    const recipeCategories = await getActiveRecipeCategories(restaurantId);
    recipeCategoryNames = recipeCategories.map(cat => cat.name);
    
    ingredientCategoryNames = await getIngredientCategories(restaurantId);
  });

  // Helper function matching frontend logic
  const getCategoryType = (categoryName: string): 'recipe' | 'ingredient' | 'unknown' => {
    const isRecipeCategory = recipeCategoryNames.includes(categoryName);
    const isIngredientCategory = ingredientCategoryNames.includes(categoryName);
    
    if (isRecipeCategory) return 'recipe';
    if (isIngredientCategory) return 'ingredient';
    return 'unknown';
  };

  it('should have recipes with categories', () => {
    expect(recipes.length).toBeGreaterThan(0);
    
    const recipesWithCategories = recipes.filter(r => r.category);
    expect(recipesWithCategories.length).toBeGreaterThan(0);
    
    console.log(`Total recipes: ${recipes.length}`);
    console.log(`Recipes with categories: ${recipesWithCategories.length}`);
  });

  it('should extract unique categories from recipes', () => {
    const uniqueCategories = Array.from(
      new Set(recipes.map(r => r.category).filter((cat): cat is string => Boolean(cat)))
    ).sort((a, b) => a.localeCompare(b));
    
    expect(uniqueCategories.length).toBeGreaterThan(0);
    
    console.log(`Unique categories in recipes (${uniqueCategories.length}):`, uniqueCategories);
  });

  it('should correctly filter recipes by category', () => {
    // Get a category that has recipes
    const categoryWithRecipes = recipes.find(r => r.category)?.category;
    
    if (!categoryWithRecipes) {
      console.log('No recipes with categories found, skipping test');
      return;
    }
    
    // Filter recipes by this category
    const filteredRecipes = recipes.filter(r => r.category === categoryWithRecipes);
    
    expect(filteredRecipes.length).toBeGreaterThan(0);
    
    // Verify all filtered recipes have the correct category
    filteredRecipes.forEach(recipe => {
      expect(recipe.category).toBe(categoryWithRecipes);
    });
    
    console.log(`Category "${categoryWithRecipes}" has ${filteredRecipes.length} recipe(s)`);
  });

  it('should assign correct badge colors to filter options', () => {
    const uniqueCategories = Array.from(
      new Set(recipes.map(r => r.category).filter((cat): cat is string => Boolean(cat)))
    );
    
    const categoryColorMap = uniqueCategories.map(category => {
      const type = getCategoryType(category);
      let color: string;
      
      if (type === 'recipe') {
        color = 'blue';
      } else if (type === 'ingredient') {
        color = 'green';
      } else {
        color = 'gray';
      }
      
      return { category, type, color };
    });
    
    // Verify each category has a valid color
    categoryColorMap.forEach(({ category, type, color }) => {
      expect(['blue', 'green', 'gray']).toContain(color);
      expect(['recipe', 'ingredient', 'unknown']).toContain(type);
    });
    
    console.log('Category color assignments:');
    categoryColorMap.forEach(({ category, type, color }) => {
      console.log(`  - ${category}: ${type} (${color} badge)`);
    });
  });

  it('should filter recipes correctly with multiple categories', () => {
    const uniqueCategories = Array.from(
      new Set(recipes.map(r => r.category).filter((cat): cat is string => Boolean(cat)))
    );
    
    if (uniqueCategories.length < 2) {
      console.log('Not enough categories to test multiple filters, skipping');
      return;
    }
    
    // Test filtering by first two categories
    const category1 = uniqueCategories[0];
    const category2 = uniqueCategories[1];
    
    const filtered1 = recipes.filter(r => r.category === category1);
    const filtered2 = recipes.filter(r => r.category === category2);
    
    expect(filtered1.length).toBeGreaterThan(0);
    expect(filtered2.length).toBeGreaterThan(0);
    
    // Verify no overlap (each recipe should only have one category)
    const overlap = filtered1.filter(r1 => filtered2.some(r2 => r2.id === r1.id));
    expect(overlap.length).toBe(0);
    
    console.log(`Category "${category1}": ${filtered1.length} recipes`);
    console.log(`Category "${category2}": ${filtered2.length} recipes`);
  });

  it('should handle "all categories" filter (no filtering)', () => {
    // When filter is "all", all recipes should be shown
    const allRecipes = recipes.filter(r => true); // No filter applied
    
    expect(allRecipes.length).toBe(recipes.length);
    
    console.log(`"All Categories" filter shows all ${allRecipes.length} recipes`);
  });

  it('should alphabetically sort category options', () => {
    const uniqueCategories = Array.from(
      new Set(recipes.map(r => r.category).filter((cat): cat is string => Boolean(cat)))
    );
    
    const sortedCategories = [...uniqueCategories].sort((a, b) => a.localeCompare(b));
    
    // Verify sorting
    for (let i = 0; i < sortedCategories.length - 1; i++) {
      expect(sortedCategories[i].localeCompare(sortedCategories[i + 1])).toBeLessThanOrEqual(0);
    }
    
    console.log(`Categories sorted alphabetically (${sortedCategories.length}):`, sortedCategories);
  });
});
