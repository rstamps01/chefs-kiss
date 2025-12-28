import { generatePrepPlan } from "./server/prep-planning.ts";

async function test() {
  try {
    console.log("Testing prep planning with locationId=1, date=2025-12-29...");
    const result = await generatePrepPlan(1, "2025-12-29", 10);
    console.log("Success! Result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
  }
  process.exit(0);
}

test();
