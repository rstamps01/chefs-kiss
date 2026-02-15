import mysql from 'mysql2/promise';

console.log('Fixing ingredient unit data types...\n');

const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  // Get all unit name → ID mappings
  const [units] = await connection.execute('SELECT id, name FROM ingredientUnits');
  const unitMap = {};
  units.forEach(u => {
    unitMap[u.name] = u.id;
  });
  
  console.log('Unit ID mappings:');
  Object.entries(unitMap).forEach(([name, id]) => {
    console.log(`  "${name}" → ID ${id}`);
  });
  console.log();
  
  // Get all ingredients with string unit values
  const [ingredients] = await connection.execute(
    'SELECT id, name, unit FROM ingredients WHERE unit NOT REGEXP "^[0-9]+$"'
  );
  
  console.log(`Found ${ingredients.length} ingredients with string unit values\n`);
  
  let fixed = 0;
  let notFound = 0;
  
  for (const ing of ingredients) {
    const unitName = ing.unit;
    const unitId = unitMap[unitName];
    
    if (unitId) {
      await connection.execute(
        'UPDATE ingredients SET unit = ? WHERE id = ?',
        [unitId, ing.id]
      );
      console.log(`✅ ${ing.name}: "${unitName}" → ID ${unitId}`);
      fixed++;
    } else {
      console.log(`❌ ${ing.name}: Unit "${unitName}" not found in ingredientUnits table`);
      notFound++;
    }
  }
  
  console.log(`\n✅ Fixed ${fixed} ingredients`);
  if (notFound > 0) {
    console.log(`❌ ${notFound} ingredients could not be fixed (unit not found)`);
  }
  
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
} finally {
  await connection.end();
}
