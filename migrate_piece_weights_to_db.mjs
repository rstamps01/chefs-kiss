import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { eq } from 'drizzle-orm';
import * as schema from './drizzle/schema.ts';

// Existing hardcoded piece weights from unitConversion.ts
const existingPieceWeights = {
  'Scallops (Hokkaido Hotate)': 1.5,
  'Shrimp': 0.5,
  'Shrimp Tempura': 0.5,
  'Cooked Shrimp (Ebi)': 0.5,
  'Shrimp (cooked)': 0.5,
  'Test Shrimp': 0.5,
  'Salmon': 1.5,
  'Salmon (sashimi grade)': 1.5,
  'Cooked Salmon': 1.5,
  'Smoked Salmon': 1.0,
  'Salmon Belly': 2.0,
  'Tuna (sashimi grade)': 1.5,
  'Tuna (Ahi)': 1.5,
  'Tuna (Yellowfin)': 1.5,
  'Yellowtail': 1.5,
  'Yellowtail (sashimi grade)': 1.5,
  'Albacore': 1.5,
  'Albacore (sashimi grade)': 1.5,
  'Eel (Unagi)': 1.5,
  'Crab Stick (Kani Kama)': 0.75,
  'Snow Crab': 2.0,
  'Soft-Shell Crab': 3.0,
  'New York Steak (Sliced)': 2.5,
};

async function migratePieceWeights() {
  console.log('🔄 Starting piece weight migration...\n');
  
  // Create database connection
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(connection, { schema, mode: 'default' });
  
  let successCount = 0;
  let notFoundCount = 0;
  
  for (const [ingredientName, pieceWeight] of Object.entries(existingPieceWeights)) {
    try {
      const result = await db
        .update(schema.ingredients)
        .set({ pieceWeightOz: pieceWeight.toString() })
        .where(eq(schema.ingredients.name, ingredientName));
      
      if (result[0].affectedRows > 0) {
        console.log(`✅ ${ingredientName}: ${pieceWeight} oz/piece`);
        successCount++;
      } else {
        console.log(`⚠️  ${ingredientName}: NOT FOUND in database`);
        notFoundCount++;
      }
    } catch (error) {
      console.error(`❌ ${ingredientName}: Error - ${error.message}`);
    }
  }
  
  console.log(`\n📊 Migration Summary:`);
  console.log(`   ✅ Successfully updated: ${successCount} ingredients`);
  console.log(`   ⚠️  Not found: ${notFoundCount} ingredients`);
  console.log(`   📝 Total processed: ${Object.keys(existingPieceWeights).length} ingredients`);
  
  await connection.end();
  console.log('\n✨ Migration complete!');
}

migratePieceWeights().catch(console.error);
