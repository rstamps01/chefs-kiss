import { createConnection } from 'mysql2/promise';

const connection = await createConnection(process.env.DATABASE_URL);

console.log('=== Debugging Scallops Nigiri Cost Calculation ===\n');

// Get the recipe with full details
const [recipes] = await connection.execute(`
  SELECT 
    r.id as recipe_id,
    r.name as recipe_name,
    ri.id as recipe_ingredient_id,
    ri.ingredientId,
    i.name as ingredient_name,
    ri.quantity as recipe_quantity,
    ri.unit as recipe_unit,
    i.unit as ingredient_unit_id,
    u.name as ingredient_unit_name,
    i.costPerUnit as cost_per_unit
  FROM recipes r
  JOIN recipe_ingredients ri ON r.id = ri.recipeId
  JOIN ingredients i ON ri.ingredientId = i.id
  LEFT JOIN ingredientUnits u ON i.unit = u.id
  WHERE r.name = 'Scallops Nigiri (2pc)'
`);

console.log('Recipe Ingredients Data:');
console.table(recipes);

console.log('\n=== Cost Calculation Analysis ===\n');

for (const row of recipes) {
  console.log(`\n--- ${row.ingredient_name} ---`);
  console.log(`Recipe quantity: ${row.recipe_quantity}`);
  console.log(`Recipe unit: "${row.recipe_unit}"`);
  console.log(`Ingredient unit ID: "${row.ingredient_unit_id}"`);
  console.log(`Ingredient unit name: "${row.ingredient_unit_name}"`);
  console.log(`Cost per unit: $${row.cost_per_unit}`);
  
  // Check if units match
  const unitsMatch = row.recipe_unit === row.ingredient_unit_name;
  console.log(`\nUnits match: ${unitsMatch}`);
  
  if (unitsMatch) {
    const directCost = parseFloat(row.recipe_quantity) * parseFloat(row.cost_per_unit);
    console.log(`✅ Direct calculation: ${row.recipe_quantity} × $${row.cost_per_unit} = $${directCost.toFixed(2)}`);
  } else {
    console.log(`❌ Units don't match - need conversion from "${row.recipe_unit}" to "${row.ingredient_unit_name}"`);
    
    // Check for conversion factor
    const [conversions] = await connection.execute(`
      SELECT * FROM unitConversions 
      WHERE fromUnit = ? AND toUnit = ?
    `, [row.recipe_unit, row.ingredient_unit_name]);
    
    if (conversions.length > 0) {
      console.log(`Found universal conversion:`);
      console.table(conversions);
      const factor = parseFloat(conversions[0].factor);
      const convertedQuantity = parseFloat(row.recipe_quantity) * factor;
      const cost = convertedQuantity * parseFloat(row.cost_per_unit);
      console.log(`Converted: ${row.recipe_quantity} ${row.recipe_unit} × ${factor} = ${convertedQuantity} ${row.ingredient_unit_name}`);
      console.log(`Cost: ${convertedQuantity} × $${row.cost_per_unit} = $${cost.toFixed(2)}`);
    } else {
      // Check ingredient-specific conversion
      const [ingredientConversions] = await connection.execute(`
        SELECT * FROM ingredientConversions 
        WHERE ingredientId = ? AND fromUnit = ? AND toUnit = ?
      `, [row.ingredientId, row.recipe_unit, row.ingredient_unit_name]);
      
      if (ingredientConversions.length > 0) {
        console.log(`Found ingredient-specific conversion:`);
        console.table(ingredientConversions);
        const factor = parseFloat(ingredientConversions[0].factor);
        const convertedQuantity = parseFloat(row.recipe_quantity) * factor;
        const cost = convertedQuantity * parseFloat(row.cost_per_unit);
        console.log(`Converted: ${row.recipe_quantity} ${row.recipe_unit} × ${factor} = ${convertedQuantity} ${row.ingredient_unit_name}`);
        console.log(`Cost: ${convertedQuantity} × $${row.cost_per_unit} = $${cost.toFixed(2)}`);
      } else {
        console.log(`⚠️  NO CONVERSION FOUND`);
        console.log(`This will cause the backend to use direct multiplication as fallback`);
      }
    }
  }
}

await connection.end();
