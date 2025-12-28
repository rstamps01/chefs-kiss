import { generatePrepPlan } from "./server/prep-planning.ts";

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const targetDate = tomorrow.toISOString().split("T")[0];

console.log("Testing prep plan generation for:", targetDate);

try {
  const result = await generatePrepPlan(1, targetDate, 10);
  console.log("\n✓ Success!");
  console.log("Forecast Revenue:", result.forecastRevenue);
  console.log("Total Ingredients:", result.metrics.totalIngredients);
  console.log("Recommendations:", result.recommendations.length);
  
  if (result.recommendations.length > 0) {
    console.log("\nTop 3 ingredients:");
    result.recommendations.slice(0, 3).forEach(rec => {
      console.log(`  - ${rec.ingredientName}: ${rec.totalWithBuffer} ${rec.unit}`);
    });
  }
} catch (error) {
  console.error("\n❌ Error:", error.message);
  console.error(error.stack);
}
