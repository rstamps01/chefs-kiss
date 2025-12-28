/**
 * Seed script for initial recipe categories and ingredient units
 * Run with: node seed-categories-units.mjs
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./drizzle/schema.js";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

async function main() {
  console.log("Connecting to database...");
  
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection, { schema, mode: "default" });

  console.log("Seeding recipe categories...");
  
  // Get the first restaurant ID (assuming Sushi Confidential)
  const restaurants = await db.select().from(schema.restaurants).limit(1);
  
  if (restaurants.length === 0) {
    console.error("No restaurant found. Please create a restaurant first.");
    await connection.end();
    process.exit(1);
  }

  const restaurantId = restaurants[0].id;
  console.log(`Using restaurant ID: ${restaurantId}`);

  // Seed recipe categories
  const categories = [
    { name: "Sushi Rolls", displayOrder: 1 },
    { name: "Nigiri", displayOrder: 2 },
    { name: "Sashimi", displayOrder: 3 },
    { name: "Specialty Rolls", displayOrder: 4 },
    { name: "Appetizers", displayOrder: 5 },
    { name: "Soups & Salads", displayOrder: 6 },
    { name: "Entrees", displayOrder: 7 },
    { name: "Desserts", displayOrder: 8 },
  ];

  for (const category of categories) {
    try {
      await db.insert(schema.recipeCategories).values({
        restaurantId,
        name: category.name,
        isActive: true,
        displayOrder: category.displayOrder,
      });
      console.log(`✓ Created category: ${category.name}`);
    } catch (error) {
      console.log(`  Category "${category.name}" may already exist, skipping...`);
    }
  }

  console.log("\nSeeding ingredient units...");

  // Seed ingredient units
  const units = [
    { name: "pieces", displayName: "Pieces", displayOrder: 1 },
    { name: "oz", displayName: "Ounces (oz)", displayOrder: 2 },
    { name: "lb", displayName: "Pounds (lb)", displayOrder: 3 },
    { name: "kg", displayName: "Kilograms (kg)", displayOrder: 4 },
    { name: "g", displayName: "Grams (g)", displayOrder: 5 },
    { name: "roll", displayName: "Roll", displayOrder: 6 },
    { name: "cup", displayName: "Cup", displayOrder: 7 },
    { name: "tbsp", displayName: "Tablespoon (tbsp)", displayOrder: 8 },
    { name: "tsp", displayName: "Teaspoon (tsp)", displayOrder: 9 },
    { name: "ml", displayName: "Milliliters (ml)", displayOrder: 10 },
    { name: "l", displayName: "Liters (l)", displayOrder: 11 },
    { name: "each", displayName: "Each", displayOrder: 12 },
  ];

  for (const unit of units) {
    try {
      await db.insert(schema.ingredientUnits).values({
        restaurantId,
        name: unit.name,
        displayName: unit.displayName,
        isActive: true,
        displayOrder: unit.displayOrder,
      });
      console.log(`✓ Created unit: ${unit.displayName}`);
    } catch (error) {
      console.log(`  Unit "${unit.name}" may already exist, skipping...`);
    }
  }

  console.log("\n✅ Seeding complete!");
  await connection.end();
}

main().catch((error) => {
  console.error("Error seeding data:", error);
  process.exit(1);
});
