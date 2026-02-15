import { drizzle } from 'drizzle-orm/mysql2';
import { eq, and } from 'drizzle-orm';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.ts';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

console.log('Debugging RSM Full conversion lookups...\n');

// Get RSM Full recipe
const [rsmFull] = await db.select()
  .from(schema.recipes)
  .where(eq(schema.recipes.name, 'RSM Full'))
  .limit(1);

if (!rsmFull) {
  console.log('❌ RSM Full recipe not found');
  await connection.end();
  process.exit(1);
}

// Get all ingredients
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
  .where(eq(schema.recipeIngredients.recipeId, rsmFull.id));

// Get ingredient unit names
const ingredientsWithUnits = await Promise.all(
  recipeIngs.map(async (ing) => {
    const [unit] = await db.select()
      .from(schema.ingredientUnits)
      .where(eq(schema.ingredientUnits.id, ing.ingredientUnitId))
      .limit(1);
    
    return {
      ...ing,
      ingredientUnit: unit?.name || 'UNKNOWN',
    };
  })
);

console.log(`Found ${ingredientsWithUnits.length} ingredients in RSM Full\n`);

// Test conversion lookup for each ingredient
for (const ing of ingredientsWithUnits) {
  const needsConversion = ing.recipeUnit !== ing.ingredientUnit;
  
  console.log(`${ing.ingredientName}:`);
  console.log(`  Recipe uses: ${ing.quantity} ${ing.recipeUnit}`);
  console.log(`  Stored in: ${ing.ingredientUnit}`);
  console.log(`  Needs conversion: ${needsConversion ? 'YES' : 'NO'}`);
  
  if (needsConversion) {
    // Check for direct conversion
    const [direct] = await db.select()
      .from(schema.ingredientConversions)
      .where(
        and(
          eq(schema.ingredientConversions.ingredientId, ing.ingredientId),
          eq(schema.ingredientConversions.fromUnit, ing.recipeUnit),
          eq(schema.ingredientConversions.toUnit, ing.ingredientUnit)
        )
      )
      .limit(1);
    
    // Check for reverse conversion
    const [reverse] = await db.select()
      .from(schema.ingredientConversions)
      .where(
        and(
          eq(schema.ingredientConversions.ingredientId, ing.ingredientId),
          eq(schema.ingredientConversions.fromUnit, ing.ingredientUnit),
          eq(schema.ingredientConversions.toUnit, ing.recipeUnit)
        )
      )
      .limit(1);
    
    if (direct) {
      console.log(`  ✅ Direct conversion found: ${ing.recipeUnit} → ${ing.ingredientUnit}, factor: ${direct.conversionFactor}`);
    } else if (reverse) {
      console.log(`  ✅ Reverse conversion found: ${ing.ingredientUnit} → ${ing.recipeUnit}, factor: ${reverse.conversionFactor} (will use reciprocal)`);
    } else {
      console.log(`  ❌ NO CONVERSION FOUND`);
    }
  }
  
  console.log();
}

await connection.end();
