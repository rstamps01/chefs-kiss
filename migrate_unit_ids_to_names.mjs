import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { ingredients, ingredientUnits } from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

console.log('\n=== MIGRATING INGREDIENT UNIT IDS TO NAMES ===\n');

// Step 1: Get all unit mappings from ingredientUnits table
const units = await db
  .select({
    id: ingredientUnits.id,
    name: ingredientUnits.name,
  })
  .from(ingredientUnits);

const unitMap = {};
for (const unit of units) {
  unitMap[String(unit.id)] = unit.name;
}

console.log('Unit ID → Name mappings:');
for (const [id, name] of Object.entries(unitMap)) {
  console.log(`  ${id} → "${name}"`);
}
console.log('');

// Step 2: Get all ingredients
const allIngredients = await db
  .select({
    id: ingredients.id,
    name: ingredients.name,
    unit: ingredients.unit,
  })
  .from(ingredients)
  .where(eq(ingredients.restaurantId, 1));

console.log(`Found ${allIngredients.length} ingredients to check\n`);

// Step 3: Update ingredients with integer-as-string units
let updatedCount = 0;
let skippedCount = 0;

for (const ing of allIngredients) {
  const currentUnit = ing.unit;
  
  // Check if unit is an integer-as-string (e.g., "2", "3", "12")
  if (/^\d+$/.test(currentUnit)) {
    // It's an integer ID stored as string
    const unitName = unitMap[currentUnit];
    
    if (unitName) {
      console.log(`Updating: ${ing.name}`);
      console.log(`  Old unit: "${currentUnit}" (ID)`);
      console.log(`  New unit: "${unitName}" (name)`);
      
      await db
        .update(ingredients)
        .set({ unit: unitName })
        .where(eq(ingredients.id, ing.id));
      
      updatedCount++;
    } else {
      console.log(`⚠️  WARNING: No mapping found for unit ID "${currentUnit}" (ingredient: ${ing.name})`);
    }
  } else {
    // Already a string name, skip
    skippedCount++;
  }
}

console.log(`\n=== MIGRATION COMPLETE ===`);
console.log(`Updated: ${updatedCount} ingredients`);
console.log(`Skipped: ${skippedCount} ingredients (already using string names)`);

await connection.end();
