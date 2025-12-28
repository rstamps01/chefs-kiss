import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.ts';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

// Restaurant ID (assuming first restaurant)
const RESTAURANT_ID = 1;

// Get or create ingredient categories
const categories = {
  fish: await getOrCreateCategory('Fish & Seafood'),
  produce: await getOrCreateCategory('Produce'),
  roe: await getOrCreateCategory('Roe & Eggs'),
  sauce: await getOrCreateCategory('Sauces & Condiments'),
  oil: await getOrCreateCategory('Oils & Dressings'),
  topping: await getOrCreateCategory('Toppings & Garnishes'),
  dairy: await getOrCreateCategory('Dairy & Other'),
  specialty: await getOrCreateCategory('Specialty Items'),
};

async function getOrCreateCategory(name) {
  const [existing] = await db.select().from(schema.recipeCategories)
    .where(eq(schema.recipeCategories.name, name))
    .limit(1);
  
  if (existing) return existing.id;
  
  const [result] = await db.insert(schema.recipeCategories).values({
    restaurantId: RESTAURANT_ID,
    name,
    isActive: true,
    displayOrder: 0,
  });
  return Number(result.insertId);
}

// Get unit IDs
const units = {};
const allUnits = await db.select().from(schema.ingredientUnits);
for (const unit of allUnits) {
  units[unit.name] = unit.id;
}

// Missing ingredients to add
const missingIngredients = [
  // Fish & Seafood
  { name: 'Salmon Belly', category: categories.fish, unit: units.pieces || units.oz, costPerUnit: 2.10, supplier: 'Seafood Distributor' },
  { name: 'Scallops (Hokkaido Hotate)', category: categories.fish, unit: units.pieces || units.oz, costPerUnit: 1.20, supplier: 'Seafood Distributor' },
  { name: 'Eel (Unagi)', category: categories.fish, unit: units.pieces || units.oz, costPerUnit: 2.40, supplier: 'Seafood Distributor' },
  { name: 'Cooked Shrimp (Ebi)', category: categories.fish, unit: units.pieces || units.oz, costPerUnit: 0.90, supplier: 'Seafood Distributor' },
  { name: 'Shrimp Tempura', category: categories.fish, unit: units.pieces || units.each, costPerUnit: 1.50, supplier: 'Seafood Distributor' },
  { name: 'Soft-Shell Crab', category: categories.fish, unit: units.pieces || units.each, costPerUnit: 3.00, supplier: 'Seafood Distributor' },
  { name: 'Crab Stick (Kani Kama)', category: categories.fish, unit: units.pieces || units.oz, costPerUnit: 0.30, supplier: 'Seafood Distributor' },
  { name: 'Snow Crab', category: categories.fish, unit: units.pieces || units.oz, costPerUnit: 1.80, supplier: 'Seafood Distributor' },
  { name: 'Cooked Salmon', category: categories.fish, unit: units.pieces || units.oz, costPerUnit: 1.20, supplier: 'Seafood Distributor' },
  { name: 'Smoked Salmon', category: categories.fish, unit: units.pieces || units.oz, costPerUnit: 1.65, supplier: 'Seafood Distributor' },
  { name: 'New York Steak (Sliced)', category: categories.fish, unit: units.pieces || units.oz, costPerUnit: 0.90, supplier: 'Meat Distributor' },
  
  // Vegetables & Produce
  { name: 'Carrot', category: categories.produce, unit: units.each, costPerUnit: 0.30, supplier: 'Produce Supplier' },
  { name: 'Lemon', category: categories.produce, unit: units.each, costPerUnit: 0.50, supplier: 'Produce Supplier' },
  { name: 'Lime', category: categories.produce, unit: units.each, costPerUnit: 0.40, supplier: 'Produce Supplier' },
  { name: 'Jalapeño', category: categories.produce, unit: units.each, costPerUnit: 0.25, supplier: 'Produce Supplier' },
  { name: 'Green Onion (Scallion)', category: categories.produce, unit: units.oz || units.each, costPerUnit: 1.00, supplier: 'Produce Supplier' },
  { name: 'Shishito Pepper', category: categories.produce, unit: units.each, costPerUnit: 0.50, supplier: 'Produce Supplier' },
  { name: 'Micro Cilantro', category: categories.produce, unit: units.oz, costPerUnit: 2.00, supplier: 'Produce Supplier' },
  { name: 'Fresh Cilantro', category: categories.produce, unit: units.oz, costPerUnit: 0.50, supplier: 'Produce Supplier' },
  { name: 'Shiitake Mushroom', category: categories.produce, unit: units.oz, costPerUnit: 1.50, supplier: 'Produce Supplier' },
  
  // Roe & Eggs
  { name: 'Tobiko (Flying Fish Roe)', category: categories.roe, unit: units.oz, costPerUnit: 3.00, supplier: 'Seafood Distributor' },
  { name: 'Habanero Tobiko', category: categories.roe, unit: units.oz, costPerUnit: 3.50, supplier: 'Seafood Distributor' },
  { name: 'Ikura (Salmon Eggs)', category: categories.roe, unit: units.oz, costPerUnit: 4.00, supplier: 'Seafood Distributor' },
  { name: 'Quail Egg', category: categories.roe, unit: units.each, costPerUnit: 0.75, supplier: 'Produce Supplier' },
  { name: 'Sweet Egg (Tamago)', category: categories.roe, unit: units.pieces || units.oz, costPerUnit: 0.30, supplier: 'Produce Supplier' },
  
  // Sauces & Condiments
  { name: 'Unagi Sauce', category: categories.sauce, unit: units.oz, costPerUnit: 0.25, supplier: 'Restaurant Supply' },
  { name: 'Spicy Soy Sauce', category: categories.sauce, unit: units.oz, costPerUnit: 0.25, supplier: 'Restaurant Supply' },
  { name: 'Ponzu Sauce', category: categories.sauce, unit: units.oz, costPerUnit: 0.25, supplier: 'Restaurant Supply' },
  { name: 'Spicy Mayo', category: categories.sauce, unit: units.oz, costPerUnit: 0.25, supplier: 'Restaurant Supply' },
  { name: 'Sriracha Sauce', category: categories.sauce, unit: units.oz, costPerUnit: 0.25, supplier: 'Restaurant Supply' },
  { name: 'Sweet & Sour Sauce', category: categories.sauce, unit: units.oz, costPerUnit: 0.25, supplier: 'Restaurant Supply' },
  { name: 'Charred Scallion Sauce', category: categories.sauce, unit: units.oz, costPerUnit: 0.25, supplier: 'Restaurant Supply' },
  { name: 'Sweet Jalapeño Salsa', category: categories.sauce, unit: units.oz, costPerUnit: 0.25, supplier: 'Restaurant Supply' },
  { name: 'Sweet Musashi Sauce', category: categories.sauce, unit: units.oz, costPerUnit: 0.25, supplier: 'Restaurant Supply' },
  
  // Oils & Dressings
  { name: 'Truffle Olive Oil', category: categories.oil, unit: units.oz, costPerUnit: 0.50, supplier: 'Restaurant Supply' },
  { name: 'Persian Lime Olive Oil', category: categories.oil, unit: units.oz, costPerUnit: 0.50, supplier: 'Restaurant Supply' },
  { name: 'Meyer Lemon Olive Oil', category: categories.oil, unit: units.oz, costPerUnit: 0.50, supplier: 'Restaurant Supply' },
  { name: 'Jalapeño-Infused Olive Oil', category: categories.oil, unit: units.oz, costPerUnit: 0.50, supplier: 'Restaurant Supply' },
  
  // Toppings & Garnishes
  { name: 'Macadamia Nuts', category: categories.topping, unit: units.oz, costPerUnit: 1.00, supplier: 'Restaurant Supply' },
  { name: 'Tempura Crunch', category: categories.topping, unit: units.oz, costPerUnit: 0.15, supplier: 'Restaurant Supply' },
  { name: 'Sweet Potato Crisps', category: categories.topping, unit: units.oz, costPerUnit: 0.30, supplier: 'Restaurant Supply' },
  { name: 'Bonito Flakes', category: categories.topping, unit: units.oz, costPerUnit: 0.40, supplier: 'Restaurant Supply' },
  { name: "Flamin' HOT Cheetos", category: categories.topping, unit: units.oz, costPerUnit: 0.20, supplier: 'Restaurant Supply' },
  
  // Dairy & Other
  { name: 'Cream Cheese', category: categories.dairy, unit: units.oz, costPerUnit: 0.30, supplier: 'Dairy Supplier' },
  { name: 'Fried Tofu (Inari)', category: categories.dairy, unit: units.pieces || units.each, costPerUnit: 0.75, supplier: 'Restaurant Supply' },
  
  // Specialty Items
  { name: 'Soy Paper', category: categories.specialty, unit: units.pieces || units.each, costPerUnit: 0.50, supplier: 'Restaurant Supply' },
];

console.log(`Adding ${missingIngredients.length} missing ingredients...`);

let added = 0;
let skipped = 0;

for (const ingredient of missingIngredients) {
  try {
    // Check if ingredient already exists
    const [existing] = await db.select().from(schema.ingredients)
      .where(eq(schema.ingredients.name, ingredient.name))
      .limit(1);
    
    if (existing) {
      console.log(`⏭️  Skipped: ${ingredient.name} (already exists)`);
      skipped++;
      continue;
    }
    
    // Insert new ingredient
    await db.insert(schema.ingredients).values({
      restaurantId: RESTAURANT_ID,
      name: ingredient.name,
      category: ingredient.category,
      unit: ingredient.unit,
      costPerUnit: ingredient.costPerUnit,
      supplier: ingredient.supplier,
      shelfLife: null,
      minStock: null,
    });
    
    console.log(`✅ Added: ${ingredient.name} ($${ingredient.costPerUnit}/${ingredient.unit})`);
    added++;
  } catch (error) {
    console.error(`❌ Error adding ${ingredient.name}:`, error.message);
  }
}

console.log(`\n✅ Seed complete!`);
console.log(`   Added: ${added} ingredients`);
console.log(`   Skipped: ${skipped} ingredients (already exist)`);
console.log(`   Total: ${added + skipped}/${missingIngredients.length}`);

await connection.end();
