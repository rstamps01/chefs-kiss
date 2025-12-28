import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.ts';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

// Get unit IDs
const [piecesUnit] = await db.select().from(schema.ingredientUnits)
  .where(eq(schema.ingredientUnits.name, 'pieces'))
  .limit(1);

if (!piecesUnit) {
  console.error('❌ Required unit (pieces) not found in database');
  await connection.end();
  process.exit(1);
}

console.log(`Found unit: pieces (ID: ${piecesUnit.id})\n`);

// Sashimi-grade fish to update
// Formula: (cost_per_lb / 16 oz/lb) × 0.60 oz/piece = cost_per_piece
const sashimiUpdates = [
  {
    name: 'Tuna (sashimi grade)',
    oldCost: 25.00, // per lb
    newCost: (25.00 / 16) * 0.60, // $0.9375 per piece
  },
  {
    name: 'Salmon (sashimi grade)',
    oldCost: 20.00, // per lb
    newCost: (20.00 / 16) * 0.60, // $0.75 per piece
  },
  {
    name: 'Yellowtail (sashimi grade)',
    oldCost: 25.00, // per lb
    newCost: (25.00 / 16) * 0.60, // $0.9375 per piece
  },
  {
    name: 'Albacore (sashimi grade)',
    oldCost: 23.00, // per lb
    newCost: (23.00 / 16) * 0.60, // $0.8625 per piece
  },
];

console.log('=== Updating Sashimi-Grade Fish Ingredients ===\n');

for (const update of sashimiUpdates) {
  try {
    // Find ingredient
    const [ingredient] = await db.select()
      .from(schema.ingredients)
      .where(eq(schema.ingredients.name, update.name))
      .limit(1);
    
    if (!ingredient) {
      console.log(`⏭️  Skipped: ${update.name} (not found)`);
      continue;
    }
    
    // Update ingredient unit and cost
    await db.update(schema.ingredients)
      .set({
        unit: piecesUnit.id,
        costPerUnit: update.newCost.toFixed(4),
      })
      .where(eq(schema.ingredients.id, ingredient.id));
    
    console.log(`✅ Updated: ${update.name}`);
    console.log(`   Old: $${update.oldCost.toFixed(2)}/lb`);
    console.log(`   New: $${update.newCost.toFixed(4)}/piece`);
    console.log(`   Calculation: ($${update.oldCost}/lb ÷ 16 oz/lb) × 0.60 oz/piece = $${update.newCost.toFixed(4)}/piece\n`);
  } catch (error) {
    console.error(`❌ Error updating ${update.name}:`, error.message);
  }
}

console.log('✅ Sashimi-grade fish ingredient units updated!');
console.log('\nNote: Unit conversions (pieces → oz) are still in place for other calculations.');

await connection.end();
