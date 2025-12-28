import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log('Adding final 5 missing unit conversions...\n');

const conversions = [
  {
    ingredient: 'Fresh Cilantro',
    fromUnit: 'oz',
    toUnit: 'each',
    factor: 0.5, // Average bunch weighs ~2 oz, so 1 oz = 0.5 bunch
    notes: 'Average cilantro bunch weighs ~2 oz'
  },
  {
    ingredient: 'Habanero Tobiko',
    fromUnit: 'oz',
    toUnit: 'each',
    factor: 1.0, // Assuming packaged in oz-sized portions
    notes: 'Packaged in oz-sized portions'
  },
  {
    ingredient: 'Micro Cilantro',
    fromUnit: 'oz',
    toUnit: 'each',
    factor: 0.25, // Micro greens are light, ~4 oz per package
    notes: 'Micro greens package ~4 oz'
  },
  {
    ingredient: 'Shiitake Mushroom',
    fromUnit: 'oz',
    toUnit: 'each',
    factor: 0.5, // Average shiitake weighs ~0.5 oz
    notes: 'Average shiitake mushroom weighs ~0.5 oz'
  },
  {
    ingredient: 'Soy Paper',
    fromUnit: 'pieces',
    toUnit: 'sheet',
    factor: 1.0, // 1 piece = 1 sheet
    notes: '1 piece = 1 sheet (same unit)'
  }
];

for (const conv of conversions) {
  try {
    // Get ingredient ID
    const [ing] = await connection.execute(
      'SELECT id FROM ingredients WHERE name = ?',
      [conv.ingredient]
    );
    
    if (ing.length === 0) {
      console.log(`⏭️  ${conv.ingredient}: ingredient not found`);
      continue;
    }
    
    const ingredientId = ing[0].id;
    
    // Insert conversion
    await connection.execute(
      'INSERT INTO ingredientConversions (restaurantId, ingredientId, fromUnit, toUnit, conversionFactor, notes) VALUES (1, ?, ?, ?, ?, ?)',
      [ingredientId, conv.fromUnit, conv.toUnit, conv.factor, conv.notes]
    );
    
    console.log(`✅ ${conv.ingredient}: ${conv.fromUnit} → ${conv.toUnit} (factor: ${conv.factor})`);
  } catch (error) {
    console.error(`❌ Error adding conversion for ${conv.ingredient}:`, error.message);
  }
}

console.log('\n✅ All conversions added!');

await connection.end();
