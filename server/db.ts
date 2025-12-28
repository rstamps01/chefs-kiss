import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, recipes, ingredients, recipeIngredients, restaurants, locations } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// RECIPE & INGREDIENT QUERIES
// ============================================================================

/**
 * Get all recipes with their ingredients
 */
export async function getRecipesWithIngredients(restaurantId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get recipes: database not available");
    return [];
  }

  // Get all recipes for the restaurant
  const allRecipes = await db
    .select()
    .from(recipes)
    .where(eq(recipes.restaurantId, restaurantId));

  // For each recipe, get its ingredients
  const recipesWithIngredients = await Promise.all(
    allRecipes.map(async (recipe) => {
      const recipeIngs = await db
        .select({
          ingredientId: recipeIngredients.ingredientId,
          ingredientName: ingredients.name,
          quantity: recipeIngredients.quantity,
          unit: recipeIngredients.unit,
          category: ingredients.category,
        })
        .from(recipeIngredients)
        .leftJoin(ingredients, eq(recipeIngredients.ingredientId, ingredients.id))
        .where(eq(recipeIngredients.recipeId, recipe.id));

      return {
        ...recipe,
        ingredients: recipeIngs,
      };
    })
  );

  return recipesWithIngredients;
}

/**
 * Get all ingredients for a restaurant
 */
export async function getIngredients(restaurantId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get ingredients: database not available");
    return [];
  }

  return await db
    .select()
    .from(ingredients)
    .where(eq(ingredients.restaurantId, restaurantId));
}

/**
 * Get user's restaurant
 */
export async function getUserRestaurant(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get restaurant: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.ownerId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get restaurant locations
 */
export async function getRestaurantLocations(restaurantId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get locations: database not available");
    return [];
  }

  return await db
    .select()
    .from(locations)
    .where(eq(locations.restaurantId, restaurantId));
}

/**
 * Create a new recipe
 */
export async function createRecipe(data: {
  restaurantId: number;
  name: string;
  category: string;
  servings: number;
  prepTime?: number;
  cookTime?: number;
  sellingPrice: number;
  description?: string;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const [result] = await db.insert(recipes).values({
    restaurantId: data.restaurantId,
    name: data.name,
    category: data.category,
    servings: data.servings,
    prepTime: data.prepTime,
    cookTime: data.cookTime,
    sellingPrice: data.sellingPrice.toString(),
    description: data.description,
    isActive: true,
  }).$returningId();

  return result.id;
}

/**
 * Add ingredients to a recipe
 */
export async function addRecipeIngredients(data: {
  recipeId: number;
  ingredients: Array<{
    ingredientId: number;
    quantity: number;
    unit: string;
  }>;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  if (data.ingredients.length === 0) {
    return;
  }

  await db.insert(recipeIngredients).values(
    data.ingredients.map(ing => ({
      recipeId: data.recipeId,
      ingredientId: ing.ingredientId,
      quantity: ing.quantity.toString(),
      unit: ing.unit,
    }))
  );
}
