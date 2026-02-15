import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.ts';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

console.log('Finding all missing unit conversions across all recipes...\n');

// Get all recipes
const allRecipes = await db.select().from(schema.recipes);

const missingConversions = new Set();

for (const recipe of allRecipes) {
  // Get ingredients for this recipe
  const recipeIngs = await db
    .select({
      ingredientId: schema.recipeIngredients.ingredientId,
      ingredientName: schema.ingredients.name,
      recipeUnit: schema.recipeIngredients.unit,
      ingredientUnitId: schema.ingredients.unit,
    })
    .from(schema.recipeIngredients)
    .leftJoin(schema.ingredients, eq(schema.recipeIngredients.ingredientId, schema.ingredients.id))
    .where(eq(schema.recipeIngredients.recipeId, recipe.id));
  
  for (const ing of recipeIngs) {
    if (!ing.ingredientId || !ing.ingredientUnitId) continue;
    
    // Get ingredient unit name
    const [unit] = await db.select()
      .from(schema.ingredientUnits)
      .where(eq(schema.ingredientUnits.id, ing.ingredientUnitId))
      .limit(1);
    
    const ingredientUnit = unit?.name;
    
    if (!ingredientUnit || ing.recipeUnit === ingredientUnit) continue;
    
    // Check if conversion exists
    const conversions = await db.select()
      .from(schema.ingredientConversions)
      .where(eq(schema.ingredientConversions.ingredientId, ing.ingredientId));
    
    const hasConversion = conversions.some(c => 
      (c.fromUnit === ing.recipeUnit && c.toUnit === ingredientUnit) ||
      (c.fromUnit === ingredientUnit && c.toUnit === ing.recipeUnit)
    );
    
    if (!hasConversion) {
      const key = `${ing.ingredientName}|${ing.recipeUnit}→${ingredientUnit}`;
      missingConversions.add(key);
    }
  }
}

console.log(`Found ${missingConversions.size} unique missing conversions:\n`);

const sorted = Array.from(missingConversions).sort();
sorted.forEach(key => {
  const [ingredient, conversion] = key.split('|');
  console.log(`  ${ingredient}: ${conversion}`);
});

await connection.end();
