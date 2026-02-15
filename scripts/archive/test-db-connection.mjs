import mysql from 'mysql2/promise';

console.log('Testing database connectivity...\n');

try {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  console.log('✅ Database connection successful!');
  
  const [result] = await conn.execute('SELECT 1 as test');
  console.log('✅ Query executed successfully:', result[0]);
  
  const [recipeCount] = await conn.execute('SELECT COUNT(*) as count FROM recipes');
  console.log('✅ Recipe count:', recipeCount[0].count);
  
  const [ingredientCount] = await conn.execute('SELECT COUNT(*) as count FROM ingredients');
  console.log('✅ Ingredient count:', ingredientCount[0].count);
  
  const [conversionCount] = await conn.execute('SELECT COUNT(*) as count FROM ingredientConversions');
  console.log('✅ Unit conversion count:', conversionCount[0].count);
  
  await conn.end();
  console.log('\n✅ Database is UP and operational!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Database connection failed!');
  console.error('Error:', error.message);
  console.error('Code:', error.code);
  process.exit(1);
}
