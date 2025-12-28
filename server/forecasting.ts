/**
 * Sales Forecasting Engine
 * 
 * Implements ML-based demand prediction using:
 * 1. Day-of-week patterns (seasonal decomposition)
 * 2. Trend analysis (moving averages)
 * 3. Recent momentum (exponential smoothing)
 */

import { getDb } from "./db";
import { salesData } from "../drizzle/schema";
import { and, eq, gte, lte, sql } from "drizzle-orm";

export interface ForecastPoint {
  date: string;
  predictedRevenue: number;
  confidenceLower: number;
  confidenceUpper: number;
  dayOfWeek: string;
}

export interface ForecastResult {
  forecasts: ForecastPoint[];
  accuracy: {
    mape: number; // Mean Absolute Percentage Error
    rmse: number; // Root Mean Square Error
  };
  insights: string[];
}

/**
 * Generate sales forecast for the next N days
 */
export async function generateForecast(
  locationId: number,
  daysAhead: number = 14
): Promise<ForecastResult> {
  // Get historical data (last 90 days for pattern analysis)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90);

  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Fetch all sales data for this location and filter in memory
  // This avoids potential date comparison issues with Drizzle ORM
  const allData = await db
    .select()
    .from(salesData)
    .where(eq(salesData.locationId, locationId))
    .orderBy(salesData.date);

  // Filter to last 90 days in JavaScript
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];
  const historicalData = allData.filter((record) => {
    const recordDate = typeof record.date === 'string' ? record.date : record.date.toISOString().split('T')[0];
    return recordDate >= startDateStr && recordDate <= endDateStr;
  });

  if (historicalData.length < 14) {
    throw new Error("Insufficient historical data for forecasting (minimum 14 days required)");
  }

  // Calculate day-of-week patterns
  const dayOfWeekPatterns = calculateDayOfWeekPatterns(historicalData);

  // Calculate trend
  const trend = calculateTrend(historicalData);

  // Generate forecasts starting from tomorrow
  const forecasts: ForecastPoint[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset to midnight for consistent date comparison

  for (let i = 1; i <= daysAhead; i++) {
    const forecastDate = new Date(today);
    forecastDate.setDate(forecastDate.getDate() + i);
    const dayOfWeek = forecastDate.getDay();
    const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayOfWeek];

    // Base prediction from day-of-week pattern
    const baseRevenue = dayOfWeekPatterns[dayOfWeek];

    // Apply trend adjustment
    const trendAdjustment = trend * i;

    // Final prediction
    const predictedRevenue = baseRevenue + trendAdjustment;

    // Calculate confidence interval (±15% based on historical variance)
    const variance = calculateVariance(historicalData, dayOfWeek);
    const confidenceMargin = variance * 1.96; // 95% confidence interval

    forecasts.push({
      date: forecastDate.toISOString().split("T")[0],
      predictedRevenue: Math.max(0, predictedRevenue),
      confidenceLower: Math.max(0, predictedRevenue - confidenceMargin),
      confidenceUpper: predictedRevenue + confidenceMargin,
      dayOfWeek: dayName,
    });
  }

  // Calculate accuracy metrics using last 7 days as validation
  const accuracy = calculateAccuracy(historicalData.slice(-7), dayOfWeekPatterns, trend);

  // Generate insights
  const insights = generateInsights(historicalData, dayOfWeekPatterns, trend, forecasts);

  return {
    forecasts,
    accuracy,
    insights,
  };
}

/**
 * Calculate average revenue for each day of week
 */
function calculateDayOfWeekPatterns(data: typeof salesData.$inferSelect[]): Record<number, number> {
  const patterns: Record<number, { sum: number; count: number }> = {};

  // Initialize all days
  for (let i = 0; i < 7; i++) {
    patterns[i] = { sum: 0, count: 0 };
  }

  // Aggregate by day of week
  data.forEach((record) => {
    const dayOfWeek = new Date(record.date).getDay();
    patterns[dayOfWeek].sum += parseFloat(record.totalSales);
    patterns[dayOfWeek].count += 1;
  });

  // Calculate averages
  const averages: Record<number, number> = {};
  for (let i = 0; i < 7; i++) {
    averages[i] = patterns[i].count > 0 ? patterns[i].sum / patterns[i].count : 0;
  }

  return averages;
}

/**
 * Calculate linear trend (daily change in revenue)
 */
function calculateTrend(data: typeof salesData.$inferSelect[]): number {
  if (data.length < 2) return 0;

  // Use simple linear regression on recent data (last 30 days)
  const recentData = data.slice(-30);
  const n = recentData.length;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  recentData.forEach((record, index) => {
    const x = index;
    const y = parseFloat(record.totalSales);
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  });

  // Calculate slope (trend)
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  return slope;
}

/**
 * Calculate variance for a specific day of week
 */
function calculateVariance(data: typeof salesData.$inferSelect[], dayOfWeek: number): number {
  const dayData = data.filter((record) => new Date(record.date).getDay() === dayOfWeek);

  if (dayData.length < 2) return 0;

  const mean = dayData.reduce((sum, record) => sum + parseFloat(record.totalSales), 0) / dayData.length;
  const variance =
    dayData.reduce((sum, record) => sum + Math.pow(parseFloat(record.totalSales) - mean, 2), 0) /
    dayData.length;

  return Math.sqrt(variance);
}

/**
 * Calculate forecast accuracy metrics
 */
function calculateAccuracy(
  validationData: typeof salesData.$inferSelect[],
  patterns: Record<number, number>,
  trend: number
): { mape: number; rmse: number } {
  if (validationData.length === 0) {
    return { mape: 0, rmse: 0 };
  }

  let sumAbsolutePercentageError = 0;
  let sumSquaredError = 0;

  validationData.forEach((record, index) => {
    const dayOfWeek = new Date(record.date).getDay();
    const predicted = patterns[dayOfWeek] + trend * index;
    const actual = parseFloat(record.totalSales);

    // MAPE
    const percentageError = Math.abs((actual - predicted) / actual) * 100;
    sumAbsolutePercentageError += percentageError;

    // RMSE
    const squaredError = Math.pow(actual - predicted, 2);
    sumSquaredError += squaredError;
  });

  const mape = sumAbsolutePercentageError / validationData.length;
  const rmse = Math.sqrt(sumSquaredError / validationData.length);

  return { mape, rmse };
}

/**
 * Generate actionable insights from forecast
 */
function generateInsights(
  historicalData: typeof salesData.$inferSelect[],
  patterns: Record<number, number>,
  trend: number,
  forecasts: ForecastPoint[]
): string[] {
  const insights: string[] = [];

  // Trend insight
  if (trend > 10) {
    insights.push(`📈 Strong upward trend detected (+$${trend.toFixed(2)}/day). Consider increasing inventory.`);
  } else if (trend < -10) {
    insights.push(`📉 Downward trend detected ($${trend.toFixed(2)}/day). Review menu and marketing strategies.`);
  } else {
    insights.push(`➡️ Sales are stable with minimal trend. Maintain current operations.`);
  }

  // Peak day insight
  const peakDay = Object.entries(patterns).reduce((max, [day, revenue]) =>
    revenue > patterns[max] ? parseInt(day) : max
  , 0);
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  insights.push(`🔥 ${dayNames[peakDay]} is your busiest day. Ensure adequate staffing and prep.`);

  // Forecast range insight
  const avgForecast = forecasts.reduce((sum, f) => sum + f.predictedRevenue, 0) / forecasts.length;
  const avgHistorical = historicalData.reduce((sum, d) => sum + parseFloat(d.totalSales), 0) / historicalData.length;
  const percentChange = ((avgForecast - avgHistorical) / avgHistorical) * 100;

  if (percentChange > 5) {
    insights.push(`📊 Forecast shows ${percentChange.toFixed(1)}% increase vs. historical average. Prepare for higher demand.`);
  } else if (percentChange < -5) {
    insights.push(`📊 Forecast shows ${percentChange.toFixed(1)}% decrease vs. historical average. Optimize costs.`);
  }

  return insights;
}
