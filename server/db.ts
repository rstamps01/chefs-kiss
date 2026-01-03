import { eq, and, sql, desc, isNotNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, recipes, ingredients, recipeIngredients, restaurants, locations, recipeCategories, ingredientUnits, unitCategories, ingredientConversions, unitConversions } from "../drizzle/schema";
import { ENV } from './_core/env';
import { convertUnit } from "./unitConversion";

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
  console.log('[DB] DEBUG: getRecipesWithIngredients called for restaurantId:', restaurantId);
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
  
  console.log(`[DB] DEBUG: Found ${allRecipes.length} recipes for restaurant ${restaurantId}`);
  const testShrimp = allRecipes.find(r => r.name === 'Test Shrimp Recipe');
  if (testShrimp) {
    console.log('[DB] DEBUG: Test Shrimp Recipe found:', testShrimp);
  } else {
    console.log('[DB] DEBUG: Test Shrimp Recipe NOT found in allRecipes');
  }

  // For each recipe, get its ingredients
  const recipesWithIngredients = await Promise.all(
    allRecipes.map(async (recipe) => {
      const recipeIngs = await db
        .select({
          ingredientId: recipeIngredients.ingredientId,
          ingredientName: ingredients.name,
          quantity: recipeIngredients.quantity,
          unit: recipeIngredients.unit, // Recipe unit (how it's used)
          ingredientUnit: ingredientUnits.name, // Ingredient storage unit NAME (not ID)
          category: ingredients.category,
          costPerUnit: ingredients.costPerUnit,
          pieceWeightOz: ingredients.pieceWeightOz, // Piece weight for pc→oz conversions
        })
        .from(recipeIngredients)
        .leftJoin(ingredients, eq(recipeIngredients.ingredientId, ingredients.id))
        .leftJoin(ingredientUnits, eq(ingredients.unit, ingredientUnits.name))
        .where(eq(recipeIngredients.recipeId, recipe.id));

      // Calculate costs with unit conversion
      const ingredientsWithCosts = await Promise.all(
        recipeIngs.map(async (ing) => {
          let convertedCost = 0;
          let conversionFactor: number | null = null;
          let conversionApplied = false;
          let conversionWarning: string | null = null;

          // Debug logging for Scallops
          if (ing.ingredientName && ing.ingredientName.includes('Scallops')) {
            console.log(`[DB] DEBUG SCALLOPS: ingredientId=${ing.ingredientId}, costPerUnit=${ing.costPerUnit}, unit="${ing.unit}", ingredientUnit="${ing.ingredientUnit}", ingredientName="${ing.ingredientName}"`);
          }

          if (ing.ingredientId && ing.costPerUnit && ing.unit && ing.ingredientUnit) {
            const recipeUnit = ing.unit;
            const ingredientUnit = ing.ingredientUnit;

            // Use mathjs for automatic unit conversion (supports multi-step conversions)
            console.log(`[DB] DEBUG: Converting for ingredient: "${ing.ingredientName}", ${ing.quantity} ${recipeUnit} → ${ingredientUnit}`);
            const convertedQuantity = convertUnit(
              Number(ing.quantity),
              recipeUnit,
              ingredientUnit,
              ing.pieceWeightOz ? Number(ing.pieceWeightOz) : null,  // Pass piece weight from database for pc conversions
              ing.ingredientName || undefined  // Pass ingredient name for cup conversions
            );

            if (convertedQuantity !== null) {
              // Conversion successful
              convertedCost = convertedQuantity * Number(ing.costPerUnit);
              conversionFactor = convertedQuantity / Number(ing.quantity);
              conversionApplied = recipeUnit !== ingredientUnit;
            } else {
              // Conversion failed - use direct multiplication with warning
              convertedCost = Number(ing.quantity) * Number(ing.costPerUnit);
              conversionWarning = `Failed to convert: ${recipeUnit} → ${ingredientUnit}`;
            }
          }

          return {
            ...ing,
            convertedCost: convertedCost.toFixed(2),
            conversionFactor,
            conversionApplied,
            conversionWarning,
          };
        })
      );

      return {
        ...recipe,
        ingredients: ingredientsWithCosts,
      };
    })
  );

  return recipesWithIngredients;
}

/**
 * Get all ingredients for a restaurant with unit display names
 */
export async function getIngredients(restaurantId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get ingredients: database not available");
    return [];
  }

  const results = await db
    .select({
      id: ingredients.id,
      restaurantId: ingredients.restaurantId,
      name: ingredients.name,
      category: ingredients.category,
      unit: ingredients.unit,
      unitDisplayName: ingredientUnits.displayName,
      costPerUnit: ingredients.costPerUnit,
      supplier: ingredients.supplier,
      pieceWeightOz: ingredients.pieceWeightOz,
      shelfLife: ingredients.shelfLife,
      minStock: ingredients.minStock,
      createdAt: ingredients.createdAt,
      updatedAt: ingredients.updatedAt,
    })
    .from(ingredients)
    .leftJoin(ingredientUnits, eq(ingredients.unit, ingredientUnits.id))
    .where(eq(ingredients.restaurantId, restaurantId));

  return results;
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

// ============================================================================
// SALES DATA IMPORT QUERIES
// ============================================================================

/**
 * Import sales data from CSV (bulk insert with conflict handling)
 */
export async function importSalesData(data: Array<{
  locationId: number;
  date: string;
  totalSales: number;
  totalOrders: number;
  lunchSales: number | null;
  dinnerSales: number | null;
  notes: string | null;
}>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  if (data.length === 0) {
    return { inserted: 0, updated: 0 };
  }

  // Import salesData table
  const { salesData } = await import("../drizzle/schema");

  // Calculate derived fields for each row
  const values = data.map(row => {
    const date = new Date(row.date);
    const dayOfWeek = date.getDay(); // 0=Sunday, 6=Saturday
    const averageOrderValue = row.totalOrders > 0 
      ? (row.totalSales / row.totalOrders).toFixed(2)
      : "0.00";

    return {
      locationId: row.locationId,
      date: date, // Use Date object instead of string
      totalSales: row.totalSales.toFixed(2),
      totalOrders: row.totalOrders,
      averageOrderValue,
      lunchSales: row.lunchSales ? row.lunchSales.toFixed(2) : null,
      dinnerSales: row.dinnerSales ? row.dinnerSales.toFixed(2) : null,
      dayOfWeek,
      isHoliday: false, // Default, can be updated later
      notes: row.notes,
    };
  });

  // Use onDuplicateKeyUpdate to handle conflicts (update if date+location exists)
  const { sql } = await import("drizzle-orm");
  await db.insert(salesData).values(values).onDuplicateKeyUpdate({
    set: {
      totalSales: sql`VALUES(totalSales)`,
      totalOrders: sql`VALUES(totalOrders)`,
      averageOrderValue: sql`VALUES(averageOrderValue)`,
      lunchSales: sql`VALUES(lunchSales)`,
      dinnerSales: sql`VALUES(dinnerSales)`,
      notes: sql`VALUES(notes)`,
    },
  });

  return { inserted: values.length, updated: 0 };
}

/**
 * Get sales data for a location within date range
 */
export async function getSalesData(locationId: number, startDate?: string, endDate?: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get sales data: database not available");
    return [];
  }

  const { salesData } = await import("../drizzle/schema");
  const { and, sql } = await import("drizzle-orm");

  // Build conditions
  const conditions = [eq(salesData.locationId, locationId)];
  if (startDate) {
    conditions.push(sql`${salesData.date} >= ${startDate}`);
  }
  if (endDate) {
    conditions.push(sql`${salesData.date} <= ${endDate}`);
  }

  return await db
    .select()
    .from(salesData)
    .where(and(...conditions));
}

/**
 * Check if sales data exists for a date range
 */
export async function checkExistingSalesData(
  locationId: number,
  dates: string[]
): Promise<string[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const { salesData } = await import("../drizzle/schema");

  // Get all sales data for location and filter in memory
  const allSales = await db
    .select({ date: salesData.date })
    .from(salesData)
    .where(eq(salesData.locationId, locationId));

  // Convert to string dates and filter
  const existingDates = allSales.map(row => {
    const date = row.date;
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return String(date);
  });

  // Return only dates that are in the input array
  return existingDates.filter(date => dates.includes(date));
}

// ============================================================================
// ANALYTICS QUERIES
// ============================================================================

/**
 * Get sales analytics summary for a location
 */
export async function getSalesAnalytics(
  locationId: number,
  startDate?: string,
  endDate?: string
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get sales analytics: database not available");
    return null;
  }

  const { salesData } = await import("../drizzle/schema");
  const { and, sql, sum, avg, count, min, max } = await import("drizzle-orm");

  // Build date filter conditions
  const conditions = [eq(salesData.locationId, locationId)];
  if (startDate) {
    conditions.push(sql`${salesData.date} >= ${startDate}`);
  }
  if (endDate) {
    conditions.push(sql`${salesData.date} <= ${endDate}`);
  }

  // Get aggregate statistics
  const stats = await db
    .select({
      totalSales: sum(salesData.totalSales),
      totalOrders: sum(salesData.totalOrders),
      avgOrderValue: avg(salesData.averageOrderValue),
      minSales: min(salesData.totalSales),
      maxSales: max(salesData.totalSales),
      recordCount: count(),
    })
    .from(salesData)
    .where(and(...conditions));

  return stats[0] || null;
}

/**
 * Get daily sales data for charting
 */
export async function getDailySalesData(
  locationId: number,
  startDate?: string,
  endDate?: string
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get daily sales: database not available");
    return [];
  }

  const { salesData } = await import("../drizzle/schema");
  const { and, sql, desc } = await import("drizzle-orm");

  const conditions = [eq(salesData.locationId, locationId)];
  if (startDate) {
    conditions.push(sql`${salesData.date} >= ${startDate}`);
  }
  if (endDate) {
    conditions.push(sql`${salesData.date} <= ${endDate}`);
  }

  return await db
    .select({
      date: salesData.date,
      totalSales: salesData.totalSales,
      totalOrders: salesData.totalOrders,
      averageOrderValue: salesData.averageOrderValue,
      lunchSales: salesData.lunchSales,
      dinnerSales: salesData.dinnerSales,
      dayOfWeek: salesData.dayOfWeek,
    })
    .from(salesData)
    .where(and(...conditions))
    .orderBy(salesData.date);
}

/**
 * Get sales aggregated by day of week
 */
export async function getSalesByDayOfWeek(
  locationId: number,
  startDate?: string,
  endDate?: string
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get sales by day: database not available");
    return [];
  }

  const { salesData } = await import("../drizzle/schema");
  const { and, sql, sum, avg, count } = await import("drizzle-orm");

  const conditions = [eq(salesData.locationId, locationId)];
  if (startDate) {
    conditions.push(sql`${salesData.date} >= ${startDate}`);
  }
  if (endDate) {
    conditions.push(sql`${salesData.date} <= ${endDate}`);
  }

  return await db
    .select({
      dayOfWeek: salesData.dayOfWeek,
      avgSales: avg(salesData.totalSales),
      totalSales: sum(salesData.totalSales),
      avgOrders: avg(salesData.totalOrders),
      recordCount: count(),
    })
    .from(salesData)
    .where(and(...conditions))
    .groupBy(salesData.dayOfWeek)
    .orderBy(salesData.dayOfWeek);
}

/**
 * Get date range of available sales data for a location
 */
export async function getSalesDateRange(locationId: number) {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const { salesData } = await import("../drizzle/schema");
  const { min, max } = await import("drizzle-orm");

  const result = await db
    .select({
      minDate: min(salesData.date),
      maxDate: max(salesData.date),
    })
    .from(salesData)
    .where(eq(salesData.locationId, locationId));

  return result[0] || null;
}

/**
 * Update a recipe
 */
export async function updateRecipe(
  recipeId: number,
  updates: {
    name?: string;
    description?: string;
    category?: string;
    servings?: number;
    prepTime?: number;
    cookTime?: number;
    sellingPrice?: string;
  }
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(recipes)
    .set(updates)
    .where(eq(recipes.id, recipeId));

  return { success: true };
}

/**
 * Update recipe ingredients (delete all and re-insert)
 */
export async function updateRecipeIngredients(
  recipeId: number,
  ingredients: Array<{
    ingredientId: number;
    quantity: number;
    unit: string;
  }>
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Delete existing ingredients
  await db
    .delete(recipeIngredients)
    .where(eq(recipeIngredients.recipeId, recipeId));

  // Insert new ingredients
  if (ingredients.length > 0) {
    await db.insert(recipeIngredients).values(
      ingredients.map(ing => ({
        recipeId,
        ingredientId: ing.ingredientId,
        quantity: ing.quantity.toString(),
        unit: ing.unit,
      }))
    );
  }

  return { success: true };
}

/**
 * Delete a recipe and its ingredients
 */
export async function deleteRecipe(recipeId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Delete recipe ingredients first (foreign key constraint)
  await db
    .delete(recipeIngredients)
    .where(eq(recipeIngredients.recipeId, recipeId));

  // Delete recipe
  await db
    .delete(recipes)
    .where(eq(recipes.id, recipeId));

  return { success: true };
}

// ============================================================================
// INGREDIENT MANAGEMENT QUERIES
// ============================================================================

/**
 * Create a new ingredient
 */
export async function createIngredient(data: {
  restaurantId: number;
  name: string;
  category?: string;
  unit: string;
  costPerUnit?: number;
  supplier?: string;
  shelfLife?: number;
  minStock?: number;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const [result] = await db.insert(ingredients).values({
    restaurantId: data.restaurantId,
    name: data.name,
    category: data.category,
    unit: data.unit,
    costPerUnit: data.costPerUnit?.toString(),
    supplier: data.supplier,
    shelfLife: data.shelfLife,
    minStock: data.minStock?.toString(),
  }).$returningId();

  return result.id;
}

/**
 * Update an existing ingredient
 */
export async function updateIngredient(ingredientId: number, data: {
  name?: string;
  category?: string;
  unit?: string;
  costPerUnit?: number;
  supplier?: string;
  shelfLife?: number;
  minStock?: number;
  pieceWeightOz?: number;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const updateData: Record<string, any> = {};
  
  if (data.name !== undefined) updateData.name = data.name;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.unit !== undefined) updateData.unit = data.unit;
  if (data.costPerUnit !== undefined) updateData.costPerUnit = data.costPerUnit.toString();
  if (data.supplier !== undefined) updateData.supplier = data.supplier;
  if (data.pieceWeightOz !== undefined) updateData.pieceWeightOz = data.pieceWeightOz;
  if (data.shelfLife !== undefined) updateData.shelfLife = data.shelfLife;
  if (data.minStock !== undefined) updateData.minStock = data.minStock.toString();

  await db
    .update(ingredients)
    .set(updateData)
    .where(eq(ingredients.id, ingredientId));

  return { success: true };
}

/**
 * Delete an ingredient
 */
export async function deleteIngredient(ingredientId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // First check if ingredient is used in any recipes
  const usageCheck = await db
    .select()
    .from(recipeIngredients)
    .where(eq(recipeIngredients.ingredientId, ingredientId))
    .limit(1);

  if (usageCheck.length > 0) {
    throw new Error("Cannot delete ingredient: it is used in one or more recipes");
  }

  // Delete ingredient
  await db
    .delete(ingredients)
    .where(eq(ingredients.id, ingredientId));

  return { success: true };
}

// ============================================================================
// RECIPE CATEGORIES
// ============================================================================

/**
 * Get all recipe categories for a restaurant
 */
export async function getRecipeCategories(restaurantId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const categories = await db
    .select()
    .from(recipeCategories)
    .where(eq(recipeCategories.restaurantId, restaurantId))
    .orderBy(recipeCategories.displayOrder, recipeCategories.name);

  return categories;
}

/**
 * Get only active recipe categories
 */
export async function getActiveRecipeCategories(restaurantId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const categories = await db
    .select()
    .from(recipeCategories)
    .where(
      and(
        eq(recipeCategories.restaurantId, restaurantId),
        eq(recipeCategories.isActive, true)
      )
    )
    .orderBy(recipeCategories.displayOrder, recipeCategories.name);

  return categories;
}

/**
 * Get distinct ingredient categories for a restaurant
 */
export async function getIngredientCategories(restaurantId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .selectDistinct({ category: ingredients.category })
    .from(ingredients)
    .where(
      and(
        eq(ingredients.restaurantId, restaurantId),
        isNotNull(ingredients.category)
      )
    )
    .orderBy(ingredients.category);

  return result.map(r => r.category).filter(Boolean);
}

/**
 * Create a new recipe category
 */
export async function createRecipeCategory(data: {
  restaurantId: number;
  name: string;
  isActive?: boolean;
  displayOrder?: number;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const [result] = await db.insert(recipeCategories).values({
    restaurantId: data.restaurantId,
    name: data.name,
    isActive: data.isActive ?? true,
    displayOrder: data.displayOrder ?? 0,
  }).$returningId();

  return { id: result.id, name: data.name, success: true };
}

/**
 * Update a recipe category
 */
export async function updateRecipeCategory(
  categoryId: number,
  data: {
    name?: string;
    isActive?: boolean;
    displayOrder?: number;
  }
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const updateData: Record<string, any> = {};
  
  if (data.name !== undefined) updateData.name = data.name;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;

  await db
    .update(recipeCategories)
    .set(updateData)
    .where(eq(recipeCategories.id, categoryId));

  return { success: true };
}

/**
 * Delete a recipe category
 */
export async function deleteRecipeCategory(categoryId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Check if category is used in any recipes
  const usageCheck = await db
    .select()
    .from(recipes)
    .where(eq(recipes.category, 
      db.select({ name: recipeCategories.name })
        .from(recipeCategories)
        .where(eq(recipeCategories.id, categoryId))
        .limit(1)
        .as('categoryName')
    ))
    .limit(1);

  if (usageCheck.length > 0) {
    throw new Error("Cannot delete category: it is used in one or more recipes");
  }

  await db
    .delete(recipeCategories)
    .where(eq(recipeCategories.id, categoryId));

  return { success: true };
}

// ============================================================================
// INGREDIENT UNITS
// ============================================================================

/**
 * Get all ingredient units for a restaurant
 */
export async function getIngredientUnits(restaurantId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const units = await db
    .select()
    .from(ingredientUnits)
    .where(eq(ingredientUnits.restaurantId, restaurantId))
    .orderBy(ingredientUnits.displayOrder, ingredientUnits.name);

  return units;
}

/**
 * Get only active ingredient units
 */
export async function getActiveIngredientUnits(restaurantId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const units = await db
    .select()
    .from(ingredientUnits)
    .where(
      and(
        eq(ingredientUnits.restaurantId, restaurantId),
        eq(ingredientUnits.isActive, true)
      )
    )
    .orderBy(ingredientUnits.displayOrder, ingredientUnits.name);

  return units;
}

/**
 * Create a new ingredient unit
 */
export async function createIngredientUnit(data: {
  restaurantId: number;
  name: string;
  displayName: string;
  isActive?: boolean;
  displayOrder?: number;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const [result] = await db.insert(ingredientUnits).values({
    restaurantId: data.restaurantId,
    name: data.name,
    displayName: data.displayName,
    isActive: data.isActive ?? true,
    displayOrder: data.displayOrder ?? 0,
  }).$returningId();

  return { id: result.id, name: data.name, displayName: data.displayName, success: true };
}

/**
 * Update an ingredient unit
 */
export async function updateIngredientUnit(
  unitId: number,
  data: {
    name?: string;
    displayName?: string;
    isActive?: boolean;
    displayOrder?: number;
  }
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const updateData: Record<string, any> = {};
  
  if (data.name !== undefined) updateData.name = data.name;
  if (data.displayName !== undefined) updateData.displayName = data.displayName;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;

  await db
    .update(ingredientUnits)
    .set(updateData)
    .where(eq(ingredientUnits.id, unitId));

  return { success: true };
}

/**
 * Delete an ingredient unit
 */
export async function deleteIngredientUnit(unitId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Get the unit name first
  const unit = await db
    .select()
    .from(ingredientUnits)
    .where(eq(ingredientUnits.id, unitId))
    .limit(1);

  if (unit.length === 0) {
    throw new Error("Unit not found");
  }

  // Check if unit is used in any ingredients
  const usageCheck = await db
    .select()
    .from(ingredients)
    .where(eq(ingredients.unit, unit[0].name))
    .limit(1);

  if (usageCheck.length > 0) {
    throw new Error("Cannot delete unit: it is used in one or more ingredients");
  }

  await db
    .delete(ingredientUnits)
    .where(eq(ingredientUnits.id, unitId));

  return { success: true };
}


// ============================================================================
// UNIT CATEGORIES
// ============================================================================

export async function getUnitCategories() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return db.select().from(unitCategories);
}

// ============================================================================
// INGREDIENT CONVERSIONS
// ============================================================================

export async function getIngredientConversions(restaurantId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return db
    .select()
    .from(ingredientConversions)
    .where(eq(ingredientConversions.restaurantId, restaurantId));
}

export async function getIngredientConversionsByIngredient(ingredientId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return db
    .select()
    .from(ingredientConversions)
    .where(eq(ingredientConversions.ingredientId, ingredientId));
}

export async function createIngredientConversion(data: {
  restaurantId: number;
  ingredientId: number;
  fromUnit: string;
  toUnit: string;
  conversionFactor: string;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const [result] = await db.insert(ingredientConversions).values(data);
  
  // Return the created conversion
  const created = await db
    .select()
    .from(ingredientConversions)
    .where(eq(ingredientConversions.id, Number(result.insertId)))
    .limit(1);

  return created[0];
}

export async function updateIngredientConversion(
  conversionId: number,
  data: {
    fromUnit?: string;
    toUnit?: string;
    conversionFactor?: string;
    notes?: string;
  }
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(ingredientConversions)
    .set(data)
    .where(eq(ingredientConversions.id, conversionId));

  // Return updated conversion
  const updated = await db
    .select()
    .from(ingredientConversions)
    .where(eq(ingredientConversions.id, conversionId))
    .limit(1);

  return updated[0];
}

export async function deleteIngredientConversion(conversionId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .delete(ingredientConversions)
    .where(eq(ingredientConversions.id, conversionId));

  return true;
}

/**
 * Get conversion factor between two units for a specific ingredient
 * Priority: ingredient-specific conversions → universal conversions
 * Returns null if no conversion exists
 */
export async function getConversionFactor(
  ingredientId: number,
  fromUnit: string,
  toUnit: string
): Promise<number | null> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Priority 1: Check for ingredient-specific conversion (direct)
  const ingredientDirect = await db
    .select()
    .from(ingredientConversions)
    .where(
      and(
        eq(ingredientConversions.ingredientId, ingredientId),
        eq(ingredientConversions.fromUnit, fromUnit),
        eq(ingredientConversions.toUnit, toUnit)
      )
    )
    .limit(1);

  if (ingredientDirect.length > 0) {
    return parseFloat(ingredientDirect[0].conversionFactor);
  }

  // Priority 2: Check for ingredient-specific conversion (reverse)
  const ingredientReverse = await db
    .select()
    .from(ingredientConversions)
    .where(
      and(
        eq(ingredientConversions.ingredientId, ingredientId),
        eq(ingredientConversions.fromUnit, toUnit),
        eq(ingredientConversions.toUnit, fromUnit)
      )
    )
    .limit(1);

  if (ingredientReverse.length > 0) {
    return 1 / parseFloat(ingredientReverse[0].conversionFactor);
  }

  // Priority 3: Check for universal conversion (direct)
  const universalDirect = await db
    .select()
    .from(unitConversions)
    .where(
      and(
        eq(unitConversions.fromUnit, fromUnit),
        eq(unitConversions.toUnit, toUnit)
      )
    )
    .limit(1);

  if (universalDirect.length > 0) {
    return parseFloat(universalDirect[0].conversionFactor);
  }

  // Priority 4: Check for universal conversion (reverse)
  const universalReverse = await db
    .select()
    .from(unitConversions)
    .where(
      and(
        eq(unitConversions.fromUnit, toUnit),
        eq(unitConversions.toUnit, fromUnit)
      )
    )
    .limit(1);

  if (universalReverse.length > 0) {
    return 1 / parseFloat(universalReverse[0].conversionFactor);
  }

  // No conversion found
  return null;
}
