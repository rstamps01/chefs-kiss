#!/usr/bin/env node
/**
 * Seed database with sample data for Chef's Kiss
 * Run with: node seed-database.mjs
 */

import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.ts';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function seed() {
  console.log('🌱 Seeding database...\n');

  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);

  try {
    // Get owner user
    const ownerOpenId = process.env.OWNER_OPEN_ID;
    if (!ownerOpenId) {
      console.error('❌ OWNER_OPEN_ID not found');
      process.exit(1);
    }

    // Find or create owner user
    const [owner] = await db.select().from(schema.users).where(eq(schema.users.openId, ownerOpenId)).limit(1);
    
    if (!owner) {
      console.error('❌ Owner user not found in database');
      process.exit(1);
    }

    console.log(`✓ Found owner user: ${owner.name || owner.email}`);

    // Create sample restaurant
    const [restaurant] = await db.insert(schema.restaurants).values({
      ownerId: owner.id,
      name: 'Sushi Confidential',
      description: 'Premium sushi restaurant specializing in fresh, sustainable seafood',
      cuisine: 'Japanese',
      timezone: 'America/Los_Angeles',
    }).$returningId();

    console.log(`✓ Created restaurant: Sushi Confidential (ID: ${restaurant.id})`);

    // Create location
    const [location] = await db.insert(schema.locations).values({
      restaurantId: restaurant.id,
      name: 'Campbell Main',
      address: '123 Main Street',
      city: 'Campbell',
      state: 'CA',
      zipCode: '95008',
      latitude: '37.2872',
      longitude: '-121.9500',
      isActive: true,
    }).$returningId();

    console.log(`✓ Created location: Campbell Main (ID: ${location.id})`);

    // Create sample ingredients
    const ingredientsData = [
      { name: 'Sushi Rice', category: 'Grains', unit: 'lb', costPerUnit: 2.50, shelfLife: 365, minStock: 50 },
      { name: 'Nori Sheets', category: 'Seaweed', unit: 'pack', costPerUnit: 8.00, shelfLife: 180, minStock: 10 },
      { name: 'Tuna (Ahi)', category: 'Fish', unit: 'lb', costPerUnit: 18.00, shelfLife: 2, minStock: 10 },
      { name: 'Salmon', category: 'Fish', unit: 'lb', costPerUnit: 15.00, shelfLife: 2, minStock: 15 },
      { name: 'Avocado', category: 'Produce', unit: 'each', costPerUnit: 1.50, shelfLife: 3, minStock: 20 },
      { name: 'Cucumber', category: 'Produce', unit: 'each', costPerUnit: 0.75, shelfLife: 7, minStock: 15 },
      { name: 'Soy Sauce', category: 'Condiments', unit: 'gallon', costPerUnit: 12.00, shelfLife: 365, minStock: 5 },
      { name: 'Wasabi Paste', category: 'Condiments', unit: 'lb', costPerUnit: 25.00, shelfLife: 180, minStock: 2 },
      { name: 'Ginger (Pickled)', category: 'Condiments', unit: 'lb', costPerUnit: 8.00, shelfLife: 90, minStock: 5 },
      { name: 'Sesame Seeds', category: 'Toppings', unit: 'lb', costPerUnit: 6.00, shelfLife: 180, minStock: 3 },
    ];

    const ingredientIds = [];
    for (const ing of ingredientsData) {
      const [result] = await db.insert(schema.ingredients).values({
        restaurantId: restaurant.id,
        ...ing,
      }).$returningId();
      ingredientIds.push(result.id);
    }

    console.log(`✓ Created ${ingredientsData.length} ingredients`);

    // Create sample recipes
    const recipesData = [
      { name: 'California Roll', category: 'Rolls', servings: 8, prepTime: 15, cookTime: 0, sellingPrice: 12.00 },
      { name: 'Spicy Tuna Roll', category: 'Rolls', servings: 8, prepTime: 15, cookTime: 0, sellingPrice: 14.00 },
      { name: 'Salmon Nigiri', category: 'Nigiri', servings: 2, prepTime: 5, cookTime: 0, sellingPrice: 8.00 },
      { name: 'Tuna Sashimi', category: 'Sashimi', servings: 5, prepTime: 10, cookTime: 0, sellingPrice: 18.00 },
    ];

    const recipeIds = [];
    for (const recipe of recipesData) {
      const [result] = await db.insert(schema.recipes).values({
        restaurantId: restaurant.id,
        ...recipe,
        isActive: true,
      }).$returningId();
      recipeIds.push(result.id);
    }

    console.log(`✓ Created ${recipesData.length} recipes`);

    // Link ingredients to recipes (California Roll example)
    await db.insert(schema.recipeIngredients).values([
      { recipeId: recipeIds[0], ingredientId: ingredientIds[0], quantity: 0.5, unit: 'lb' }, // Rice
      { recipeId: recipeIds[0], ingredientId: ingredientIds[1], quantity: 1, unit: 'sheet' }, // Nori
      { recipeId: recipeIds[0], ingredientId: ingredientIds[4], quantity: 1, unit: 'each' }, // Avocado
      { recipeId: recipeIds[0], ingredientId: ingredientIds[5], quantity: 0.5, unit: 'each' }, // Cucumber
    ]);

    console.log('✓ Linked ingredients to recipes');

    // Create historical sales data (last 30 days)
    const salesDataArray = [];
    const today = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      
      // Simulate realistic sales patterns
      let baseSales = 2000;
      if (dayOfWeek === 5 || dayOfWeek === 6) baseSales = 3500; // Weekend boost
      if (dayOfWeek === 0) baseSales = 1500; // Sunday slower
      
      // Add some randomness
      const variance = (Math.random() - 0.5) * 500;
      const totalSales = Math.round(baseSales + variance);
      const totalOrders = Math.round(totalSales / 45); // ~$45 avg order
      
      salesDataArray.push({
        locationId: location.id,
        date: dateStr,
        totalSales: totalSales.toString(),
        totalOrders,
        averageOrderValue: (totalSales / totalOrders).toFixed(2),
        lunchSales: (totalSales * 0.4).toFixed(2),
        dinnerSales: (totalSales * 0.6).toFixed(2),
        dayOfWeek,
        isHoliday: false,
      });
    }

    await db.insert(schema.salesData).values(salesDataArray);
    console.log(`✓ Created ${salesDataArray.length} days of sales data`);

    // Create sample weather data (last 30 days + next 7 days forecast)
    const weatherDataArray = [];
    
    for (let i = 30; i >= -7; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Simulate weather
      const tempAvg = 65 + Math.random() * 20;
      const conditions = ['sunny', 'partly_cloudy', 'cloudy', 'rainy'];
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      
      weatherDataArray.push({
        locationId: location.id,
        date: dateStr,
        tempHigh: (tempAvg + 10).toFixed(1),
        tempLow: (tempAvg - 10).toFixed(1),
        tempAvg: tempAvg.toFixed(1),
        precipitation: condition === 'rainy' ? (Math.random() * 0.5).toFixed(2) : '0.00',
        humidity: Math.floor(40 + Math.random() * 40),
        windSpeed: (5 + Math.random() * 15).toFixed(1),
        condition,
        isForecast: i < 0,
      });
    }

    await db.insert(schema.weatherData).values(weatherDataArray);
    console.log(`✓ Created ${weatherDataArray.length} days of weather data`);

    // Create sample forecasts (next 7 days)
    const forecastsArray = [];
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      
      let predictedSales = 2200;
      if (dayOfWeek === 5 || dayOfWeek === 6) predictedSales = 3600;
      if (dayOfWeek === 0) predictedSales = 1600;
      
      forecastsArray.push({
        locationId: location.id,
        forecastDate: dateStr,
        predictedSales: predictedSales.toString(),
        predictedOrders: Math.round(predictedSales / 45),
        confidenceScore: (75 + Math.random() * 20).toFixed(1),
        weatherFactor: (0.9 + Math.random() * 0.2).toFixed(2),
        eventFactor: '1.00',
        trendFactor: '1.05',
        aiInsights: `Based on historical patterns, expect ${dayOfWeek === 5 || dayOfWeek === 6 ? 'high' : 'moderate'} traffic. Weather conditions are favorable.`,
      });
    }

    await db.insert(schema.forecasts).values(forecastsArray);
    console.log(`✓ Created ${forecastsArray.length} days of forecasts`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   • 1 Restaurant: Sushi Confidential`);
    console.log(`   • 1 Location: Campbell Main`);
    console.log(`   • ${ingredientsData.length} Ingredients`);
    console.log(`   • ${recipesData.length} Recipes`);
    console.log(`   • ${salesDataArray.length} days of sales data`);
    console.log(`   • ${weatherDataArray.length} days of weather data`);
    console.log(`   • ${forecastsArray.length} days of forecasts`);

  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
