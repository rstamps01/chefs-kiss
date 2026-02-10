/**
 * ID Lookup Helpers
 * 
 * Provides utilities for looking up database IDs by name for CSV import workflows
 */

import { getDb } from "./db.js";
import { ingredients, recipes } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Look up ingredient IDs by names for a given restaurant
 * Returns a map of lowercase name -> ID
 */
export async function lookupIngredientIdsByNames(
  restaurantId: number,
  names: string[]
): Promise<Map<string, number>> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Normalize names to lowercase for case-insensitive matching
  const normalizedNames = names.map(n => n.toLowerCase().trim());

  // Query all ingredients for this restaurant that match the names
  const matchingIngredients = await db
    .select({
      id: ingredients.id,
      name: ingredients.name,
    })
    .from(ingredients)
    .where(eq(ingredients.restaurantId, restaurantId));

  // Build map of lowercase name -> ID
  const nameToIdMap = new Map<string, number>();
  
  for (const ingredient of matchingIngredients) {
    const normalizedDbName = ingredient.name.toLowerCase().trim();
    if (normalizedNames.includes(normalizedDbName)) {
      nameToIdMap.set(normalizedDbName, ingredient.id);
    }
  }

  return nameToIdMap;
}

/**
 * Look up recipe IDs by names for a given restaurant
 * Returns a map of lowercase name -> ID
 */
export async function lookupRecipeIdsByNames(
  restaurantId: number,
  names: string[]
): Promise<Map<string, number>> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Normalize names to lowercase for case-insensitive matching
  const normalizedNames = names.map(n => n.toLowerCase().trim());

  // Query all recipes for this restaurant that match the names
  const matchingRecipes = await db
    .select({
      id: recipes.id,
      name: recipes.name,
    })
    .from(recipes)
    .where(eq(recipes.restaurantId, restaurantId));

  // Build map of lowercase name -> ID
  const nameToIdMap = new Map<string, number>();
  
  for (const recipe of matchingRecipes) {
    const normalizedDbName = recipe.name.toLowerCase().trim();
    if (normalizedNames.includes(normalizedDbName)) {
      nameToIdMap.set(normalizedDbName, recipe.id);
    }
  }

  return nameToIdMap;
}
