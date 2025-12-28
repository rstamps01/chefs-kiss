/**
 * Prep Planning Engine
 * 
 * Calculates optimal ingredient quantities based on:
 * 1. Sales forecast predictions
 * 2. Recipe ingredient requirements
 * 3. Historical sales-to-recipe ratios
 * 4. Safety buffer for uncertainty
 */

import { getDb } from "./db";
import { recipes, recipeIngredients, ingredients, salesData } from "../drizzle/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { generateForecast } from "./forecasting";

export interface PrepRecommendation {
  ingredientId: number;
  ingredientName: string;
  recommendedQuantity: number;
  unit: string;
  safetyBuffer: number;
  totalWithBuffer: number;
  recipes: {
    recipeId: number;
    recipeName: string;
    estimatedServings: number;
    ingredientQuantity: number;
  }[];
}

export interface PrepPlanResult {
  date: string;
  forecastRevenue: number;
  recommendations: PrepRecommendation[];
  metrics: {
    totalIngredients: number;
    estimatedWasteReduction: number; // percentage
    confidenceLevel: number;
  };
}

/**
 * Generate prep plan for a specific date
 */
export async function generatePrepPlan(
  locationId: number,
  targetDate: string,
  safetyBufferPercent: number = 10
): Promise<PrepPlanResult> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Get forecast for the target date
  const forecast = await getForecastForDate(locationId, targetDate);
  if (!forecast) {
    throw new Error("Unable to generate forecast for the specified date");
  }

  // Get historical recipe mix (what % of sales each recipe represents)
  const recipeMix = await getRecipeMix(locationId);

  // Get all recipes with their ingredients
  const recipesWithIngredients = await getRecipesWithIngredients();

  // Calculate ingredient requirements
  const ingredientRequirements = new Map<number, {
    name: string;
    unit: string;
    totalQuantity: number;
    recipes: Array<{
      recipeId: number;
      recipeName: string;
      estimatedServings: number;
      ingredientQuantity: number;
    }>;
  }>();

  // For each recipe, estimate servings based on forecast and recipe mix
  for (const recipe of recipesWithIngredients) {
    // Skip recipes without required data
    if (!recipe.servings || !recipe.sellingPrice) continue;
    
    const recipeSalesPercent = recipeMix.get(recipe.id) || 0.1; // Default 10% if no history
    const estimatedRevenue = forecast.predictedRevenue * recipeSalesPercent;
    const estimatedServings = Math.ceil(estimatedRevenue / parseFloat(recipe.sellingPrice));

    // Calculate ingredient quantities for this recipe
    for (const recipeIngredient of recipe.ingredients) {
      const ingredientId = recipeIngredient.ingredientId;
      const ingredientName = recipeIngredient.ingredientName;
      const unit = recipeIngredient.unit;
      const quantityPerServing = parseFloat(recipeIngredient.quantity) / recipe.servings;
      const totalQuantity = quantityPerServing * estimatedServings;

      if (!ingredientRequirements.has(ingredientId)) {
        ingredientRequirements.set(ingredientId, {
          name: ingredientName,
          unit: unit,
          totalQuantity: 0,
          recipes: [],
        });
      }

      const ingredient = ingredientRequirements.get(ingredientId)!;
      ingredient.totalQuantity += totalQuantity;
      ingredient.recipes.push({
        recipeId: recipe.id,
        recipeName: recipe.name,
        estimatedServings,
        ingredientQuantity: totalQuantity,
      });
    }
  }

  // Convert to recommendations with safety buffer
  const recommendations: PrepRecommendation[] = [];
  for (const [ingredientId, data] of Array.from(ingredientRequirements.entries())) {
    const safetyBuffer = data.totalQuantity * (safetyBufferPercent / 100);
    recommendations.push({
      ingredientId,
      ingredientName: data.name,
      recommendedQuantity: Math.ceil(data.totalQuantity * 10) / 10, // Round to 1 decimal
      unit: data.unit,
      safetyBuffer: Math.ceil(safetyBuffer * 10) / 10,
      totalWithBuffer: Math.ceil((data.totalQuantity + safetyBuffer) * 10) / 10,
      recipes: data.recipes,
    });
  }

  // Sort by total quantity (descending)
  recommendations.sort((a, b) => b.totalWithBuffer - a.totalWithBuffer);

  // Calculate waste reduction (compared to over-preparing by 30%)
  const wasteReduction = ((30 - safetyBufferPercent) / 30) * 100;

  return {
    date: targetDate,
    forecastRevenue: forecast.predictedRevenue,
    recommendations,
    metrics: {
      totalIngredients: recommendations.length,
      estimatedWasteReduction: Math.round(wasteReduction),
      confidenceLevel: forecast.confidence,
    },
  };
}

/**
 * Get forecast for a specific date
 */
async function getForecastForDate(
  locationId: number,
  targetDate: string
): Promise<{ predictedRevenue: number; confidence: number } | null> {
  const target = new Date(targetDate);
  const today = new Date();
  const daysAhead = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysAhead < 1) {
    throw new Error("Target date must be in the future");
  }

  if (daysAhead > 30) {
    throw new Error("Cannot generate prep plan more than 30 days in advance");
  }

  const forecastResult = await generateForecast(locationId, daysAhead);
  const targetForecast = forecastResult.forecasts.find((f) => f.date === targetDate);

  if (!targetForecast) {
    return null;
  }

  // Calculate confidence level (inverse of relative interval width)
  const intervalWidth = targetForecast.confidenceUpper - targetForecast.confidenceLower;
  const relativeWidth = intervalWidth / targetForecast.predictedRevenue;
  const confidence = Math.round((1 - relativeWidth) * 100);

  return {
    predictedRevenue: targetForecast.predictedRevenue,
    confidence: Math.max(0, Math.min(100, confidence)),
  };
}

/**
 * Get recipe mix (percentage of sales each recipe represents)
 * Based on historical data or defaults
 */
async function getRecipeMix(locationId: number): Promise<Map<number, number>> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // For now, return equal distribution
  // In a real system, this would analyze historical order data
  const allRecipes = await db.select().from(recipes);
  const recipeMix = new Map<number, number>();
  const equalShare = 1 / allRecipes.length;

  allRecipes.forEach((recipe) => {
    recipeMix.set(recipe.id, equalShare);
  });

  return recipeMix;
}

/**
 * Get all recipes with their ingredients
 */
async function getRecipesWithIngredients(): Promise<
  Array<{
    id: number;
    name: string;
    servings: number | null;
    sellingPrice: string | null;
    ingredients: Array<{
      ingredientId: number;
      ingredientName: string;
      quantity: string;
      unit: string;
    }>;
  }>
> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const allRecipes = await db.select().from(recipes);
  const result = [];

  for (const recipe of allRecipes) {
    const recipeIngredientsData = await db
      .select({
        ingredientId: recipeIngredients.ingredientId,
        ingredientName: ingredients.name,
        quantity: recipeIngredients.quantity,
        unit: recipeIngredients.unit,
      })
      .from(recipeIngredients)
      .innerJoin(ingredients, eq(recipeIngredients.ingredientId, ingredients.id))
      .where(eq(recipeIngredients.recipeId, recipe.id));

    result.push({
      id: recipe.id,
      name: recipe.name,
      servings: recipe.servings,
      sellingPrice: recipe.sellingPrice,
      ingredients: recipeIngredientsData,
    });
  }

  return result;
}

/**
 * Generate prep plan for multiple days
 */
export async function generateMultiDayPrepPlan(
  locationId: number,
  startDate: string,
  days: number,
  safetyBufferPercent: number = 10
): Promise<PrepPlanResult[]> {
  const plans: PrepPlanResult[] = [];
  const start = new Date(startDate);

  for (let i = 0; i < days; i++) {
    const targetDate = new Date(start);
    targetDate.setDate(targetDate.getDate() + i);
    const dateString = targetDate.toISOString().split("T")[0];

    const plan = await generatePrepPlan(locationId, dateString, safetyBufferPercent);
    plans.push(plan);
  }

  return plans;
}
