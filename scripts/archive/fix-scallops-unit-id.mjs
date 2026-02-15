import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { eq, like } from 'drizzle-orm';
import * as schema from './drizzle/schema.js';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

// Find unit ID for "lb"
const lbUnit = await db.select().from(schema.ingredientUnits).where(like(schema.ingredientUnits.name, '%lb%'));
console.log('Units matching "lb":', lbUnit);

// Find Scallops ingredient
const scallops = await db.select().from(schema.ingredients).where(like(schema.ingredients.name, '%Scallops%'));
console.log('\nScallops ingredient:', scallops);

if (lbUnit.length > 0 && scallops.length > 0) {
  const lbUnitId = lbUnit[0].id;
  const scallopsId = scallops[0].id;
  
  console.log(`\nUpdating Scallops (ID: ${scallopsId}) to use unit ID: ${lbUnitId} (${lbUnit[0].name})`);
  
  await db.update(schema.ingredients)
    .set({ unit: lbUnitId })
    .where(eq(schema.ingredients.id, scallopsId));
  
  console.log('✅ Scallops ingredient updated successfully!');
  
  // Verify the update
  const updated = await db.select().from(schema.ingredients).where(eq(schema.ingredients.id, scallopsId));
  console.log('\nVerified Scallops ingredient:', updated);
}

await connection.end();
