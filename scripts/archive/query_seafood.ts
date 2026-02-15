import { db } from './server/database';
import { ingredients, ingredientUnits } from './drizzle/schema';
import { eq, or, like, sql } from 'drizzle-orm';

const rows = await db
  .select({
    id: ingredients.id,
    name: ingredients.name,
    category: ingredients.category,
    unit: ingredients.unit,
    unitName: ingredientUnits.displayName,
    costPerUnit: ingredients.costPerUnit,
    supplier: ingredients.supplier,
  })
  .from(ingredients)
  .leftJoin(ingredientUnits, eq(ingredients.unit, ingredientUnits.id))
  .where(
    or(
      like(ingredients.category, '%Fish%'),
      like(ingredients.category, '%Seafood%'),
      like(ingredients.name, '%Salmon%'),
      like(ingredients.name, '%Tuna%'),
      like(ingredients.name, '%Yellowtail%'),
      like(ingredients.name, '%Shrimp%'),
      like(ingredients.name, '%Scallop%'),
      like(ingredients.name, '%Crab%'),
      like(ingredients.name, '%Albacore%')
    )
  )
  .orderBy(ingredients.name);

console.log('Seafood Ingredients:');
console.log('='.repeat(120));
rows.forEach(row => {
  console.log(`ID: ${row.id} | ${row.name.padEnd(35)} | Unit: ${(row.unitName || 'NULL').padEnd(10)} | Cost: $${row.costPerUnit} | Category: ${row.category}`);
});
console.log('='.repeat(120));
console.log(`Total: ${rows.length} seafood ingredients`);

process.exit(0);
