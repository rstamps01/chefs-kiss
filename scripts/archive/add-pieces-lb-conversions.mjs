import { drizzle } from 'drizzle-orm/mysql2';
import { eq, and } from 'drizzle-orm';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.ts';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

const RESTAURANT_ID = 1;

console.log('Adding pieces → lb conversions for seafood ingredients...\n');

// 1 piece = 0.60 oz = 0.0375 lb (0.60 / 16)
const PIECES_TO_LB_FACTOR = 0.60 / 16;

console.log(`Conversion factor: 1 piece = ${PIECES_TO_LB_FACTOR} lb\n`);

// Get all ingredients stored in lb (unit ID 3)
const lbIngredients = await db.select()
  .from(schema.ingredients)
  .where(
    and(
      eq(schema.ingredients.restaurantId, RESTAURANT_ID),
      eq(schema.ingredients.unit, 3) // lb unit ID
    )
  );

console.log(`Found ${lbIngredients.length} ingredients stored in lb\n`);

let added = 0;
let skipped = 0;

for (const ingredient of lbIngredients) {
  try {
    // Check if conversion already exists
    const [existing] = await db.select()
      .from(schema.ingredientConversions)
      .where(
        and(
          eq(schema.ingredientConversions.ingredientId, ingredient.id),
          eq(schema.ingredientConversions.fromUnit, 'pieces'),
          eq(schema.ingredientConversions.toUnit, 'lb')
        )
      )
      .limit(1);
    
    if (existing) {
      console.log(`⏭️  ${ingredient.name}: conversion already exists`);
      skipped++;
      continue;
    }
    
    // Insert conversion
    await db.insert(schema.ingredientConversions).values({
      restaurantId: RESTAURANT_ID,
      ingredientId: ingredient.id,
      fromUnit: 'pieces',
      toUnit: 'lb',
      conversionFactor: PIECES_TO_LB_FACTOR,
      notes: '1 piece = 0.60 oz = 0.0375 lb',
    });
    
    console.log(`✅ ${ingredient.name}: added pieces → lb conversion`);
    added++;
  } catch (error) {
    console.error(`❌ Error adding conversion for ${ingredient.name}:`, error.message);
  }
}

console.log(`\n✅ Added ${added} pieces → lb conversions`);
console.log(`⏭️  Skipped ${skipped} (already exist)`);

await connection.end();
