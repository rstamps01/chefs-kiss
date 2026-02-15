import { drizzle } from 'drizzle-orm/mysql2';
import { eq, and } from 'drizzle-orm';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.ts';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

const RESTAURANT_ID = 1;

console.log('Creating standard unit conversions...\n');

// Standard conversions (ingredient-agnostic)
// These should be in ingredientUnits.conversionFactor, but we'll add them per-ingredient for now

const standardConversions = [
  // Weight conversions
  { from: 'oz', to: 'lb', factor: 1/16, description: '1 oz = 0.0625 lb' },
  { from: 'g', to: 'kg', factor: 1/1000, description: '1 g = 0.001 kg' },
  { from: 'g', to: 'lb', factor: 0.00220462, description: '1 g ≈ 0.0022 lb' },
  { from: 'oz', to: 'kg', factor: 0.0283495, description: '1 oz ≈ 0.028 kg' },
  
  // Volume conversions  
  { from: 'tsp', to: 'tbsp', factor: 1/3, description: '1 tsp = 0.333 tbsp' },
  { from: 'tbsp', to: 'cup', factor: 1/16, description: '1 tbsp = 0.0625 cup' },
  { from: 'cup', to: 'gallon', factor: 1/16, description: '1 cup = 0.0625 gallon' },
  { from: 'oz', to: 'cup', factor: 1/8, description: '1 fl oz = 0.125 cup' },
  { from: 'oz', to: 'gallon', factor: 1/128, description: '1 fl oz = 0.0078 gallon' },
  { from: 'ml', to: 'l', factor: 1/1000, description: '1 ml = 0.001 l' },
  
  // Common cooking conversions (approximate, for dry ingredients)
  { from: 'cup', to: 'lb', factor: 0.5, description: '1 cup ≈ 0.5 lb (varies by ingredient)' },
  { from: 'tbsp', to: 'oz', factor: 0.5, description: '1 tbsp ≈ 0.5 oz (varies by ingredient)' },
  { from: 'tsp', to: 'oz', factor: 0.167, description: '1 tsp ≈ 0.167 oz (varies by ingredient)' },
];

// Get all ingredients that might need these conversions
const allIngredients = await db.select().from(schema.ingredients)
  .where(eq(schema.ingredients.restaurantId, RESTAURANT_ID));

console.log(`Found ${allIngredients.length} ingredients\n`);

let added = 0;
let skipped = 0;

for (const conversion of standardConversions) {
  console.log(`\n📐 Adding conversion: ${conversion.description}`);
  console.log('─'.repeat(70));
  
  for (const ingredient of allIngredients) {
    try {
      // Check if conversion already exists
      const [existing] = await db.select()
        .from(schema.ingredientConversions)
        .where(
          and(
            eq(schema.ingredientConversions.ingredientId, ingredient.id),
            eq(schema.ingredientConversions.fromUnit, conversion.from),
            eq(schema.ingredientConversions.toUnit, conversion.to)
          )
        )
        .limit(1);
      
      if (existing) {
        skipped++;
        continue;
      }
      
      // Insert conversion
      await db.insert(schema.ingredientConversions).values({
        restaurantId: RESTAURANT_ID,
        ingredientId: ingredient.id,
        fromUnit: conversion.from,
        toUnit: conversion.to,
        conversionFactor: conversion.factor,
        notes: conversion.description,
      });
      
      added++;
    } catch (error) {
      console.error(`  ❌ Error adding conversion for ${ingredient.name}:`, error.message);
    }
  }
  
  console.log(`  Added to ${added - (added - allIngredients.length)} ingredients`);
}

console.log(`\n✅ Standard unit conversions complete!`);
console.log(`   Added: ${added} conversions`);
console.log(`   Skipped: ${skipped} conversions (already exist)`);

await connection.end();
