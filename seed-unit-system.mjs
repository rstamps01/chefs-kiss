/**
 * Seed Unit System with Categories and Standard Units
 * 
 * This script populates:
 * 1. Unit categories (Weight, Volume, Count, Custom)
 * 2. Standard units with conversion factors to base units
 * 3. Updates existing custom units to reference Custom category
 */

import { drizzle } from "drizzle-orm/mysql2";
import { sql, eq, and } from "drizzle-orm";
import mysql from "mysql2/promise";
import * as schema from "./drizzle/schema.js";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is not set");
  process.exit(1);
}

async function main() {
  console.log("🌱 Seeding unit system...\n");

  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection, { schema, mode: "default" });

  try {
    // Get the restaurant ID (assuming first restaurant)
    const restaurants = await db.select().from(schema.restaurants).limit(1);
    if (restaurants.length === 0) {
      console.error("❌ No restaurant found. Please create a restaurant first.");
      process.exit(1);
    }
    const restaurantId = restaurants[0].id;
    console.log(`✓ Using restaurant ID: ${restaurantId}\n`);

    // ========================================================================
    // 1. SEED UNIT CATEGORIES
    // ========================================================================
    console.log("📦 Seeding unit categories...");
    
    const categories = [
      {
        name: "Weight",
        baseUnit: "g",
        description: "Mass/weight measurements (grams base)",
        canAutoConvert: true,
      },
      {
        name: "Volume",
        baseUnit: "ml",
        description: "Liquid/volume measurements (milliliters base)",
        canAutoConvert: true,
      },
      {
        name: "Count",
        baseUnit: "each",
        description: "Countable items (each base)",
        canAutoConvert: true,
      },
      {
        name: "Custom",
        baseUnit: null,
        description: "Custom non-standard measurements requiring manual conversion",
        canAutoConvert: false,
      },
    ];

    const categoryMap = {};
    for (const cat of categories) {
      // Check if category exists
      const existing = await db
        .select()
        .from(schema.unitCategories)
        .where(eq(schema.unitCategories.name, cat.name));
      
      if (existing.length > 0) {
        categoryMap[cat.name] = existing[0].id;
        console.log(`  ✓ ${cat.name} (ID: ${existing[0].id}) - already exists`);
      } else {
        const [result] = await db.insert(schema.unitCategories).values(cat);
        categoryMap[cat.name] = Number(result.insertId);
        console.log(`  ✓ ${cat.name} (ID: ${result.insertId})`);
      }
    }
    console.log();

    // ========================================================================
    // 2. SEED STANDARD UNITS WITH CONVERSION FACTORS
    // ========================================================================
    console.log("⚖️  Seeding standard units...\n");

    // WEIGHT UNITS (base: grams)
    console.log("Weight units:");
    const weightUnits = [
      { name: "g", displayName: "Grams (g)", factor: 1.0 },
      { name: "kg", displayName: "Kilograms (kg)", factor: 1000.0 },
      { name: "oz", displayName: "Ounces (oz)", factor: 28.3495 },
      { name: "lb", displayName: "Pounds (lb)", factor: 453.592 },
    ];

    for (const unit of weightUnits) {
      // Check if unit exists
      const existing = await db
        .select()
        .from(schema.ingredientUnits)
        .where(and(eq(schema.ingredientUnits.restaurantId, restaurantId), eq(schema.ingredientUnits.name, unit.name)));
      
      if (existing.length > 0) {
        // Update existing unit
        await db
          .update(schema.ingredientUnits)
          .set({
            displayName: unit.displayName,
            categoryId: categoryMap["Weight"],
            conversionFactor: unit.factor.toString(),
            isStandard: true,
          })
          .where(eq(schema.ingredientUnits.id, existing[0].id));
        console.log(`  ✓ ${unit.displayName} = ${unit.factor}g (updated)`);
      } else {
        // Insert new unit
        await db.insert(schema.ingredientUnits).values({
          restaurantId,
          name: unit.name,
          displayName: unit.displayName,
          categoryId: categoryMap["Weight"],
          conversionFactor: unit.factor.toString(),
          isStandard: true,
          isActive: true,
          displayOrder: 0,
        });
        console.log(`  ✓ ${unit.displayName} = ${unit.factor}g`);
      }
    }
    console.log();

    // VOLUME UNITS (base: milliliters)
    console.log("Volume units:");
    const volumeUnits = [
      { name: "ml", displayName: "Milliliters (ml)", factor: 1.0 },
      { name: "l", displayName: "Liters (l)", factor: 1000.0 },
      { name: "tsp", displayName: "Teaspoons (tsp)", factor: 4.92892 },
      { name: "tbsp", displayName: "Tablespoons (tbsp)", factor: 14.7868 },
      { name: "cup", displayName: "Cups (cup)", factor: 236.588 },
      { name: "gal", displayName: "Gallons (gal)", factor: 3785.41 },
    ];

    for (const unit of volumeUnits) {
      const existing = await db
        .select()
        .from(schema.ingredientUnits)
        .where(and(eq(schema.ingredientUnits.restaurantId, restaurantId), eq(schema.ingredientUnits.name, unit.name)));
      
      if (existing.length > 0) {
        await db
          .update(schema.ingredientUnits)
          .set({
            displayName: unit.displayName,
            categoryId: categoryMap["Volume"],
            conversionFactor: unit.factor.toString(),
            isStandard: true,
          })
          .where(eq(schema.ingredientUnits.id, existing[0].id));
        console.log(`  ✓ ${unit.displayName} = ${unit.factor}ml (updated)`);
      } else {
        await db.insert(schema.ingredientUnits).values({
          restaurantId,
          name: unit.name,
          displayName: unit.displayName,
          categoryId: categoryMap["Volume"],
          conversionFactor: unit.factor.toString(),
          isStandard: true,
          isActive: true,
          displayOrder: 0,
        });
        console.log(`  ✓ ${unit.displayName} = ${unit.factor}ml`);
      }
    }
    console.log();

    // COUNT UNITS (base: each)
    console.log("Count units:");
    const countUnits = [
      { name: "each", displayName: "Each", factor: 1.0 },
      { name: "dozen", displayName: "Dozen (dz)", factor: 12.0 },
    ];

    for (const unit of countUnits) {
      const existing = await db
        .select()
        .from(schema.ingredientUnits)
        .where(and(eq(schema.ingredientUnits.restaurantId, restaurantId), eq(schema.ingredientUnits.name, unit.name)));
      
      if (existing.length > 0) {
        await db
          .update(schema.ingredientUnits)
          .set({
            displayName: unit.displayName,
            categoryId: categoryMap["Count"],
            conversionFactor: unit.factor.toString(),
            isStandard: true,
          })
          .where(eq(schema.ingredientUnits.id, existing[0].id));
        console.log(`  ✓ ${unit.displayName} = ${unit.factor} each (updated)`);
      } else {
        await db.insert(schema.ingredientUnits).values({
          restaurantId,
          name: unit.name,
          displayName: unit.displayName,
          categoryId: categoryMap["Count"],
          conversionFactor: unit.factor.toString(),
          isStandard: true,
          isActive: true,
          displayOrder: 0,
        });
        console.log(`  ✓ ${unit.displayName} = ${unit.factor} each`);
      }
    }
    console.log();

    // ========================================================================
    // 3. UPDATE EXISTING CUSTOM UNITS
    // ========================================================================
    console.log("🔧 Updating existing custom units...");
    
    // Get existing units that don't have a category yet
    const existingUnits = await db
      .select()
      .from(schema.ingredientUnits)
      .where(sql`${schema.ingredientUnits.categoryId} IS NULL`);

    for (const unit of existingUnits) {
      await db
        .update(schema.ingredientUnits)
        .set({
          categoryId: categoryMap["Custom"],
          isStandard: false,
          conversionFactor: null,
        })
        .where(eq(schema.ingredientUnits.id, unit.id));
      console.log(`  ✓ ${unit.displayName} → Custom category`);
    }

    console.log("\n✅ Unit system seeded successfully!");
    console.log("\n📊 Summary:");
    console.log(`  - 4 unit categories created`);
    console.log(`  - ${weightUnits.length} weight units (auto-convert)`);
    console.log(`  - ${volumeUnits.length} volume units (auto-convert)`);
    console.log(`  - ${countUnits.length} count units (auto-convert)`);
    console.log(`  - ${existingUnits.length} existing custom units updated`);

  } catch (error) {
    console.error("\n❌ Error seeding unit system:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

main();
