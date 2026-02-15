import { generateForecast } from "./server/forecasting.ts";

async function test() {
  try {
    console.log("Testing forecast generation for locationId=1, daysAhead=1...");
    const result = await generateForecast(1, 1);
    console.log("Success! Forecasts:", result.forecasts.map(f => ({ date: f.date, revenue: f.predictedRevenue })));
    console.log("Target date should be: 2025-12-29");
  } catch (error) {
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
  }
  process.exit(0);
}

test();
