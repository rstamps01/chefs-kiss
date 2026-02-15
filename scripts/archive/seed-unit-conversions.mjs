import { drizzle } from 'drizzle-orm/mysql2';
import { eq, and } from 'drizzle-orm';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.ts';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

const RESTAURANT_ID = 1;

// Get unit IDs
const [ozUnit] = await db.select().from(schema.ingredientUnits)
  .where(eq(schema.ingredientUnits.name, 'oz'))
  .limit(1);

const [piecesUnit] = await db.select().from(schema.ingredientUnits)
  .where(eq(schema.ingredientUnits.name, 'pieces'))
  .limit(1);

if (!ozUnit || !piecesUnit) {
  console.error('❌ Required units (oz, pieces) not found in database');
  await connection.end();
  process.exit(1);
}

console.log(`Found units: oz (ID: ${ozUnit.id}), pieces (ID: ${piecesUnit.id})`);

// Get all piece-based fish ingredients
const pieceBasedIngredients = await db.select()
  .from(schema.ingredients)
  .where(eq(schema.ingredients.unit, piecesUnit.id));

console.log(`\nFound ${pieceBasedIngredients.length} piece-based ingredients`);

// Create conversions for each piece-based ingredient
// Standard: 1 piece = 0.60 oz (as specified by user)
let added = 0;
let skipped = 0;

for (const ingredient of pieceBasedIngredients) {
  try {
    // Check if conversion already exists
    const [existing] = await db.select()
      .from(schema.ingredientConversions)
      .where(
        and(
          eq(schema.ingredientConversions.ingredientId, ingredient.id),
          eq(schema.ingredientConversions.fromUnit, 'pieces'),
          eq(schema.ingredientConversions.toUnit, 'oz')
        )
      )
      .limit(1);
    
    if (existing) {
      console.log(`⏭️  Skipped: ${ingredient.name} (conversion already exists)`);
      skipped++;
      continue;
    }
    
    // Insert conversion: 1 piece = 0.60 oz
    await db.insert(schema.ingredientConversions).values({
      restaurantId: RESTAURANT_ID,
      ingredientId: ingredient.id,
      fromUnit: 'pieces',
      toUnit: 'oz',
      conversionFactor: 0.60,
    });
    
    console.log(`✅ Added: ${ingredient.name} (1 piece = 0.60 oz)`);
    added++;
  } catch (error) {
    console.error(`❌ Error adding conversion for ${ingredient.name}:`, error.message);
  }
}

console.log(`\n✅ Unit conversion seed complete!`);
console.log(`   Added: ${added} conversions`);
console.log(`   Skipped: ${skipped} conversions (already exist)`);
console.log(`   Total: ${added + skipped}/${pieceBasedIngredients.length}`);

await connection.end();
