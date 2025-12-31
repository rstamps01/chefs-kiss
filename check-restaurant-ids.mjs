import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

console.log('\n=== Checking Restaurant IDs ===\n');

// Get the correct restaurant ID
const [restaurants] = await connection.query('SELECT id, name FROM restaurants');
console.log('Restaurants:', restaurants);

const correctRestaurantId = restaurants[0]?.id;
console.log(`\nCorrect Restaurant ID: ${correctRestaurantId}`);

// Check Test Shrimp Recipe
const [recipes] = await connection.query(
  "SELECT id, name, restaurantId FROM recipes WHERE name = 'Test Shrimp Recipe'"
);
console.log('\nTest Shrimp Recipe:', recipes);

// Check Test Shrimp Ingredient
const [ingredients] = await connection.query(
  "SELECT id, name, restaurantId FROM ingredients WHERE name = 'Test Shrimp'"
);
console.log('\nTest Shrimp Ingredient:', ingredients);

// Check if IDs match
if (recipes[0] && recipes[0].restaurantId !== correctRestaurantId) {
  console.log(`\n❌ MISMATCH: Recipe has restaurantId ${recipes[0].restaurantId}, should be ${correctRestaurantId}`);
  console.log('Fixing...');
  await connection.query(
    `UPDATE recipes SET restaurantId = ? WHERE name = 'Test Shrimp Recipe'`,
    [correctRestaurantId]
  );
  console.log('✅ Fixed recipe restaurantId');
}

if (ingredients[0] && ingredients[0].restaurantId !== correctRestaurantId) {
  console.log(`\n❌ MISMATCH: Ingredient has restaurantId ${ingredients[0].restaurantId}, should be ${correctRestaurantId}`);
  console.log('Fixing...');
  await connection.query(
    `UPDATE ingredients SET restaurantId = ? WHERE name = 'Test Shrimp'`,
    [correctRestaurantId]
  );
  console.log('✅ Fixed ingredient restaurantId');
}

console.log('\n=== All IDs Match! ===\n');

await connection.end();
