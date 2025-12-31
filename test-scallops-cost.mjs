import { createConnection } from 'mysql2/promise';

const connection = await createConnection(process.env.DATABASE_URL);

console.log('=== Checking Scallops Nigiri Recipe Data ===\n');

// Query 1: Get ingredient units
console.log('1. All Ingredient Units:');
const [units] = await connection.execute('SELECT id, name, displayName FROM ingredientUnits ORDER BY name');
console.table(units);

// Query 2: Get Scallops ingredient data
console.log('\n2. Scallops Ingredient Data:');
const [scallops] = await connection.execute(`
  SELECT 
    i.id,
    i.name,
    i.costPerUnit,
    i.unit as unit_id,
    u.name as unit_name,
    u.displayName as unit_display
  FROM ingredients i
  LEFT JOIN ingredientUnits u ON i.unit = u.id
  WHERE i.name LIKE '%Scallop%'
`);
console.table(scallops);

// Query 3: Get Scallops Nigiri recipe ingredients
console.log('\n3. Scallops Nigiri Recipe Ingredients:');
const [recipeData] = await connection.execute(`
  SELECT 
    r.name as recipe_name,
    ri.ingredientId,
    i.name as ingredient_name,
    ri.quantity,
    ri.unit as recipe_unit_string,
    i.unit as ingredient_unit_id,
    u.name as ingredient_unit_name,
    u.displayName as ingredient_unit_display,
    i.costPerUnit
  FROM recipes r
  JOIN recipe_ingredients ri ON r.id = ri.recipeId
  JOIN ingredients i ON ri.ingredientId = i.id
  LEFT JOIN ingredientUnits u ON i.unit = u.id
  WHERE r.name LIKE '%Scallops Nigiri%'
`);
console.table(recipeData);

// Analysis
console.log('\n=== ANALYSIS ===');
for (const row of recipeData) {
  console.log(`\nIngredient: ${row.ingredient_name}`);
  console.log(`  Recipe unit (varchar): "${row.recipe_unit_string}"`);
  console.log(`  Ingredient unit (name): "${row.ingredient_unit_name}"`);
  console.log(`  Match: ${row.recipe_unit_string === row.ingredient_unit_name}`);
  console.log(`  Quantity: ${row.quantity}`);
  console.log(`  Cost per unit: $${row.costPerUnit}`);
  
  if (row.recipe_unit_string === row.ingredient_unit_name) {
    const cost = parseFloat(row.quantity) * parseFloat(row.costPerUnit);
    console.log(`  ✅ No conversion needed: ${row.quantity} × $${row.costPerUnit} = $${cost.toFixed(2)}`);
  } else {
    console.log(`  ❌ Units don't match - conversion needed`);
  }
}

await connection.end();
