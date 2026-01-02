import Database from 'better-sqlite3';

const db = new Database('.data/db.sqlite');

const rows = db.prepare(`
  SELECT 
    i.id,
    i.name,
    i.category,
    i.unit,
    u.displayName as unitName,
    i.costPerUnit,
    i.supplier
  FROM ingredients i
  LEFT JOIN ingredientUnits u ON i.unit = u.id
  WHERE i.category LIKE '%Fish%' 
     OR i.category LIKE '%Seafood%'
     OR i.name LIKE '%Salmon%'
     OR i.name LIKE '%Tuna%'
     OR i.name LIKE '%Yellowtail%'
     OR i.name LIKE '%Shrimp%'
     OR i.name LIKE '%Scallop%'
     OR i.name LIKE '%Crab%'
     OR i.name LIKE '%Albacore%'
  ORDER BY i.name
`).all();

console.log('Seafood Ingredients:');
console.log('='.repeat(120));
rows.forEach(row => {
  console.log(`ID: ${row.id} | ${row.name.padEnd(35)} | Unit: ${(row.unitName || 'NULL').padEnd(10)} | Cost: $${row.costPerUnit} | Category: ${row.category}`);
});
console.log('='.repeat(120));
console.log(`Total: ${rows.length} seafood ingredients`);

db.close();
