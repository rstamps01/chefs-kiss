import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.js';
import { eq, like } from 'drizzle-orm';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

console.log('\n=== SCALLOPS INGREDIENT ===');
const scallops = await db.select().from(schema.ingredients).where(like(schema.ingredients.name, '%Scallops%'));
console.log('Scallops ingredient:', JSON.stringify(scallops, null, 2));

console.log('\n=== SCALLOPS CONVERSIONS ===');
const conversions = await db.select().from(schema.ingredientConversions).where(eq(schema.ingredientConversions.ingredientId, scallops[0].id));
console.log('Scallops conversions:', JSON.stringify(conversions, null, 2));

console.log('\n=== UNIVERSAL CONVERSIONS (oz <-> lb) ===');
const universalConversions = await db.select().from(schema.unitConversions).where(
  like(schema.unitConversions.fromUnit, '%oz%')
);
console.log('Universal conversions:', JSON.stringify(universalConversions, null, 2));

await connection.end();
