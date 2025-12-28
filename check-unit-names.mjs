import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log('=== Checking Unit Name Consistency ===\n');

// 1. Check ingredientUnits table
console.log('1. Ingredient Units (name vs displayName):');
console.log('─'.repeat(70));
const [units] = await connection.execute(`
  SELECT id, name, displayName 
  FROM ingredientUnits 
  ORDER BY name
`);

units.forEach(unit => {
  console.log(`ID ${unit.id}: name="${unit.name}" | displayName="${unit.displayName}"`);
});

// 2. Check ingredientConversions
console.log('\n2. Ingredient Conversions (fromUnit / toUnit values):');
console.log('─'.repeat(70));
const [conversions] = await connection.execute(`
  SELECT 
    ic.id,
    i.name as ingredient_name,
    ic.fromUnit,
    ic.toUnit,
    ic.conversionFactor
  FROM ingredientConversions ic
  JOIN ingredients i ON ic.ingredientId = i.id
  ORDER BY i.name
  LIMIT 20
`);

if (conversions.length === 0) {
  console.log('No conversions found in database');
} else {
  conversions.forEach(conv => {
    console.log(`${conv.ingredient_name}:`);
    console.log(`  ${conv.fromUnit} → ${conv.toUnit} (factor: ${conv.conversionFactor})`);
  });
}

// 3. Check recipe_ingredients units
console.log('\n3. Recipe Ingredients (what units recipes use):');
console.log('─'.repeat(70));
const [recipeIngs] = await connection.execute(`
  SELECT DISTINCT ri.unit as recipe_unit, COUNT(*) as count
  FROM recipe_ingredients ri
  GROUP BY ri.unit
  ORDER BY count DESC
`);

recipeIngs.forEach(ri => {
  console.log(`"${ri.recipe_unit}" - used ${ri.count} times in recipes`);
});

// 4. Check ingredients storage units
console.log('\n4. Ingredients Storage Units (what unit ID ingredients use):');
console.log('─'.repeat(70));
const [ingUnits] = await connection.execute(`
  SELECT 
    i.name as ingredient_name,
    i.unit as unit_id,
    iu.name as unit_name,
    iu.displayName as unit_display_name
  FROM ingredients i
  JOIN ingredientUnits iu ON i.unit = iu.id
  WHERE i.name LIKE '%sashimi%'
  ORDER BY i.name
  LIMIT 10
`);

ingUnits.forEach(ing => {
  console.log(`${ing.ingredient_name}:`);
  console.log(`  Stored in unit ID ${ing.unit_id}: name="${ing.unit_name}" displayName="${ing.unit_display_name}"`);
});

// 5. Check for mismatches
console.log('\n5. Potential Mismatches:');
console.log('─'.repeat(70));

const [mismatches] = await connection.execute(`
  SELECT 
    r.name as recipe_name,
    i.name as ingredient_name,
    ri.unit as recipe_uses,
    iu.name as ingredient_stored_as,
    iu.displayName as ingredient_display_name
  FROM recipe_ingredients ri
  JOIN recipes r ON ri.recipeId = r.id
  JOIN ingredients i ON ri.ingredientId = i.id
  JOIN ingredientUnits iu ON i.unit = iu.id
  WHERE ri.unit != iu.name
  LIMIT 10
`);

if (mismatches.length === 0) {
  console.log('✅ No unit mismatches found - all recipe units match ingredient storage units!');
} else {
  mismatches.forEach(m => {
    console.log(`❌ ${m.recipe_name} / ${m.ingredient_name}:`);
    console.log(`   Recipe uses: "${m.recipe_uses}"`);
    console.log(`   Ingredient stored as: "${m.ingredient_stored_as}" (display: "${m.ingredient_display_name}")`);
    console.log(`   Need conversion: "${m.recipe_uses}" → "${m.ingredient_stored_as}"`);
    console.log();
  });
}

await connection.end();
