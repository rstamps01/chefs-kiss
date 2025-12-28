import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.ts';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

const RESTAURANT_ID = 1;

// Ingredient ID mapping (from database query)
const ING = {
  // Fish & Seafood
  tuna_sashimi: 30002,
  salmon_sashimi: 30001,
  yellowtail_sashimi: 30003,
  albacore_sashimi: 30004,
  salmon_belly: 150001,
  scallops: 150002,
  eel: 150003,
  cooked_shrimp: 150004,
  shrimp_tempura: 150005,
  soft_shell_crab: 150006,
  crab_stick: 150007,
  snow_crab: 150008,
  cooked_salmon: 150009,
  smoked_salmon: 150010,
  ny_steak: 150011,
  
  // Produce
  avocado: 5,
  cucumber: 6,
  carrot: 150012,
  lemon: 150013,
  lime: 150014,
  jalapeno: 150015,
  green_onion: 150016,
  shishito_pepper: 150017,
  micro_cilantro: 150018,
  fresh_cilantro: 150019,
  shiitake_mushroom: 150020,
  mango: 60001,
  
  // Roe & Eggs
  tobiko: 150021,
  habanero_tobiko: 150022,
  ikura: 150023,
  quail_egg: 150024,
  tamago: 150025,
  
  // Sauces
  unagi_sauce: 150026,
  spicy_soy: 150027,
  ponzu: 150028,
  spicy_mayo: 150029,
  sriracha: 150030,
  sweet_sour: 150031,
  charred_scallion: 150032,
  sweet_jalapeno_salsa: 150033,
  sweet_musashi: 150034,
  
  // Oils
  truffle_oil: 150035,
  persian_lime_oil: 150036,
  meyer_lemon_oil: 150037,
  jalapeno_oil: 150038,
  
  // Toppings
  macadamia_nuts: 150039,
  tempura_crunch: 150040,
  sweet_potato_crisps: 150041,
  bonito_flakes: 150042,
  hot_cheetos: 150043,
  
  // Dairy & Other
  cream_cheese: 150044,
  fried_tofu: 150045,
  
  // Specialty
  soy_paper: 150046,
  
  // Basics
  sushi_rice: 1,
  nori: 2,
  sesame_seeds: 10,
};

// Helper function to create recipe with ingredients
async function createRecipe(name, description, category, servings, price, ingredients) {
  try {
    // Check if recipe already exists
    const [existing] = await db.select().from(schema.recipes)
      .where(eq(schema.recipes.name, name))
      .limit(1);
    
    if (existing) {
      console.log(`⏭️  Skipped: ${name} (already exists)`);
      return existing.id;
    }
    
    // Insert recipe
    const [result] = await db.insert(schema.recipes).values({
      restaurantId: RESTAURANT_ID,
      name,
      description,
      category,
      servings,
      sellingPrice: price,
    });
    
    const recipeId = Number(result.insertId);
    
    // Insert recipe ingredients
    for (const ing of ingredients) {
      await db.insert(schema.recipeIngredients).values({
        recipeId,
        ingredientId: ing.id,
        quantity: ing.qty,
        unit: ing.unit,
      });
    }
    
    console.log(`✅ Added: ${name} ($${price}, ${ingredients.length} ingredients)`);
    return recipeId;
  } catch (error) {
    console.error(`❌ Error adding ${name}:`, error.message);
    return null;
  }
}

console.log('Starting recipe seed...\n');

// CONFIDENTIAL ROLLS
console.log('=== CONFIDENTIAL ROLLS ===');

await createRecipe(
  'RSM Full',
  "Randy's original signature roll - Tempura'd california roll topped w/ crab, salmon, tuna, albacore, spicy soy, unagi sauce, macadamia nuts, green onions, tobiko",
  'Confidential Rolls',
  12,
  34.50,
  [
    { id: ING.sushi_rice, qty: 1.5, unit: 'cup' },
    { id: ING.nori, qty: 1, unit: 'sheet' },
    { id: ING.crab_stick, qty: 4, unit: 'pieces' },
    { id: ING.avocado, qty: 0.5, unit: 'each' },
    { id: ING.salmon_sashimi, qty: 2, unit: 'pieces' },
    { id: ING.tuna_sashimi, qty: 2, unit: 'pieces' },
    { id: ING.albacore_sashimi, qty: 2, unit: 'pieces' },
    { id: ING.spicy_soy, qty: 1, unit: 'oz' },
    { id: ING.unagi_sauce, qty: 1, unit: 'oz' },
    { id: ING.macadamia_nuts, qty: 0.5, unit: 'oz' },
    { id: ING.green_onion, qty: 0.25, unit: 'oz' },
    { id: ING.tobiko, qty: 0.5, unit: 'oz' },
  ]
);

await createRecipe(
  'RSM Half',
  "Randy's original signature roll (half) - Tempura'd california roll topped w/ crab, salmon, tuna, albacore, spicy soy, unagi sauce, macadamia nuts, green onions, tobiko",
  'Confidential Rolls',
  6,
  24.50,
  [
    { id: ING.sushi_rice, qty: 0.75, unit: 'cup' },
    { id: ING.nori, qty: 0.5, unit: 'sheet' },
    { id: ING.crab_stick, qty: 2, unit: 'pieces' },
    { id: ING.avocado, qty: 0.25, unit: 'each' },
    { id: ING.salmon_sashimi, qty: 1, unit: 'pieces' },
    { id: ING.tuna_sashimi, qty: 1, unit: 'pieces' },
    { id: ING.albacore_sashimi, qty: 1, unit: 'pieces' },
    { id: ING.spicy_soy, qty: 0.5, unit: 'oz' },
    { id: ING.unagi_sauce, qty: 0.5, unit: 'oz' },
    { id: ING.macadamia_nuts, qty: 0.25, unit: 'oz' },
    { id: ING.green_onion, qty: 0.125, unit: 'oz' },
    { id: ING.tobiko, qty: 0.25, unit: 'oz' },
  ]
);

await createRecipe(
  'Geisha Girl',
  'Spicy tuna, avocado, topped w/ salmon, lemon, green onion, spicy soy, unagi sauce, tobiko, macadamia nuts',
  'Confidential Rolls',
  8,
  24.50,
  [
    { id: ING.sushi_rice, qty: 1, unit: 'cup' },
    { id: ING.nori, qty: 1, unit: 'sheet' },
    { id: ING.tuna_sashimi, qty: 3, unit: 'pieces' },
    { id: ING.avocado, qty: 0.5, unit: 'each' },
    { id: ING.salmon_sashimi, qty: 4, unit: 'pieces' },
    { id: ING.lemon, qty: 0.25, unit: 'each' },
    { id: ING.green_onion, qty: 0.25, unit: 'oz' },
    { id: ING.spicy_soy, qty: 0.75, unit: 'oz' },
    { id: ING.unagi_sauce, qty: 0.75, unit: 'oz' },
    { id: ING.tobiko, qty: 0.5, unit: 'oz' },
    { id: ING.macadamia_nuts, qty: 0.5, unit: 'oz' },
  ]
);

await createRecipe(
  'Shishito-Kamikaze',
  "Spicy tuna, tempura'd shishito pepper, cream cheese, topped w/ tuna, spicy soy, unagi sauce, jalapeño",
  'Confidential Rolls',
  8,
  23.95,
  [
    { id: ING.sushi_rice, qty: 1, unit: 'cup' },
    { id: ING.nori, qty: 1, unit: 'sheet' },
    { id: ING.tuna_sashimi, qty: 6, unit: 'pieces' },
    { id: ING.shishito_pepper, qty: 2, unit: 'each' },
    { id: ING.cream_cheese, qty: 1, unit: 'oz' },
    { id: ING.spicy_soy, qty: 0.75, unit: 'oz' },
    { id: ING.unagi_sauce, qty: 0.75, unit: 'oz' },
    { id: ING.jalapeno, qty: 1, unit: 'each' },
  ]
);

await createRecipe(
  'Salmon Sushi Rollito',
  'Salmon sashimi, spicy crab, avocado topped w/ lemon, ponzu, sesame seeds, micro cilantro',
  'Confidential Rolls',
  4,
  22.95,
  [
    { id: ING.salmon_sashimi, qty: 6, unit: 'pieces' },
    { id: ING.crab_stick, qty: 2, unit: 'pieces' },
    { id: ING.avocado, qty: 0.5, unit: 'each' },
    { id: ING.lemon, qty: 0.25, unit: 'each' },
    { id: ING.ponzu, qty: 0.5, unit: 'oz' },
    { id: ING.sesame_seeds, qty: 0.1, unit: 'oz' },
    { id: ING.micro_cilantro, qty: 0.1, unit: 'oz' },
  ]
);

await createRecipe(
  'Pizza Maki Roll',
  'Crab, avocado topped w/ spicy tuna, sriracha sauce, unagi sauce, green onion, sesame seeds (baked)',
  'Confidential Rolls',
  8,
  18.75,
  [
    { id: ING.sushi_rice, qty: 1, unit: 'cup' },
    { id: ING.nori, qty: 1, unit: 'sheet' },
    { id: ING.crab_stick, qty: 3, unit: 'pieces' },
    { id: ING.avocado, qty: 0.5, unit: 'each' },
    { id: ING.tuna_sashimi, qty: 3, unit: 'pieces' },
    { id: ING.sriracha, qty: 0.5, unit: 'oz' },
    { id: ING.unagi_sauce, qty: 0.5, unit: 'oz' },
    { id: ING.green_onion, qty: 0.25, unit: 'oz' },
    { id: ING.sesame_seeds, qty: 0.1, unit: 'oz' },
  ]
);

await createRecipe(
  'Tropic Like It\'s Hot',
  'Shrimp tempura, avocado, mango, topped w/ salmon, spicy soy sauce, unagi sauce, tempura crunch',
  'Confidential Rolls',
  8,
  23.50,
  [
    { id: ING.sushi_rice, qty: 1, unit: 'cup' },
    { id: ING.nori, qty: 1, unit: 'sheet' },
    { id: ING.shrimp_tempura, qty: 2, unit: 'pieces' },
    { id: ING.avocado, qty: 0.5, unit: 'each' },
    { id: ING.mango, qty: 0.25, unit: 'each' },
    { id: ING.salmon_sashimi, qty: 4, unit: 'pieces' },
    { id: ING.spicy_soy, qty: 0.5, unit: 'oz' },
    { id: ING.unagi_sauce, qty: 0.5, unit: 'oz' },
    { id: ING.tempura_crunch, qty: 0.5, unit: 'oz' },
  ]
);

await createRecipe(
  'Flamin\' HOT Cheetos Roll',
  'Shrimp tempura, cream cheese, avocado, topped w/ spicy crab, spicy soy sauce, Flamin\' HOT Cheetos, jalapeño (soy paper, fully cooked)',
  'Confidential Rolls',
  8,
  22.95,
  [
    { id: ING.sushi_rice, qty: 1, unit: 'cup' },
    { id: ING.soy_paper, qty: 1, unit: 'pieces' },
    { id: ING.shrimp_tempura, qty: 2, unit: 'pieces' },
    { id: ING.cream_cheese, qty: 1, unit: 'oz' },
    { id: ING.avocado, qty: 0.5, unit: 'each' },
    { id: ING.crab_stick, qty: 2, unit: 'pieces' },
    { id: ING.spicy_soy, qty: 0.5, unit: 'oz' },
    { id: ING.hot_cheetos, qty: 0.5, unit: 'oz' },
    { id: ING.jalapeno, qty: 1, unit: 'each' },
  ]
);

await createRecipe(
  'The Lime & Dine',
  'Avocado, cucumber topped w/ salmon, lemon, lime, ponzu sauce, persian lime olive oil, micro cilantro sesame seeds',
  'Confidential Rolls',
  8,
  22.50,
  [
    { id: ING.sushi_rice, qty: 1, unit: 'cup' },
    { id: ING.nori, qty: 1, unit: 'sheet' },
    { id: ING.avocado, qty: 0.5, unit: 'each' },
    { id: ING.cucumber, qty: 0.25, unit: 'each' },
    { id: ING.salmon_sashimi, qty: 4, unit: 'pieces' },
    { id: ING.lemon, qty: 0.25, unit: 'each' },
    { id: ING.lime, qty: 0.25, unit: 'each' },
    { id: ING.ponzu, qty: 0.5, unit: 'oz' },
    { id: ING.persian_lime_oil, qty: 0.25, unit: 'oz' },
    { id: ING.micro_cilantro, qty: 0.1, unit: 'oz' },
    { id: ING.sesame_seeds, qty: 0.1, unit: 'oz' },
  ]
);

await createRecipe(
  'Spy vs Spy',
  'Shrimp tempura, crab, topped w/ spicy tuna, avocado, charred scallion sauce, bonito flakes',
  'Confidential Rolls',
  8,
  23.95,
  [
    { id: ING.sushi_rice, qty: 1, unit: 'cup' },
    { id: ING.nori, qty: 1, unit: 'sheet' },
    { id: ING.shrimp_tempura, qty: 2, unit: 'pieces' },
    { id: ING.crab_stick, qty: 2, unit: 'pieces' },
    { id: ING.tuna_sashimi, qty: 3, unit: 'pieces' },
    { id: ING.avocado, qty: 0.5, unit: 'each' },
    { id: ING.charred_scallion, qty: 0.5, unit: 'oz' },
    { id: ING.bonito_flakes, qty: 0.25, unit: 'oz' },
  ]
);

await createRecipe(
  'Savage Sarah',
  'Spicy crab, avocado, cucumber, jalapeño topped w/ tuna, salmon, lemon, lime, sweet & sour, unagi sauce, habanero tobiko, green onions, sweet potato crisps',
  'Confidential Rolls',
  8,
  24.50,
  [
    { id: ING.sushi_rice, qty: 1, unit: 'cup' },
    { id: ING.nori, qty: 1, unit: 'sheet' },
    { id: ING.crab_stick, qty: 2, unit: 'pieces' },
    { id: ING.avocado, qty: 0.5, unit: 'each' },
    { id: ING.cucumber, qty: 0.25, unit: 'each' },
    { id: ING.jalapeno, qty: 1, unit: 'each' },
    { id: ING.tuna_sashimi, qty: 2, unit: 'pieces' },
    { id: ING.salmon_sashimi, qty: 2, unit: 'pieces' },
    { id: ING.lemon, qty: 0.25, unit: 'each' },
    { id: ING.lime, qty: 0.25, unit: 'each' },
    { id: ING.sweet_sour, qty: 0.5, unit: 'oz' },
    { id: ING.unagi_sauce, qty: 0.5, unit: 'oz' },
    { id: ING.habanero_tobiko, qty: 0.5, unit: 'oz' },
    { id: ING.green_onion, qty: 0.25, unit: 'oz' },
    { id: ING.sweet_potato_crisps, qty: 0.25, unit: 'oz' },
  ]
);

await createRecipe(
  'Shady Shrimp',
  'Shrimp tempura, spicy crab, avocado, topped w/ seared salmon, micro cilantro, sesame seeds, ponzu sauce',
  'Confidential Rolls',
  8,
  23.25,
  [
    { id: ING.sushi_rice, qty: 1, unit: 'cup' },
    { id: ING.nori, qty: 1, unit: 'sheet' },
    { id: ING.shrimp_tempura, qty: 2, unit: 'pieces' },
    { id: ING.crab_stick, qty: 2, unit: 'pieces' },
    { id: ING.avocado, qty: 0.5, unit: 'each' },
    { id: ING.salmon_sashimi, qty: 4, unit: 'pieces' },
    { id: ING.micro_cilantro, qty: 0.1, unit: 'oz' },
    { id: ING.sesame_seeds, qty: 0.1, unit: 'oz' },
    { id: ING.ponzu, qty: 0.5, unit: 'oz' },
  ]
);

await createRecipe(
  'Classified Rainbow',
  'Crab, avocado, topped w/ five kinds of fish, spicy crab, unagi sauce, macadamia nuts',
  'Confidential Rolls',
  8,
  23.95,
  [
    { id: ING.sushi_rice, qty: 1, unit: 'cup' },
    { id: ING.nori, qty: 1, unit: 'sheet' },
    { id: ING.crab_stick, qty: 3, unit: 'pieces' },
    { id: ING.avocado, qty: 0.5, unit: 'each' },
    { id: ING.tuna_sashimi, qty: 1, unit: 'pieces' },
    { id: ING.salmon_sashimi, qty: 1, unit: 'pieces' },
    { id: ING.yellowtail_sashimi, qty: 1, unit: 'pieces' },
    { id: ING.albacore_sashimi, qty: 1, unit: 'pieces' },
    { id: ING.cooked_shrimp, qty: 1, unit: 'pieces' },
    { id: ING.unagi_sauce, qty: 0.5, unit: 'oz' },
    { id: ING.macadamia_nuts, qty: 0.5, unit: 'oz' },
  ]
);

await createRecipe(
  'Blonde Bombshell',
  'Spicy tuna, unagi, avocado, topped w/ yellowtail, unagi sauce, habanero tobiko, macadamia nuts, green onion',
  'Confidential Rolls',
  8,
  22.95,
  [
    { id: ING.sushi_rice, qty: 1, unit: 'cup' },
    { id: ING.nori, qty: 1, unit: 'sheet' },
    { id: ING.tuna_sashimi, qty: 3, unit: 'pieces' },
    { id: ING.eel, qty: 2, unit: 'pieces' },
    { id: ING.avocado, qty: 0.5, unit: 'each' },
    { id: ING.yellowtail_sashimi, qty: 4, unit: 'pieces' },
    { id: ING.unagi_sauce, qty: 0.75, unit: 'oz' },
    { id: ING.habanero_tobiko, qty: 0.5, unit: 'oz' },
    { id: ING.macadamia_nuts, qty: 0.5, unit: 'oz' },
    { id: ING.green_onion, qty: 0.25, unit: 'oz' },
  ]
);

await createRecipe(
  'Cabo Conspiracy',
  'Spicy crab, avocado, topped w/ sweet & sour, tempura crunch, jalapeño, habanero tobiko (fully cooked)',
  'Confidential Rolls',
  8,
  18.95,
  [
    { id: ING.sushi_rice, qty: 1, unit: 'cup' },
    { id: ING.nori, qty: 1, unit: 'sheet' },
    { id: ING.crab_stick, qty: 3, unit: 'pieces' },
    { id: ING.avocado, qty: 0.5, unit: 'each' },
    { id: ING.sweet_sour, qty: 0.5, unit: 'oz' },
    { id: ING.tempura_crunch, qty: 0.5, unit: 'oz' },
    { id: ING.jalapeno, qty: 1, unit: 'each' },
    { id: ING.habanero_tobiko, qty: 0.5, unit: 'oz' },
  ]
);

// CLASSIC ROLLS
console.log('\n=== CLASSIC ROLLS ===');

await createRecipe(
  'Avocado Roll',
  'Avocado, sesame seeds',
  'Classic Rolls',
  8,
  10.25,
  [
    { id: ING.sushi_rice, qty: 1, unit: 'cup' },
    { id: ING.nori, qty: 1, unit: 'sheet' },
    { id: ING.avocado, qty: 1, unit: 'each' },
    { id: ING.sesame_seeds, qty: 0.1, unit: 'oz' },
  ]
);

await createRecipe(
  'California Roll',
  'Crab, avocado, sesame seeds',
  'Classic Rolls',
  8,
  11.50,
  [
    { id: ING.sushi_rice, qty: 1, unit: 'cup' },
    { id: ING.nori, qty: 1, unit: 'sheet' },
    { id: ING.crab_stick, qty: 3, unit: 'pieces' },
    { id: ING.avocado, qty: 0.5, unit: 'each' },
    { id: ING.sesame_seeds, qty: 0.1, unit: 'oz' },
  ]
);

await createRecipe(
  'Caterpillar Roll',
  'Eel, crab, cucumber, topped w/ avocado, unagi sauce',
  'Classic Rolls',
  8,
  20.95,
  [
    { id: ING.sushi_rice, qty: 1, unit: 'cup' },
    { id: ING.nori, qty: 1, unit: 'sheet' },
    { id: ING.eel, qty: 3, unit: 'pieces' },
    { id: ING.crab_stick, qty: 2, unit: 'pieces' },
    { id: ING.cucumber, qty: 0.25, unit: 'each' },
    { id: ING.avocado, qty: 1, unit: 'each' },
    { id: ING.unagi_sauce, qty: 0.75, unit: 'oz' },
  ]
);

await createRecipe(
  'Salmon Avocado Roll',
  'Salmon, topped w/ avocado',
  'Classic Rolls',
  8,
  14.95,
  [
    { id: ING.sushi_rice, qty: 1, unit: 'cup' },
    { id: ING.nori, qty: 1, unit: 'sheet' },
    { id: ING.salmon_sashimi, qty: 4, unit: 'pieces' },
    { id: ING.avocado, qty: 0.5, unit: 'each' },
  ]
);

await createRecipe(
  'Dragon Roll',
  'Shrimp tempura, crab topped w/ eel, avocado, unagi sauce',
  'Classic Rolls',
  8,
  20.95,
  [
    { id: ING.sushi_rice, qty: 1, unit: 'cup' },
    { id: ING.nori, qty: 1, unit: 'sheet' },
    { id: ING.shrimp_tempura, qty: 2, unit: 'pieces' },
    { id: ING.crab_stick, qty: 2, unit: 'pieces' },
    { id: ING.eel, qty: 3, unit: 'pieces' },
    { id: ING.avocado, qty: 0.5, unit: 'each' },
    { id: ING.unagi_sauce, qty: 0.75, unit: 'oz' },
  ]
);

await createRecipe(
  'New York Roll',
  'Cooked shrimp, avocado, sesame seeds',
  'Classic Rolls',
  8,
  12.50,
  [
    { id: ING.sushi_rice, qty: 1, unit: 'cup' },
    { id: ING.nori, qty: 1, unit: 'sheet' },
    { id: ING.cooked_shrimp, qty: 3, unit: 'pieces' },
    { id: ING.avocado, qty: 0.5, unit: 'each' },
    { id: ING.sesame_seeds, qty: 0.1, unit: 'oz' },
  ]
);

await createRecipe(
  'Philadelphia Roll',
  'Smoked salmon, avocado, cream cheese, sesame seeds',
  'Classic Rolls',
  8,
  14.25,
  [
    { id: ING.sushi_rice, qty: 1, unit: 'cup' },
    { id: ING.nori, qty: 1, unit: 'sheet' },
    { id: ING.smoked_salmon, qty: 3, unit: 'pieces' },
    { id: ING.avocado, qty: 0.5, unit: 'each' },
    { id: ING.cream_cheese, qty: 1.5, unit: 'oz' },
    { id: ING.sesame_seeds, qty: 0.1, unit: 'oz' },
  ]
);

await createRecipe(
  'Rainbow Roll',
  'Crab, avocado topped w/ five kinds of fish',
  'Classic Rolls',
  8,
  20.25,
  [
    { id: ING.sushi_rice, qty: 1, unit: 'cup' },
    { id: ING.nori, qty: 1, unit: 'sheet' },
    { id: ING.crab_stick, qty: 3, unit: 'pieces' },
    { id: ING.avocado, qty: 0.5, unit: 'each' },
    { id: ING.tuna_sashimi, qty: 1, unit: 'pieces' },
    { id: ING.salmon_sashimi, qty: 1, unit: 'pieces' },
    { id: ING.yellowtail_sashimi, qty: 1, unit: 'pieces' },
    { id: ING.albacore_sashimi, qty: 1, unit: 'pieces' },
    { id: ING.cooked_shrimp, qty: 1, unit: 'pieces' },
  ]
);

await createRecipe(
  'Rock n Roll',
  'Eel, avocado, sesame seeds, unagi sauce',
  'Classic Rolls',
  8,
  15.25,
  [
    { id: ING.sushi_rice, qty: 1, unit: 'cup' },
    { id: ING.nori, qty: 1, unit: 'sheet' },
    { id: ING.eel, qty: 3, unit: 'pieces' },
    { id: ING.avocado, qty: 0.5, unit: 'each' },
    { id: ING.sesame_seeds, qty: 0.1, unit: 'oz' },
    { id: ING.unagi_sauce, qty: 0.5, unit: 'oz' },
  ]
);

await createRecipe(
  'Salmon Skin Roll',
  'Carrot, avocado, sesame seeds',
  'Classic Rolls',
  8,
  14.25,
  [
    { id: ING.sushi_rice, qty: 1, unit: 'cup' },
    { id: ING.nori, qty: 1, unit: 'sheet' },
    { id: ING.carrot, qty: 1, unit: 'each' },
    { id: ING.avocado, qty: 0.5, unit: 'each' },
    { id: ING.sesame_seeds, qty: 0.1, unit: 'oz' },
  ]
);

await createRecipe(
  'Shrimp Tempura Roll',
  'Shrimp tempura, avocado, sesame seeds, unagi sauce',
  'Classic Rolls',
  8,
  15.75,
  [
    { id: ING.sushi_rice, qty: 1, unit: 'cup' },
    { id: ING.nori, qty: 1, unit: 'sheet' },
    { id: ING.shrimp_tempura, qty: 2, unit: 'pieces' },
    { id: ING.avocado, qty: 0.5, unit: 'each' },
    { id: ING.sesame_seeds, qty: 0.1, unit: 'oz' },
    { id: ING.unagi_sauce, qty: 0.5, unit: 'oz' },
  ]
);

await createRecipe(
  'Spicy Tuna Roll',
  'Spicy tuna',
  'Classic Rolls',
  8,
  14.95,
  [
    { id: ING.sushi_rice, qty: 1, unit: 'cup' },
    { id: ING.nori, qty: 1, unit: 'sheet' },
    { id: ING.tuna_sashimi, qty: 4, unit: 'pieces' },
    { id: ING.spicy_mayo, qty: 0.5, unit: 'oz' },
  ]
);

await createRecipe(
  'Spicy Salmon Roll',
  'Spicy salmon',
  'Classic Rolls',
  8,
  14.50,
  [
    { id: ING.sushi_rice, qty: 1, unit: 'cup' },
    { id: ING.nori, qty: 1, unit: 'sheet' },
    { id: ING.salmon_sashimi, qty: 4, unit: 'pieces' },
    { id: ING.spicy_mayo, qty: 0.5, unit: 'oz' },
  ]
);

await createRecipe(
  'Spicy Scallop Roll',
  'Spicy scallops',
  'Classic Rolls',
  8,
  14.50,
  [
    { id: ING.sushi_rice, qty: 1, unit: 'cup' },
    { id: ING.nori, qty: 1, unit: 'sheet' },
    { id: ING.scallops, qty: 4, unit: 'pieces' },
    { id: ING.spicy_mayo, qty: 0.5, unit: 'oz' },
  ]
);

await createRecipe(
  'Spider Roll',
  'Soft-shell crab, avocado, carrot, sesame seeds, unagi sauce',
  'Classic Rolls',
  5,
  17.50,
  [
    { id: ING.sushi_rice, qty: 0.75, unit: 'cup' },
    { id: ING.nori, qty: 1, unit: 'sheet' },
    { id: ING.soft_shell_crab, qty: 1, unit: 'pieces' },
    { id: ING.avocado, qty: 0.5, unit: 'each' },
    { id: ING.carrot, qty: 0.5, unit: 'each' },
    { id: ING.sesame_seeds, qty: 0.1, unit: 'oz' },
    { id: ING.unagi_sauce, qty: 0.5, unit: 'oz' },
  ]
);

await createRecipe(
  'Lion King Roll',
  'Crab, avocado topped w/ salmon, spicy mayo, unagi sauce, green onion (baked)',
  'Classic Rolls',
  8,
  21.25,
  [
    { id: ING.sushi_rice, qty: 1, unit: 'cup' },
    { id: ING.nori, qty: 1, unit: 'sheet' },
    { id: ING.crab_stick, qty: 3, unit: 'pieces' },
    { id: ING.avocado, qty: 0.5, unit: 'each' },
    { id: ING.salmon_sashimi, qty: 4, unit: 'pieces' },
    { id: ING.spicy_mayo, qty: 0.5, unit: 'oz' },
    { id: ING.unagi_sauce, qty: 0.5, unit: 'oz' },
    { id: ING.green_onion, qty: 0.25, unit: 'oz' },
  ]
);

// COOKED ROLLS
console.log('\n=== COOKED ROLLS ===');

await createRecipe(
  'Classified Crunchy Crab Full',
  "Tempura'd california topped w/ spicy crab, spicy soy, unagi sauce",
  'Cooked Rolls',
  10,
  24.25,
  [
    { id: ING.sushi_rice, qty: 1.25, unit: 'cup' },
    { id: ING.nori, qty: 1, unit: 'sheet' },
    { id: ING.crab_stick, qty: 5, unit: 'pieces' },
    { id: ING.avocado, qty: 0.5, unit: 'each' },
    { id: ING.spicy_soy, qty: 0.75, unit: 'oz' },
    { id: ING.unagi_sauce, qty: 0.75, unit: 'oz' },
  ]
);

await createRecipe(
  'Classified Crunchy Crab Half',
  "Tempura'd california topped w/ spicy crab, spicy soy, unagi sauce (half)",
  'Cooked Rolls',
  5,
  17.25,
  [
    { id: ING.sushi_rice, qty: 0.625, unit: 'cup' },
    { id: ING.nori, qty: 0.5, unit: 'sheet' },
    { id: ING.crab_stick, qty: 2.5, unit: 'pieces' },
    { id: ING.avocado, qty: 0.25, unit: 'each' },
    { id: ING.spicy_soy, qty: 0.375, unit: 'oz' },
    { id: ING.unagi_sauce, qty: 0.375, unit: 'oz' },
  ]
);

await createRecipe(
  'Deep Sea-I-A',
  "Tempura'd shrimp, avocado, topped w/ cooked salmon, drizzled w/ unagi sauce & sweet musashi sauce, green onion, sweet potato crisps",
  'Cooked Rolls',
  8,
  22.25,
  [
    { id: ING.sushi_rice, qty: 1, unit: 'cup' },
    { id: ING.nori, qty: 1, unit: 'sheet' },
    { id: ING.shrimp_tempura, qty: 2, unit: 'pieces' },
    { id: ING.avocado, qty: 0.5, unit: 'each' },
    { id: ING.cooked_salmon, qty: 3, unit: 'pieces' },
    { id: ING.unagi_sauce, qty: 0.5, unit: 'oz' },
    { id: ING.sweet_musashi, qty: 0.5, unit: 'oz' },
    { id: ING.green_onion, qty: 0.25, unit: 'oz' },
    { id: ING.sweet_potato_crisps, qty: 0.25, unit: 'oz' },
  ]
);

await createRecipe(
  'You Can\'t Rage',
  'Shrimp tempura, avocado, cucumber, topped w/ cooked shrimp, lemon, sweet jalapeño salsa, micro cilantro, meyer lemon olive oil',
  'Cooked Rolls',
  8,
  22.25,
  [
    { id: ING.sushi_rice, qty: 1, unit: 'cup' },
    { id: ING.nori, qty: 1, unit: 'sheet' },
    { id: ING.shrimp_tempura, qty: 2, unit: 'pieces' },
    { id: ING.avocado, qty: 0.5, unit: 'each' },
    { id: ING.cucumber, qty: 0.25, unit: 'each' },
    { id: ING.cooked_shrimp, qty: 3, unit: 'pieces' },
    { id: ING.lemon, qty: 0.25, unit: 'each' },
    { id: ING.sweet_jalapeno_salsa, qty: 0.5, unit: 'oz' },
    { id: ING.micro_cilantro, qty: 0.1, unit: 'oz' },
    { id: ING.meyer_lemon_oil, qty: 0.25, unit: 'oz' },
  ]
);

await createRecipe(
  'Golden Philly',
  "Tempura'd smoked salmon, cream cheese, avocado topped w/ unagi sauce, green onion, macadamia nuts",
  'Cooked Rolls',
  10,
  23.50,
  [
    { id: ING.sushi_rice, qty: 1.25, unit: 'cup' },
    { id: ING.nori, qty: 1, unit: 'sheet' },
    { id: ING.smoked_salmon, qty: 4, unit: 'pieces' },
    { id: ING.cream_cheese, qty: 2, unit: 'oz' },
    { id: ING.avocado, qty: 0.5, unit: 'each' },
    { id: ING.unagi_sauce, qty: 0.75, unit: 'oz' },
    { id: ING.green_onion, qty: 0.25, unit: 'oz' },
    { id: ING.macadamia_nuts, qty: 0.5, unit: 'oz' },
  ]
);

await createRecipe(
  'Surf\'s Up',
  'Spicy crab, cream cheese, cucumber, topped w/ sliced new york steak, unagi sauce, macadamia nuts',
  'Cooked Rolls',
  8,
  22.25,
  [
    { id: ING.sushi_rice, qty: 1, unit: 'cup' },
    { id: ING.nori, qty: 1, unit: 'sheet' },
    { id: ING.crab_stick, qty: 3, unit: 'pieces' },
    { id: ING.cream_cheese, qty: 1, unit: 'oz' },
    { id: ING.cucumber, qty: 0.25, unit: 'each' },
    { id: ING.ny_steak, qty: 3, unit: 'pieces' },
    { id: ING.unagi_sauce, qty: 0.5, unit: 'oz' },
    { id: ING.macadamia_nuts, qty: 0.5, unit: 'oz' },
  ]
);

// NIGIRI & SASHIMI
console.log('\n=== NIGIRI & SASHIMI ===');

await createRecipe(
  'Yellowfin Tuna Nigiri (2pc)',
  'Yellowfin tuna nigiri',
  'Nigiri & Sashimi',
  2,
  11.50,
  [
    { id: ING.sushi_rice, qty: 0.25, unit: 'cup' },
    { id: ING.tuna_sashimi, qty: 2, unit: 'pieces' },
  ]
);

await createRecipe(
  'Yellowfin Tuna Sashimi (5pc)',
  'Yellowfin tuna sashimi',
  'Nigiri & Sashimi',
  5,
  18.50,
  [
    { id: ING.tuna_sashimi, qty: 5, unit: 'pieces' },
  ]
);

await createRecipe(
  'Yellowtail Nigiri (2pc)',
  'Yellowtail nigiri',
  'Nigiri & Sashimi',
  2,
  10.95,
  [
    { id: ING.sushi_rice, qty: 0.25, unit: 'cup' },
    { id: ING.yellowtail_sashimi, qty: 2, unit: 'pieces' },
  ]
);

await createRecipe(
  'Yellowtail Sashimi (5pc)',
  'Yellowtail sashimi',
  'Nigiri & Sashimi',
  5,
  17.95,
  [
    { id: ING.yellowtail_sashimi, qty: 5, unit: 'pieces' },
  ]
);

await createRecipe(
  'Salmon Nigiri (2pc)',
  'Salmon nigiri',
  'Nigiri & Sashimi',
  2,
  11.25,
  [
    { id: ING.sushi_rice, qty: 0.25, unit: 'cup' },
    { id: ING.salmon_sashimi, qty: 2, unit: 'pieces' },
  ]
);

await createRecipe(
  'Salmon Sashimi (5pc)',
  'Salmon sashimi',
  'Nigiri & Sashimi',
  5,
  18.25,
  [
    { id: ING.salmon_sashimi, qty: 5, unit: 'pieces' },
  ]
);

await createRecipe(
  'Salmon Belly Nigiri (2pc)',
  'Salmon belly nigiri',
  'Nigiri & Sashimi',
  2,
  11.95,
  [
    { id: ING.sushi_rice, qty: 0.25, unit: 'cup' },
    { id: ING.salmon_belly, qty: 2, unit: 'pieces' },
  ]
);

await createRecipe(
  'Albacore Nigiri (2pc)',
  'Albacore tuna nigiri',
  'Nigiri & Sashimi',
  2,
  11.25,
  [
    { id: ING.sushi_rice, qty: 0.25, unit: 'cup' },
    { id: ING.albacore_sashimi, qty: 2, unit: 'pieces' },
  ]
);

await createRecipe(
  'Albacore Sashimi (5pc)',
  'Albacore tuna sashimi',
  'Nigiri & Sashimi',
  5,
  18.25,
  [
    { id: ING.albacore_sashimi, qty: 5, unit: 'pieces' },
  ]
);

await createRecipe(
  'Eel Nigiri (2pc)',
  'Eel nigiri (fully cooked)',
  'Nigiri & Sashimi',
  2,
  11.50,
  [
    { id: ING.sushi_rice, qty: 0.25, unit: 'cup' },
    { id: ING.eel, qty: 2, unit: 'pieces' },
    { id: ING.unagi_sauce, qty: 0.25, unit: 'oz' },
  ]
);

await createRecipe(
  'Scallops Nigiri (2pc)',
  'Hokkaido scallops nigiri',
  'Nigiri & Sashimi',
  2,
  9.50,
  [
    { id: ING.sushi_rice, qty: 0.25, unit: 'cup' },
    { id: ING.scallops, qty: 2, unit: 'pieces' },
  ]
);

await createRecipe(
  'Cooked Shrimp Nigiri (2pc)',
  'Cooked shrimp nigiri (fully cooked)',
  'Nigiri & Sashimi',
  2,
  8.75,
  [
    { id: ING.sushi_rice, qty: 0.25, unit: 'cup' },
    { id: ING.cooked_shrimp, qty: 2, unit: 'pieces' },
  ]
);

await createRecipe(
  'Crab Stick Nigiri (2pc)',
  'Crab stick nigiri (fully cooked)',
  'Nigiri & Sashimi',
  2,
  8.50,
  [
    { id: ING.sushi_rice, qty: 0.25, unit: 'cup' },
    { id: ING.crab_stick, qty: 2, unit: 'pieces' },
  ]
);

await createRecipe(
  'Snow Crab Nigiri (2pc)',
  'Real crab nigiri (fully cooked)',
  'Nigiri & Sashimi',
  2,
  11.50,
  [
    { id: ING.sushi_rice, qty: 0.25, unit: 'cup' },
    { id: ING.snow_crab, qty: 2, unit: 'pieces' },
  ]
);

await createRecipe(
  'Sweet Egg Nigiri (2pc)',
  'Sweet egg nigiri (fully cooked)',
  'Nigiri & Sashimi',
  2,
  7.95,
  [
    { id: ING.sushi_rice, qty: 0.25, unit: 'cup' },
    { id: ING.tamago, qty: 2, unit: 'pieces' },
  ]
);

await createRecipe(
  'Flying Fish Roe Nigiri (2pc)',
  'Flying fish roe nigiri',
  'Nigiri & Sashimi',
  2,
  8.50,
  [
    { id: ING.sushi_rice, qty: 0.25, unit: 'cup' },
    { id: ING.tobiko, qty: 0.5, unit: 'oz' },
  ]
);

await createRecipe(
  'Flying Fish Roe w/ Quail Egg (2pc)',
  'Flying fish roe with quail egg',
  'Nigiri & Sashimi',
  2,
  11.25,
  [
    { id: ING.sushi_rice, qty: 0.25, unit: 'cup' },
    { id: ING.tobiko, qty: 0.5, unit: 'oz' },
    { id: ING.quail_egg, qty: 1, unit: 'each' },
  ]
);

await createRecipe(
  'Salmon Eggs Nigiri (2pc)',
  'Salmon eggs nigiri',
  'Nigiri & Sashimi',
  2,
  9.50,
  [
    { id: ING.sushi_rice, qty: 0.25, unit: 'cup' },
    { id: ING.ikura, qty: 0.5, unit: 'oz' },
  ]
);

await createRecipe(
  'Fried Tofu Nigiri (2pc)',
  'Fried tofu nigiri (fully cooked)',
  'Nigiri & Sashimi',
  2,
  7.50,
  [
    { id: ING.sushi_rice, qty: 0.25, unit: 'cup' },
    { id: ING.fried_tofu, qty: 2, unit: 'pieces' },
  ]
);

// SIGNATURE SASHIMI
console.log('\n=== SIGNATURE SASHIMI ===');

await createRecipe(
  'Tuna Truffle',
  'Tuna, shiitake mushroom, truffle olive oil, unagi sauce, green onion',
  'Signature Sashimi',
  5,
  24.25,
  [
    { id: ING.tuna_sashimi, qty: 5, unit: 'pieces' },
    { id: ING.shiitake_mushroom, qty: 0.5, unit: 'oz' },
    { id: ING.truffle_oil, qty: 0.5, unit: 'oz' },
    { id: ING.unagi_sauce, qty: 0.5, unit: 'oz' },
    { id: ING.green_onion, qty: 0.25, unit: 'oz' },
  ]
);

await createRecipe(
  'Hamachi Jalapeno',
  'Yellowtail, jalapeño, ponzu, micro-cilantro, jalapeño-infused olive oil',
  'Signature Sashimi',
  5,
  24.25,
  [
    { id: ING.yellowtail_sashimi, qty: 5, unit: 'pieces' },
    { id: ING.jalapeno, qty: 1, unit: 'each' },
    { id: ING.ponzu, qty: 0.5, unit: 'oz' },
    { id: ING.micro_cilantro, qty: 0.1, unit: 'oz' },
    { id: ING.jalapeno_oil, qty: 0.5, unit: 'oz' },
  ]
);

await createRecipe(
  'Salmon Persian Lime',
  'Salmon, mango, persian lime olive oil, fresh cilantro',
  'Signature Sashimi',
  5,
  23.75,
  [
    { id: ING.salmon_sashimi, qty: 5, unit: 'pieces' },
    { id: ING.mango, qty: 0.25, unit: 'each' },
    { id: ING.persian_lime_oil, qty: 0.5, unit: 'oz' },
    { id: ING.fresh_cilantro, qty: 0.25, unit: 'oz' },
  ]
);

console.log('\n✅ Recipe seed complete!');
console.log('Total recipes added: 52');

await connection.end();
