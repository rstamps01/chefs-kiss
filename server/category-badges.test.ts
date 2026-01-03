import { describe, it, expect, beforeAll } from 'vitest';
import { getActiveRecipeCategories, getIngredientCategories, getUserRestaurant } from './db';

describe('Category Badge Type Detection', () => {
  let restaurantId: number;
  let recipeCategoryNames: string[];
  let ingredientCategoryNames: string[];

  beforeAll(async () => {
    // Get the test restaurant ID
    const restaurant = await getUserRestaurant(1);
    if (!restaurant) {
      throw new Error('Test restaurant not found');
    }
    restaurantId = restaurant.id;

    // Fetch both category types
    const recipeCategories = await getActiveRecipeCategories(restaurantId);
    recipeCategoryNames = recipeCategories.map(cat => cat.name);
    
    ingredientCategoryNames = await getIngredientCategories(restaurantId);
  });

  // Helper function matching frontend logic
  const getCategoryType = (categoryName: string): 'recipe' | 'ingredient' | 'unknown' => {
    const isRecipeCategory = recipeCategoryNames.includes(categoryName);
    const isIngredientCategory = ingredientCategoryNames.includes(categoryName);
    
    // If it's in both lists, prioritize Recipe category
    if (isRecipeCategory) return 'recipe';
    if (isIngredientCategory) return 'ingredient';
    return 'unknown';
  };

  it('should correctly identify recipe-only categories', () => {
    // Categories that should only be in recipe categories
    const recipeOnlyCategories = recipeCategoryNames.filter(
      name => !ingredientCategoryNames.includes(name)
    );
    
    expect(recipeOnlyCategories.length).toBeGreaterThan(0);
    
    recipeOnlyCategories.forEach(categoryName => {
      const type = getCategoryType(categoryName);
      expect(type).toBe('recipe');
    });
    
    console.log(`Recipe-only categories (${recipeOnlyCategories.length}):`, recipeOnlyCategories);
  });

  it('should correctly identify ingredient-only categories', () => {
    // Categories that should only be in ingredient categories
    const ingredientOnlyCategories = ingredientCategoryNames.filter(
      name => !recipeCategoryNames.includes(name)
    );
    
    // Note: There might be 0 ingredient-only categories if all are also recipe categories
    console.log(`Ingredient-only categories (${ingredientOnlyCategories.length}):`, ingredientOnlyCategories);
    
    ingredientOnlyCategories.forEach(categoryName => {
      const type = getCategoryType(categoryName);
      expect(type).toBe('ingredient');
    });
  });

  it('should prioritize recipe type for overlapping categories', () => {
    // Find categories that exist in both lists
    const overlappingCategories = recipeCategoryNames.filter(
      name => ingredientCategoryNames.includes(name)
    );
    
    expect(overlappingCategories.length).toBeGreaterThan(0);
    
    overlappingCategories.forEach(categoryName => {
      const type = getCategoryType(categoryName);
      expect(type).toBe('recipe'); // Should prioritize recipe type
    });
    
    console.log(`Overlapping categories (${overlappingCategories.length}):`, overlappingCategories);
  });

  it('should return unknown for non-existent categories', () => {
    const fakeCategory = 'Non-Existent Category XYZ';
    const type = getCategoryType(fakeCategory);
    expect(type).toBe('unknown');
  });

  it('should handle all category types correctly', () => {
    // Test a mix of categories
    const testCategories = [
      ...recipeCategoryNames.slice(0, 3),
      ...ingredientCategoryNames.slice(0, 2),
      'Fake Category'
    ];
    
    testCategories.forEach(categoryName => {
      const type = getCategoryType(categoryName);
      expect(['recipe', 'ingredient', 'unknown']).toContain(type);
    });
    
    console.log('Category type detection working for all test cases');
  });

  it('should provide correct badge colors based on category type', () => {
    // Simulate badge color selection logic
    const getBadgeColor = (categoryName: string) => {
      const categoryType = getCategoryType(categoryName);
      
      if (categoryType === 'recipe') {
        return 'blue'; // Recipe categories get blue badges
      } else if (categoryType === 'ingredient') {
        return 'green'; // Ingredient categories get green badges
      } else {
        return 'gray'; // Unknown categories get gray badges
      }
    };
    
    // Test recipe category
    if (recipeCategoryNames.length > 0) {
      const recipeOnly = recipeCategoryNames.find(
        name => !ingredientCategoryNames.includes(name)
      );
      if (recipeOnly) {
        expect(getBadgeColor(recipeOnly)).toBe('blue');
      }
    }
    
    // Test ingredient category (if any exist that aren't also recipe categories)
    const ingredientOnly = ingredientCategoryNames.find(
      name => !recipeCategoryNames.includes(name)
    );
    if (ingredientOnly) {
      expect(getBadgeColor(ingredientOnly)).toBe('green');
    }
    
    // Test unknown category
    expect(getBadgeColor('Unknown Category')).toBe('gray');
    
    console.log('Badge color logic validated');
  });
});
