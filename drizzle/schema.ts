import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, date, boolean, index, unique, json } from "drizzle-orm/mysql-core";

/**
 * Chef's Kiss Database Schema
 * Comprehensive schema for restaurant operations, forecasting, and analytics
 */

// ============================================================================
// CORE USER & RESTAURANT TABLES
// ============================================================================

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "developer"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/**
 * Restaurant/business information
 */
export const restaurants = mysqlTable("restaurants", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(), // references users.id
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  cuisine: varchar("cuisine", { length: 100 }),
  timezone: varchar("timezone", { length: 50 }).default("America/Los_Angeles"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Restaurant locations (multi-location support)
 */
export const locations = mysqlTable("locations", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull(), // references restaurants.id
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zipCode", { length: 20 }),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  restaurantIdx: index("restaurant_idx").on(table.restaurantId),
}));

// ============================================================================
// POS DATA & SALES TABLES
// ============================================================================

/**
 * POS system integrations
 */
export const posIntegrations = mysqlTable("pos_integrations", {
  id: int("id").autoincrement().primaryKey(),
  locationId: int("locationId").notNull(), // references locations.id
  posSystem: varchar("posSystem", { length: 50 }).notNull(), // 'toast', 'square', 'clover', etc.
  apiKey: text("apiKey"), // encrypted
  lastSync: timestamp("lastSync"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  locationIdx: index("location_idx").on(table.locationId),
}));

/**
 * Daily sales data (aggregated from POS)
 */
export const salesData = mysqlTable("sales_data", {
  id: int("id").autoincrement().primaryKey(),
  locationId: int("locationId").notNull(),
  date: date("date").notNull(),
  totalSales: decimal("totalSales", { precision: 10, scale: 2 }).notNull(),
  totalOrders: int("totalOrders").notNull(),
  averageOrderValue: decimal("averageOrderValue", { precision: 10, scale: 2 }),
  lunchSales: decimal("lunchSales", { precision: 10, scale: 2 }),
  dinnerSales: decimal("dinnerSales", { precision: 10, scale: 2 }),
  dayOfWeek: int("dayOfWeek").notNull(), // 0=Sunday, 6=Saturday
  isHoliday: boolean("isHoliday").default(false),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  locationDateIdx: unique("location_date_idx").on(table.locationId, table.date),
  dateIdx: index("date_idx").on(table.date),
}));

/**
 * Item-level sales data
 */
export const itemSales = mysqlTable("item_sales", {
  id: int("id").autoincrement().primaryKey(),
  salesDataId: int("salesDataId").notNull(), // references sales_data.id
  itemName: varchar("itemName", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  quantity: int("quantity").notNull(),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  salesDataIdx: index("sales_data_idx").on(table.salesDataId),
}));

// ============================================================================
// RECIPE & INGREDIENT MANAGEMENT
// ============================================================================

/**
 * Menu items/recipes
 */
export const recipes = mysqlTable("recipes", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  servings: int("servings").default(1),
  prepTime: int("prepTime"), // minutes
  cookTime: int("cookTime"), // minutes
  costPerServing: decimal("costPerServing", { precision: 10, scale: 2 }),
  sellingPrice: decimal("sellingPrice", { precision: 10, scale: 2 }),
  totalCost: decimal("totalCost", { precision: 10, scale: 2 }), // Total ingredient cost
  foodCostPercent: decimal("foodCostPercent", { precision: 5, scale: 2 }), // Food cost as percentage
  marginPercent: decimal("marginPercent", { precision: 5, scale: 2 }), // Profit margin as percentage
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  restaurantIdx: index("restaurant_idx").on(table.restaurantId),
}));

/**
 * Ingredients inventory
 */
export const ingredients = mysqlTable("ingredients", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  unit: varchar("unit", { length: 50 }).notNull(), // 'lb', 'oz', 'kg', 'each', etc.
  costPerUnit: decimal("costPerUnit", { precision: 10, scale: 4 }),
  pieceWeightOz: decimal("piece_weight_oz", { precision: 10, scale: 4 }), // Weight in oz per piece (for pc→oz conversions)
  supplier: varchar("supplier", { length: 255 }),
  shelfLife: int("shelfLife"), // days
  minStock: decimal("minStock", { precision: 10, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  restaurantIdx: index("restaurant_idx").on(table.restaurantId),
}));

/**
 * Recipe ingredients (junction table)
 */
export const recipeIngredients = mysqlTable("recipe_ingredients", {
  id: int("id").autoincrement().primaryKey(),
  recipeId: int("recipeId").notNull(),
  ingredientId: int("ingredientId").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 4 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  recipeIdx: index("recipe_idx").on(table.recipeId),
  ingredientIdx: index("ingredient_idx").on(table.ingredientId),
}));

// ============================================================================
// WEATHER & EVENTS DATA
// ============================================================================

/**
 * Historical and forecast weather data
 */
export const weatherData = mysqlTable("weather_data", {
  id: int("id").autoincrement().primaryKey(),
  locationId: int("locationId").notNull(),
  date: date("date").notNull(),
  tempHigh: decimal("tempHigh", { precision: 5, scale: 2 }),
  tempLow: decimal("tempLow", { precision: 5, scale: 2 }),
  tempAvg: decimal("tempAvg", { precision: 5, scale: 2 }),
  precipitation: decimal("precipitation", { precision: 5, scale: 2 }), // inches
  humidity: int("humidity"), // percentage
  windSpeed: decimal("windSpeed", { precision: 5, scale: 2 }),
  condition: varchar("condition", { length: 100 }), // 'sunny', 'rainy', 'cloudy', etc.
  isForecast: boolean("isForecast").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  locationDateIdx: unique("location_date_idx").on(table.locationId, table.date),
  dateIdx: index("date_idx").on(table.date),
}));

/**
 * Local events that may impact sales
 */
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  locationId: int("locationId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  eventDate: date("eventDate").notNull(),
  eventType: varchar("eventType", { length: 100 }), // 'sports', 'concert', 'festival', etc.
  expectedAttendance: int("expectedAttendance"),
  impactLevel: mysqlEnum("impactLevel", ["low", "medium", "high"]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  locationDateIdx: index("location_date_idx").on(table.locationId, table.eventDate),
}));

// ============================================================================
// FORECASTING & ANALYTICS
// ============================================================================

/**
 * Sales forecasts
 */
export const forecasts = mysqlTable("forecasts", {
  id: int("id").autoincrement().primaryKey(),
  locationId: int("locationId").notNull(),
  forecastDate: date("forecastDate").notNull(),
  predictedSales: decimal("predictedSales", { precision: 10, scale: 2 }).notNull(),
  predictedOrders: int("predictedOrders"),
  confidenceScore: decimal("confidenceScore", { precision: 5, scale: 2 }), // 0-100
  weatherFactor: decimal("weatherFactor", { precision: 5, scale: 2 }),
  eventFactor: decimal("eventFactor", { precision: 5, scale: 2 }),
  trendFactor: decimal("trendFactor", { precision: 5, scale: 2 }),
  aiInsights: text("aiInsights"), // LLM-generated insights
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  locationDateIdx: unique("location_date_idx").on(table.locationId, table.forecastDate),
  dateIdx: index("date_idx").on(table.forecastDate),
}));

/**
 * Daily prep plans
 */
export const prepPlans = mysqlTable("prep_plans", {
  id: int("id").autoincrement().primaryKey(),
  locationId: int("locationId").notNull(),
  planDate: date("planDate").notNull(),
  forecastId: int("forecastId"), // references forecasts.id
  status: mysqlEnum("status", ["draft", "approved", "completed"]).default("draft").notNull(),
  aiRecommendations: text("aiRecommendations"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  locationDateIdx: unique("location_date_idx").on(table.locationId, table.planDate),
}));

/**
 * Prep plan items (ingredient quantities)
 */
export const prepPlanItems = mysqlTable("prep_plan_items", {
  id: int("id").autoincrement().primaryKey(),
  prepPlanId: int("prepPlanId").notNull(),
  ingredientId: int("ingredientId").notNull(),
  plannedQuantity: decimal("plannedQuantity", { precision: 10, scale: 2 }).notNull(),
  actualQuantity: decimal("actualQuantity", { precision: 10, scale: 2 }),
  unit: varchar("unit", { length: 50 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  prepPlanIdx: index("prep_plan_idx").on(table.prepPlanId),
}));

/**
 * Generated reports
 */
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull(),
  locationId: int("locationId"),
  reportType: varchar("reportType", { length: 100 }).notNull(), // 'operations', 'forecast', 'prep', etc.
  title: varchar("title", { length: 255 }).notNull(),
  startDate: date("startDate"),
  endDate: date("endDate"),
  pdfUrl: text("pdfUrl"), // S3 URL
  status: mysqlEnum("status", ["generating", "completed", "failed"]).default("generating").notNull(),
  createdBy: int("createdBy").notNull(), // references users.id
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  restaurantIdx: index("restaurant_idx").on(table.restaurantId),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

/**
 * Recipe categories (configurable in settings)
 */
export const recipeCategories = mysqlTable("recipeCategories", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  categoryType: mysqlEnum("categoryType", ["recipe", "ingredient"]).default("recipe").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  displayOrder: int("displayOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  restaurantIdx: index("restaurant_idx").on(table.restaurantId),
  uniqueNamePerRestaurant: unique("unique_name_per_restaurant").on(table.restaurantId, table.name),
}));

/**
 * Unit categories for grouping compatible units
 */
export const unitCategories = mysqlTable("unitCategories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 50 }).notNull(), // 'Weight', 'Volume', 'Count', 'Custom'
  baseUnit: varchar("baseUnit", { length: 50 }), // 'g', 'ml', 'each', null for Custom
  description: text("description"),
  canAutoConvert: boolean("canAutoConvert").default(false).notNull(), // true for Weight/Volume/Count
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  uniqueName: unique("unique_category_name").on(table.name),
}));

/**
 * Ingredient units (configurable in settings) with conversion support
 */
export const ingredientUnits = mysqlTable("ingredientUnits", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull(),
  name: varchar("name", { length: 50 }).notNull(), // 'lb', 'oz', 'pieces', etc.
  displayName: varchar("displayName", { length: 100 }).notNull(), // 'Pounds (lb)', 'Ounces (oz)', etc.
  categoryId: int("categoryId"), // references unitCategories.id
  conversionFactor: decimal("conversionFactor", { precision: 15, scale: 6 }), // to base unit (e.g., 1 lb = 453.592 g)
  isStandard: boolean("isStandard").default(false).notNull(), // true for lb/oz/cup, false for piece/roll
  isActive: boolean("isActive").default(true).notNull(),
  displayOrder: int("displayOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  restaurantIdx: index("restaurant_idx").on(table.restaurantId),
  categoryIdx: index("category_idx").on(table.categoryId),
  uniqueNamePerRestaurant: unique("unique_name_per_restaurant").on(table.restaurantId, table.name),
}));

/**
 * Universal unit conversions (apply to all ingredients)
 * e.g., 1 oz = 0.0625 lb, 1 cup = 0.0625 gallon
 */
export const unitConversions = mysqlTable("unitConversions", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull(),
  fromUnit: varchar("fromUnit", { length: 50 }).notNull(), // 'oz'
  toUnit: varchar("toUnit", { length: 50 }).notNull(), // 'lb'
  conversionFactor: decimal("conversionFactor", { precision: 15, scale: 6 }).notNull(), // 0.0625 (1 oz = 0.0625 lb)
  notes: text("notes"), // "Standard weight conversion"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  restaurantIdx: index("restaurant_idx").on(table.restaurantId),
  uniqueConversion: unique("unique_conversion").on(table.restaurantId, table.fromUnit, table.toUnit),
}));

/**
 * Ingredient-specific unit conversions (optional overrides)
 * e.g., 1 green onion piece = 1 oz (varies by ingredient)
 */
export const ingredientConversions = mysqlTable("ingredientConversions", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull(),
  ingredientId: int("ingredientId").notNull(), // references ingredients.id
  fromUnit: varchar("fromUnit", { length: 50 }).notNull(), // 'piece'
  toUnit: varchar("toUnit", { length: 50 }).notNull(), // 'oz'
  conversionFactor: decimal("conversionFactor", { precision: 15, scale: 6 }).notNull(), // 6.0 (1 piece = 6 oz)
  notes: text("notes"), // "Based on 6oz portions"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  restaurantIdx: index("restaurant_idx").on(table.restaurantId),
  ingredientIdx: index("ingredient_idx").on(table.ingredientId),
  uniqueConversionPerIngredient: unique("unique_conversion_per_ingredient").on(table.restaurantId, table.ingredientId, table.fromUnit, table.toUnit),
}));

/**
 * Import History Table
 * 
 * Tracks all CSV imports with metadata for audit trail and rollback capability.
 * Stores snapshots of data before import to enable rollback functionality.
 */
export const importHistory = mysqlTable("import_history", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull(), // references restaurants.id
  userId: varchar("userId", { length: 255 }).notNull(), // references users.openId (who performed the import)
  
  // Import metadata
  importType: mysqlEnum("importType", ["ingredients", "recipes", "recipeIngredients"]).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  
  // Import statistics
  recordsCreated: int("recordsCreated").default(0).notNull(),
  recordsUpdated: int("recordsUpdated").default(0).notNull(),
  totalRecords: int("totalRecords").default(0).notNull(),
  
  // Rollback data (JSON snapshot of affected records before import)
  // For creates: stores the IDs that were created (to delete on rollback)
  // For updates: stores the previous values (to restore on rollback)
  snapshotData: json("snapshotData").$type<{
    created?: number[]; // IDs of created records
    updated?: Array<{ // Previous values of updated records
      id: number;
      data: Record<string, any>;
    }>;
  }>(),
  
  // Status tracking
  status: mysqlEnum("status", ["completed", "rolled_back"]).default("completed").notNull(),
  rolledBackAt: timestamp("rolledBackAt"),
  rolledBackBy: varchar("rolledBackBy", { length: 255 }), // references users.openId
  
  // Optional metadata
  fileName: varchar("fileName", { length: 255 }),
  notes: text("notes"),
}, (table) => ({
  restaurantIdx: index("restaurant_idx").on(table.restaurantId),
  userIdx: index("user_idx").on(table.userId),
  timestampIdx: index("timestamp_idx").on(table.timestamp),
  statusIdx: index("status_idx").on(table.status),
}));

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = typeof restaurants.$inferInsert;

export type Location = typeof locations.$inferSelect;
export type InsertLocation = typeof locations.$inferInsert;

export type SalesData = typeof salesData.$inferSelect;
export type InsertSalesData = typeof salesData.$inferInsert;

export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = typeof recipes.$inferInsert;

export type Ingredient = typeof ingredients.$inferSelect;
export type InsertIngredient = typeof ingredients.$inferInsert;

export type WeatherData = typeof weatherData.$inferSelect;
export type InsertWeatherData = typeof weatherData.$inferInsert;

export type Forecast = typeof forecasts.$inferSelect;
export type InsertForecast = typeof forecasts.$inferInsert;

export type PrepPlan = typeof prepPlans.$inferSelect;
export type InsertPrepPlan = typeof prepPlans.$inferInsert;

export type Report = typeof reports.$inferSelect;

export type UnitCategory = typeof unitCategories.$inferSelect;
export type InsertUnitCategory = typeof unitCategories.$inferInsert;

export type IngredientConversion = typeof ingredientConversions.$inferSelect;
export type InsertIngredientConversion = typeof ingredientConversions.$inferInsert;
export type InsertReport = typeof reports.$inferInsert;

export type RecipeCategory = typeof recipeCategories.$inferSelect;
export type InsertRecipeCategory = typeof recipeCategories.$inferInsert;

export type IngredientUnit = typeof ingredientUnits.$inferSelect;
export type InsertIngredientUnit = typeof ingredientUnits.$inferInsert;

export type ImportHistory = typeof importHistory.$inferSelect;
export type InsertImportHistory = typeof importHistory.$inferInsert;
