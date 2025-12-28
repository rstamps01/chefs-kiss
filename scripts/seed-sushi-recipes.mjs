/**
 * Seed Sushi Confidential Recipes
 * 
 * Adds all sushi rolls with their specific ingredient requirements
 * to enable accurate prep planning calculations.
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { recipes, recipeIngredients, ingredients, restaurants, locations } from '../drizzle/schema.ts';
import { eq } from 'drizzle-orm';

// Database connection
const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

console.log('🍣 Seeding Sushi Confidential recipes...\n');

// Get the restaurant and location
const restaurantList = await db.select().from(restaurants).limit(1);
if (restaurantList.length === 0) {
  console.error('❌ No restaurant found. Please create a restaurant first.');
  process.exit(1);
}
const restaurant = restaurantList[0];

const locationList = await db.select().from(locations).where(eq(locations.restaurantId, restaurant.id)).limit(1);
if (locationList.length === 0) {
  console.error('❌ No location found. Please create a location first.');
  process.exit(1);
}
const location = locationList[0];

console.log(`✓ Found restaurant: ${restaurant.name}`);
console.log(`✓ Found location: ${location.name}\n`);

// Step 1: Add ingredients
console.log('Step 1: Adding ingredients...');

const ingredientData = [
  { name: 'Salmon (sashimi grade)', unit: 'pieces', costPerUnit: '2.50' },
  { name: 'Tuna (sashimi grade)', unit: 'pieces', costPerUnit: '3.00' },
  { name: 'Yellowtail (sashimi grade)', unit: 'pieces', costPerUnit: '2.75' },
  { name: 'Albacore (sashimi grade)', unit: 'pieces', costPerUnit: '2.25' },
  { name: 'Shrimp (cooked)', unit: 'pieces', costPerUnit: '1.50' },
  { name: 'California Roll (base)', unit: 'rolls', costPerUnit: '4.00' },
  { name: 'Philadelphia Roll (base)', unit: 'rolls', costPerUnit: '4.50' },
];

const ingredientMap = new Map();

for (const ing of ingredientData) {
  const [result] = await db.insert(ingredients).values({
    restaurantId: restaurant.id,
    name: ing.name,
    unit: ing.unit,
    costPerUnit: ing.costPerUnit,
  });
  
  const ingredientId = Number(result.insertId);
  ingredientMap.set(ing.name, ingredientId);
  console.log(`  ✓ Added: ${ing.name}`);
}

console.log(`\n✓ Added ${ingredientData.length} ingredients\n`);

// Step 2: Add recipes
console.log('Step 2: Adding recipes...');

const recipeData = [
  {
    name: 'Blonde Bombshell',
    description: 'Yellowtail sushi roll',
    servings: 1,
    prepTime: 10,
    sellingPrice: '14.00',
    ingredients: [
      { name: 'Yellowtail (sashimi grade)', quantity: '2' },
    ],
  },
  {
    name: 'Classified Half',
    description: 'Half deep-fried California roll',
    servings: 1,
    prepTime: 15,
    sellingPrice: '8.00',
    ingredients: [
      { name: 'California Roll (base)', quantity: '0.5' },
    ],
  },
  {
    name: 'Classified Full',
    description: 'Full deep-fried California roll',
    servings: 1,
    prepTime: 15,
    sellingPrice: '14.00',
    ingredients: [
      { name: 'California Roll (base)', quantity: '1' },
    ],
  },
  {
    name: 'Classified Rainbow',
    description: 'Rainbow roll with assorted fish',
    servings: 1,
    prepTime: 15,
    sellingPrice: '18.00',
    ingredients: [
      { name: 'Salmon (sashimi grade)', quantity: '1' },
      { name: 'Tuna (sashimi grade)', quantity: '1' },
      { name: 'Yellowtail (sashimi grade)', quantity: '1' },
      { name: 'Albacore (sashimi grade)', quantity: '1' },
      { name: 'Shrimp (cooked)', quantity: '1' },
    ],
  },
  {
    name: 'Geisha Girl',
    description: 'Salmon sushi roll',
    servings: 1,
    prepTime: 10,
    sellingPrice: '14.00',
    ingredients: [
      { name: 'Salmon (sashimi grade)', quantity: '2' },
    ],
  },
  {
    name: 'Gluten-Free Geisha Girl',
    description: 'Gluten-free salmon sushi roll',
    servings: 1,
    prepTime: 10,
    sellingPrice: '15.00',
    ingredients: [
      { name: 'Salmon (sashimi grade)', quantity: '2' },
    ],
  },
  {
    name: 'Gluten-Free Rainbow Roll',
    description: 'Gluten-free rainbow roll',
    servings: 1,
    prepTime: 15,
    sellingPrice: '19.00',
    ingredients: [
      { name: 'Salmon (sashimi grade)', quantity: '1' },
      { name: 'Tuna (sashimi grade)', quantity: '1' },
      { name: 'Albacore (sashimi grade)', quantity: '1' },
      { name: 'Yellowtail (sashimi grade)', quantity: '1' },
      { name: 'Shrimp (cooked)', quantity: '1' },
    ],
  },
  {
    name: 'Trenchcoat (Gluten-Free)',
    description: 'Gluten-free yellowtail roll',
    servings: 1,
    prepTime: 10,
    sellingPrice: '15.00',
    ingredients: [
      { name: 'Yellowtail (sashimi grade)', quantity: '2' },
    ],
  },
  {
    name: 'Golden Philly',
    description: 'Deep-fried Philadelphia roll',
    servings: 1,
    prepTime: 15,
    sellingPrice: '15.00',
    ingredients: [
      { name: 'Philadelphia Roll (base)', quantity: '1' },
    ],
  },
  {
    name: 'Lime and Dine',
    description: 'Tuna and salmon roll',
    servings: 1,
    prepTime: 10,
    sellingPrice: '16.00',
    ingredients: [
      { name: 'Tuna (sashimi grade)', quantity: '1' },
      { name: 'Salmon (sashimi grade)', quantity: '1' },
    ],
  },
  {
    name: 'Lion King Roll',
    description: 'Salmon specialty roll',
    servings: 1,
    prepTime: 12,
    sellingPrice: '16.00',
    ingredients: [
      { name: 'Salmon (sashimi grade)', quantity: '2' },
    ],
  },
  {
    name: 'Pizza Maki Roll',
    description: 'California roll with toppings',
    servings: 1,
    prepTime: 12,
    sellingPrice: '14.00',
    ingredients: [
      { name: 'California Roll (base)', quantity: '1' },
    ],
  },
  {
    name: 'RSM Half',
    description: 'Half deep-fried California roll',
    servings: 1,
    prepTime: 15,
    sellingPrice: '8.00',
    ingredients: [
      { name: 'California Roll (base)', quantity: '0.5' },
    ],
  },
  {
    name: 'RSM Full',
    description: 'Full California roll',
    servings: 1,
    prepTime: 10,
    sellingPrice: '12.00',
    ingredients: [
      { name: 'California Roll (base)', quantity: '1' },
    ],
  },
  {
    name: 'Rainbow Roll',
    description: 'Classic rainbow roll',
    servings: 1,
    prepTime: 15,
    sellingPrice: '18.00',
    ingredients: [
      { name: 'Salmon (sashimi grade)', quantity: '1' },
      { name: 'Tuna (sashimi grade)', quantity: '1' },
      { name: 'Albacore (sashimi grade)', quantity: '1' },
      { name: 'Yellowtail (sashimi grade)', quantity: '1' },
      { name: 'Shrimp (cooked)', quantity: '1' },
    ],
  },
  {
    name: 'Salmon Nigiri',
    description: 'Classic salmon nigiri',
    servings: 1,
    prepTime: 5,
    sellingPrice: '8.00',
    ingredients: [
      { name: 'Salmon (sashimi grade)', quantity: '2' },
    ],
  },
  {
    name: 'Salmon Sushi Rollito',
    description: 'Salmon roll with extra fish',
    servings: 1,
    prepTime: 12,
    sellingPrice: '16.00',
    ingredients: [
      { name: 'Salmon (sashimi grade)', quantity: '4' },
    ],
  },
  {
    name: 'Savage Sarah',
    description: 'Mixed fish specialty roll',
    servings: 1,
    prepTime: 12,
    sellingPrice: '17.00',
    ingredients: [
      { name: 'Salmon (sashimi grade)', quantity: '1' },
      { name: 'Tuna (sashimi grade)', quantity: '1' },
      { name: 'Yellowtail (sashimi grade)', quantity: '1' },
    ],
  },
  {
    name: 'Shady Shrimp',
    description: 'Salmon and shrimp roll',
    servings: 1,
    prepTime: 10,
    sellingPrice: '15.00',
    ingredients: [
      { name: 'Salmon (sashimi grade)', quantity: '2' },
    ],
  },
  {
    name: 'Shishito-Kamikaze',
    description: 'Spicy tuna roll',
    servings: 1,
    prepTime: 10,
    sellingPrice: '15.00',
    ingredients: [
      { name: 'Tuna (sashimi grade)', quantity: '2' },
    ],
  },
  {
    name: 'Tropic Like It\'s Hot',
    description: 'Tropical tuna roll',
    servings: 1,
    prepTime: 12,
    sellingPrice: '16.00',
    ingredients: [
      { name: 'Tuna (sashimi grade)', quantity: '2' },
    ],
  },
  {
    name: 'Tuna Nigiri',
    description: 'Classic tuna nigiri',
    servings: 1,
    prepTime: 5,
    sellingPrice: '9.00',
    ingredients: [
      { name: 'Tuna (sashimi grade)', quantity: '2' },
    ],
  },
  {
    name: 'Tuna Yellowtail Nigiri',
    description: 'Yellowtail nigiri',
    servings: 1,
    prepTime: 5,
    sellingPrice: '9.00',
    ingredients: [
      { name: 'Yellowtail (sashimi grade)', quantity: '2' },
    ],
  },
];

let recipeCount = 0;
let ingredientLinkCount = 0;

for (const recipe of recipeData) {
  // Insert recipe
  const [recipeResult] = await db.insert(recipes).values({
    restaurantId: restaurant.id,
    name: recipe.name,
    description: recipe.description,
    servings: recipe.servings,
    prepTime: recipe.prepTime,
    sellingPrice: recipe.sellingPrice,
  });
  
  const recipeId = Number(recipeResult.insertId);
  recipeCount++;
  
  // Insert recipe ingredients
  for (const ing of recipe.ingredients) {
    const ingredientId = ingredientMap.get(ing.name);
    if (!ingredientId) {
      console.error(`  ❌ Ingredient not found: ${ing.name}`);
      continue;
    }
    
    await db.insert(recipeIngredients).values({
      recipeId: recipeId,
      ingredientId: ingredientId,
      quantity: ing.quantity,
      unit: ingredientData.find(i => i.name === ing.name).unit,
    });
    
    ingredientLinkCount++;
  }
  
  console.log(`  ✓ Added: ${recipe.name} (${recipe.ingredients.length} ingredients)`);
}

console.log(`\n✓ Added ${recipeCount} recipes with ${ingredientLinkCount} ingredient links\n`);

// Summary
console.log('═══════════════════════════════════════');
console.log('🎉 Seeding complete!');
console.log('═══════════════════════════════════════');
console.log(`Ingredients: ${ingredientData.length}`);
console.log(`Recipes: ${recipeCount}`);
console.log(`Ingredient Links: ${ingredientLinkCount}`);
console.log('═══════════════════════════════════════\n');

await connection.end();
