/**
 * Multi-Day Prep Planning
 * 
 * Generates consolidated prep plans across multiple days
 * with day-by-day breakdowns for efficient bulk ordering
 */

import { generatePrepPlan, PrepRecommendation } from "./prep-planning";

export interface DayBreakdown {
  date: string;
  quantity: number;
  recipes: {
    recipeId: number;
    recipeName: string;
    estimatedServings: number;
    ingredientQuantity: number;
  }[];
}

export interface MultiDayIngredient {
  ingredientId: number;
  ingredientName: string;
  category: string | null;
  unit: string;
  pieces: number | null;
  pieceWeightOz: number | null;
  totalQuantityAllDays: number;
  totalWithBuffer: number;
  dayBreakdowns: DayBreakdown[];
}

export interface MultiDayPrepPlan {
  startDate: string;
  endDate: string;
  totalDays: number;
  ingredients: MultiDayIngredient[];
  metrics: {
    totalIngredients: number;
    totalForecastRevenue: number;
    averageDailyRevenue: number;
  };
}

/**
 * Generate consolidated prep plan for multiple days
 */
export async function generateMultiDayPrepPlan(
  locationId: number,
  startDate: string,
  days: number,
  safetyBufferPercent: number = 10
): Promise<MultiDayPrepPlan> {
  if (days < 1 || days > 30) {
    throw new Error("Days must be between 1 and 30");
  }

  // Generate individual prep plans for each day
  const dailyPlans: Array<{
    date: string;
    plan: Awaited<ReturnType<typeof generatePrepPlan>>;
  }> = [];

  const start = new Date(startDate);
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);
    const dateStr = currentDate.toISOString().split("T")[0];

    const plan = await generatePrepPlan(locationId, dateStr, safetyBufferPercent);
    dailyPlans.push({ date: dateStr, plan });
  }

  // Consolidate ingredients across all days
  const ingredientMap = new Map<number, {
    name: string;
    category: string | null;
    unit: string;
    pieceWeightOz: number | null;
    totalQuantity: number;
    dayBreakdowns: Map<string, {
      quantity: number;
      recipes: Array<{
        recipeId: number;
        recipeName: string;
        estimatedServings: number;
        ingredientQuantity: number;
      }>;
    }>;
  }>();

  // Aggregate ingredients from all daily plans
  for (const { date, plan } of dailyPlans) {
    for (const rec of plan.recommendations) {
      if (!ingredientMap.has(rec.ingredientId)) {
        ingredientMap.set(rec.ingredientId, {
          name: rec.ingredientName,
          category: rec.category,
          unit: rec.unit,
          pieceWeightOz: rec.pieceWeightOz,
          totalQuantity: 0,
          dayBreakdowns: new Map(),
        });
      }

      const ingredient = ingredientMap.get(rec.ingredientId)!;
      ingredient.totalQuantity += rec.recommendedQuantity;

      // Add day breakdown
      ingredient.dayBreakdowns.set(date, {
        quantity: rec.recommendedQuantity,
        recipes: rec.recipes,
      });
    }
  }

  // Convert to MultiDayIngredient format
  const ingredients: MultiDayIngredient[] = [];
  for (const [ingredientId, data] of Array.from(ingredientMap.entries())) {
    const safetyBuffer = data.totalQuantity * (safetyBufferPercent / 100);
    const totalWithBuffer = data.totalQuantity + safetyBuffer;

    // Calculate total pieces if piece weight is available
    let totalPieces: number | null = null;
    if (data.pieceWeightOz && (data.unit === 'oz' || data.unit === 'lb')) {
      const totalOz = data.unit === 'lb' ? totalWithBuffer * 16 : totalWithBuffer;
      totalPieces = Math.ceil(totalOz / data.pieceWeightOz);
    }

    // Convert day breakdowns to array
    const dayBreakdowns: DayBreakdown[] = [];
    for (const { date } of dailyPlans) {
      const breakdown = data.dayBreakdowns.get(date);
      if (breakdown) {
        dayBreakdowns.push({
          date,
          quantity: breakdown.quantity,
          recipes: breakdown.recipes,
        });
      }
    }

    ingredients.push({
      ingredientId,
      ingredientName: data.name,
      category: data.category,
      unit: data.unit,
      pieces: totalPieces,
      pieceWeightOz: data.pieceWeightOz,
      totalQuantityAllDays: Math.round(data.totalQuantity),
      totalWithBuffer: Math.round(totalWithBuffer),
      dayBreakdowns,
    });
  }

  // Sort by total quantity (descending)
  ingredients.sort((a, b) => b.totalWithBuffer - a.totalWithBuffer);

  // Calculate metrics
  const totalForecastRevenue = dailyPlans.reduce(
    (sum, { plan }) => sum + plan.forecastRevenue,
    0
  );
  const averageDailyRevenue = totalForecastRevenue / days;

  const endDate = dailyPlans[dailyPlans.length - 1].date;

  return {
    startDate,
    endDate,
    totalDays: days,
    ingredients,
    metrics: {
      totalIngredients: ingredients.length,
      totalForecastRevenue: Math.round(totalForecastRevenue),
      averageDailyRevenue: Math.round(averageDailyRevenue),
    },
  };
}

/**
 * Get date range presets
 */
export function getDateRangePresets(): Array<{
  label: string;
  days: number;
  description: string;
}> {
  return [
    { label: "Tomorrow", days: 1, description: "Single day prep plan" },
    { label: "Next 3 Days", days: 3, description: "Short-term planning" },
    { label: "This Week", days: 7, description: "Weekly prep planning" },
    { label: "Next 2 Weeks", days: 14, description: "Bi-weekly bulk ordering" },
  ];
}
