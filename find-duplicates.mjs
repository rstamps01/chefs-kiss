import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

const [recipes] = await connection.execute('SELECT id, name, createdAt FROM recipes ORDER BY name, createdAt');

// Group by name to find duplicates
const grouped = {};
recipes.forEach(r => {
  if (!grouped[r.name]) grouped[r.name] = [];
  grouped[r.name].push(r);
});

console.log('Total recipes:', recipes.length);
console.log('\nDuplicate recipes:');

const duplicates = [];
Object.entries(grouped).forEach(([name, items]) => {
  if (items.length > 1) {
    console.log(`\n${name} (${items.length} copies):`);
    items.forEach((item, idx) => {
      console.log(`  [${idx === 0 ? 'KEEP' : 'DELETE'}] ID: ${item.id}, Created: ${item.createdAt}`);
      if (idx > 0) duplicates.push(item.id);
    });
  }
});

console.log(`\n\nTotal duplicates to delete: ${duplicates.length}`);
console.log('IDs to delete:', duplicates.join(', '));

await connection.end();
