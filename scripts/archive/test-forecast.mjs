import { generateForecast } from "./server/forecasting.ts";

console.log("Testing forecast generation...");

try {
  const result = await generateForecast(1, 7);
  console.log("\n✓ Success!");
  console.log("Forecast days:", result.forecasts.length);
  console.log("First forecast:", result.forecasts[0]);
} catch (error) {
  console.error("\n❌ Error:", error.message);
}
