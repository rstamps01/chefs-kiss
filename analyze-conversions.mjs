import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.ts';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

console.log('=== Analyzing Unit Conversion Requirements ===\n');

// Get all recipes with ingredients
const recipes = await db.select().from(schema.recipes).limit(5);

for (const recipe of recipes) {
  console.log(`\n📋 ${recipe.name}`);
  console.log('─'.repeat(70));
  
  const recipeIngs = await db
    .select({
      ingredientId: schema.recipeIngredients.ingredientId,
      ingredientName: schema.ingredients.name,
      quantity: schema.recipeIngredients.quantity,
      recipeUnit: schema.recipeIngredients.unit,
      ingredientUnitId: schema.ingredients.unit,
    })
    .from(schema.recipeIngredients)
    .leftJoin(schema.ingredients, eq(schema.recipeIngredients.ingredientId, schema.ingredients.id))
    .where(eq(schema.recipeIngredients.recipeId, recipe.id));
  
  for (const ing of recipeIngs) {
    // Get ingredient unit name
    const [ingredientUnit] = await db
      .select()
      .from(schema.ingredientUnits)
      .where(eq(schema.ingredientUnits.id, ing.ingredientUnitId))
      .limit(1);
    
    const ingredientUnitName = ingredientUnit?.name || 'unknown';
    
    if (ing.recipeUnit !== ingredientUnitName) {
      // Check if conversion exists
      const [conversion] = await db
        .select()
        .from(schema.ingredientConversions)
        .where(eq(schema.ingredientConversions.ingredientId, ing.ingredientId))
        .limit(1);
      
      const status = conversion ? '✅ HAS' : '❌ MISSING';
      console.log(`  ${status} ${ing.ingredientName}`);
      console.log(`      Recipe uses: ${ing.quantity} ${ing.recipeUnit}`);
      console.log(`      Stored as: ${ingredientUnitName}`);
      console.log(`      Need: ${ing.recipeUnit} → ${ingredientUnitName}`);
      
      if (conversion) {
        console.log(`      Conversion: ${conversion.fromUnit} → ${conversion.toUnit} (factor: ${conversion.conversionFactor})`);
      }
      console.log();
    }
  }
}

// Summary: Get all unique unit mismatches
console.log('\n=== Summary: All Unit Mismatches ===\n');

const allRecipeIngs = await db
  .select({
    ingredientId: schema.recipeIngredients.ingredientId,
    ingredientName: schema.ingredients.name,
    recipeUnit: schema.recipeIngredients.unit,
    ingredientUnitId: schema.ingredients.unit,
  })
  .from(schema.recipeIngredients)
  .leftJoin(schema.ingredients, eq(schema.recipeIngredients.ingredientId, schema.ingredients.id));

const mismatches = new Map();

for (const ing of allRecipeIngs) {
  const [ingredientUnit] = await db
    .select()
    .from(schema.ingredientUnits)
    .where(eq(schema.ingredientUnits.id, ing.ingredientUnitId))
    .limit(1);
  
  const ingredientUnitName = ingredientUnit?.name || 'unknown';
  
  if (ing.recipeUnit !== ingredientUnitName) {
    const key = `${ing.ingredientName}|${ing.recipeUnit}|${ingredientUnitName}`;
    if (!mismatches.has(key)) {
      mismatches.set(key, {
        ingredient: ing.ingredientName,
        recipeUnit: ing.recipeUnit,
        ingredientUnit: ingredientUnitName,
        ingredientId: ing.ingredientId,
      });
    }
  }
}

console.log(`Total unique unit mismatches: ${mismatches.size}\n`);

for (const [key, mismatch] of mismatches) {
  // Check if conversion exists
  const [conversion] = await db
    .select()
    .from(schema.ingredientConversions)
    .where(eq(schema.ingredientConversions.ingredientId, mismatch.ingredientId))
    .limit(1);
  
  const status = conversion ? '✅' : '❌';
  console.log(`${status} ${mismatch.ingredient}: ${mismatch.recipeUnit} → ${mismatch.ingredientUnit}`);
}

await connection.end();
