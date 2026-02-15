import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { ingredients } from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

const allIngredients = await db
  .select({
    id: ingredients.id,
    name: ingredients.name,
    unit: ingredients.unit,
    costPerUnit: ingredients.costPerUnit,
  })
  .from(ingredients)
  .where(eq(ingredients.restaurantId, 1))
  .orderBy(ingredients.name);

console.log('\n=== INGREDIENT UNIT VALUES ===\n');
console.log('ID | Name | Unit | Cost');
console.log('---|------|------|-----');

for (const ing of allIngredients) {
  const unitType = typeof ing.unit;
  const unitDisplay = ing.unit === null ? 'NULL' : `"${ing.unit}" (${unitType})`;
  console.log(`${ing.id} | ${ing.name} | ${unitDisplay} | $${ing.costPerUnit}`);
}

await connection.end();
