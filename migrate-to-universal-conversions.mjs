import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log('Migrating to universal unit conversion system...\n');

const RESTAURANT_ID = 1;

// Step 1: Extract unique standard conversions (those that appear for all/most ingredients)
console.log('Step 1: Identifying standard conversions...');
const [conversionTypes] = await connection.execute(`
  SELECT fromUnit, toUnit, conversionFactor, COUNT(*) as ingredientCount
  FROM ingredientConversions
  WHERE restaurantId = ?
  GROUP BY fromUnit, toUnit, conversionFactor
  HAVING ingredientCount >= 10
  ORDER BY ingredientCount DESC
`, [RESTAURANT_ID]);

console.log(`Found ${conversionTypes.length} standard conversion types:\n`);
conversionTypes.forEach(ct => {
  console.log(`  ${ct.fromUnit} → ${ct.toUnit} (factor: ${ct.conversionFactor}) - ${ct.ingredientCount} ingredients`);
});

// Step 2: Insert standard conversions into unitConversions table
console.log('\nStep 2: Creating universal conversions...');
let inserted = 0;
for (const conv of conversionTypes) {
  try {
    await connection.execute(`
      INSERT INTO unitConversions (restaurantId, fromUnit, toUnit, conversionFactor, notes)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE conversionFactor = VALUES(conversionFactor)
    `, [
      RESTAURANT_ID,
      conv.fromUnit,
      conv.toUnit,
      conv.conversionFactor,
      `Standard conversion (migrated from ${conv.ingredientCount} ingredients)`
    ]);
    inserted++;
  } catch (error) {
    console.error(`  ❌ Error inserting ${conv.fromUnit} → ${conv.toUnit}:`, error.message);
  }
}
console.log(`✅ Inserted ${inserted} universal conversions`);

// Step 3: Delete standard conversions from ingredientConversions (keep only ingredient-specific ones)
console.log('\nStep 3: Cleaning up ingredient-specific conversions table...');
const standardConversionPairs = conversionTypes.map(ct => `('${ct.fromUnit}', '${ct.toUnit}')`).join(', ');

const [deleteResult] = await connection.execute(`
  DELETE FROM ingredientConversions
  WHERE restaurantId = ?
    AND (fromUnit, toUnit) IN (${standardConversionPairs})
`, [RESTAURANT_ID]);

console.log(`✅ Deleted ${deleteResult.affectedRows} standard conversions from ingredientConversions`);

// Step 4: Show remaining ingredient-specific conversions
const [remaining] = await connection.execute(`
  SELECT i.name, ic.fromUnit, ic.toUnit, ic.conversionFactor
  FROM ingredientConversions ic
  JOIN ingredients i ON ic.ingredientId = i.id
  WHERE ic.restaurantId = ?
  ORDER BY i.name
`, [RESTAURANT_ID]);

console.log(`\n✅ Remaining ingredient-specific conversions: ${remaining.length}`);
if (remaining.length > 0) {
  console.log('\nIngredient-specific conversions (kept):');
  remaining.forEach(r => {
    console.log(`  ${r.name}: ${r.fromUnit} → ${r.toUnit} (factor: ${r.conversionFactor})`);
  });
}

// Step 5: Summary
console.log('\n' + '='.repeat(60));
console.log('MIGRATION COMPLETE');
console.log('='.repeat(60));
console.log(`Universal conversions: ${inserted}`);
console.log(`Ingredient-specific conversions: ${remaining.length}`);
console.log(`Total conversions deleted: ${deleteResult.affectedRows}`);
console.log(`Database size reduction: ${deleteResult.affectedRows} rows`);

await connection.end();
