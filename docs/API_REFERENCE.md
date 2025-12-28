# API Reference

**Chef's Kiss - Restaurant Resource Planning Platform**

**Last Updated:** December 28, 2024  
**Version:** 0.1.0 (MVP)

---

## Table of Contents

1. [Overview](#overview)
2. [tRPC Endpoints](#trpc-endpoints)
3. [Database Schema](#database-schema)
4. [External Integrations](#external-integrations)
5. [Error Codes](#error-codes)
6. [Rate Limits](#rate-limits)

---

## Overview

Chef's Kiss uses **tRPC** for end-to-end type-safe APIs. All endpoints are automatically typed on both client and server, eliminating the need for manual API contracts.

**Base URL:** `/api/trpc`

**Authentication:** Session-based via HTTP-only cookies (Manus OAuth)

**Content Type:** `application/json`

---

## tRPC Endpoints

### Authentication

#### `auth.me`

Get current authenticated user.

**Type:** Query  
**Auth:** Public (returns null if not authenticated)

**Input:** None

**Output:**
```typescript
{
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  role: "admin" | "user";
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
} | null
```

**Example:**
```typescript
const { data: user } = trpc.auth.me.useQuery();
console.log(user?.name); // "John Doe"
```

---

#### `auth.logout`

Logout current user.

**Type:** Mutation  
**Auth:** Public

**Input:** None

**Output:**
```typescript
{
  success: boolean;
}
```

**Example:**
```typescript
const logout = trpc.auth.logout.useMutation();
logout.mutate();
```

---

### Recipes

#### `recipes.list`

Get all recipes with ingredients for current user's restaurant.

**Type:** Query  
**Auth:** Protected

**Input:** None

**Output:**
```typescript
Array<{
  recipe: {
    id: number;
    restaurantId: number;
    name: string;
    category: string;
    description: string | null;
    servings: number;
    prepTime: number | null;
    cookTime: number | null;
    sellingPrice: string; // decimal as string
    createdAt: Date;
    updatedAt: Date;
  };
  ingredient: {
    id: number;
    restaurantId: number;
    name: string;
    category: string;
    unit: string;
    costPerUnit: string | null; // decimal as string
    supplier: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  quantity: string | null; // decimal as string
  unit: string | null;
}>
```

**Example:**
```typescript
const { data: recipes } = trpc.recipes.list.useQuery();
recipes?.forEach(r => {
  console.log(r.recipe.name, r.ingredient?.name, r.quantity);
});
```

---

#### `recipes.create`

Create a new recipe with ingredients.

**Type:** Mutation  
**Auth:** Protected

**Input:**
```typescript
{
  name: string;              // 1-255 chars
  category: string;          // 1-100 chars
  description?: string;      // optional
  servings: number;          // positive integer
  prepTime?: number;         // minutes, optional
  cookTime?: number;         // minutes, optional
  sellingPrice: number;      // positive decimal
  ingredients: Array<{
    ingredientId: number;    // positive integer
    quantity: number;        // positive decimal
    unit: string;            // 1-50 chars
  }>;
}
```

**Output:**
```typescript
{
  success: boolean;
  recipeId: number;
}
```

**Example:**
```typescript
const createRecipe = trpc.recipes.create.useMutation();

createRecipe.mutate({
  name: "California Roll",
  category: "Rolls",
  servings: 8,
  sellingPrice: 12.00,
  ingredients: [
    { ingredientId: 1, quantity: 0.5, unit: "lb" },
    { ingredientId: 2, quantity: 1, unit: "sheet" },
  ],
});
```

**Errors:**
- `BAD_REQUEST` - Invalid input (validation error)
- `UNAUTHORIZED` - Not authenticated
- `INTERNAL_SERVER_ERROR` - Database error

---

### Ingredients

#### `ingredients.list`

Get all ingredients for current user's restaurant.

**Type:** Query  
**Auth:** Protected

**Input:** None

**Output:**
```typescript
Array<{
  id: number;
  restaurantId: number;
  name: string;
  category: string;
  unit: string;
  costPerUnit: string | null; // decimal as string
  supplier: string | null;
  createdAt: Date;
  updatedAt: Date;
}>
```

**Example:**
```typescript
const { data: ingredients } = trpc.ingredients.list.useQuery();
ingredients?.forEach(i => {
  console.log(i.name, i.category, i.unit);
});
```

---

### Restaurant

#### `restaurant.get`

Get current user's restaurant information.

**Type:** Query  
**Auth:** Protected

**Input:** None

**Output:**
```typescript
{
  id: number;
  ownerId: number;
  name: string;
  businessType: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  createdAt: Date;
  updatedAt: Date;
} | null
```

**Example:**
```typescript
const { data: restaurant } = trpc.restaurant.get.useQuery();
console.log(restaurant?.name); // "Sushi Confidential"
```

---

### System

#### `system.notifyOwner`

Send notification to platform owner (for operational alerts).

**Type:** Mutation  
**Auth:** Protected

**Input:**
```typescript
{
  title: string;
  content: string;
}
```

**Output:**
```typescript
{
  success: boolean;
}
```

**Example:**
```typescript
const notify = trpc.system.notifyOwner.useMutation();

notify.mutate({
  title: "New User Signup",
  content: "User john@example.com signed up",
});
```

---

## Database Schema

### Core Tables

#### `users`

User accounts and authentication.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | User ID |
| `openId` | VARCHAR(64) | UNIQUE, NOT NULL | Manus OAuth ID |
| `name` | TEXT | NULL | Full name |
| `email` | VARCHAR(320) | NULL | Email address |
| `loginMethod` | VARCHAR(64) | NULL | Login method (e.g., "manus") |
| `role` | ENUM | NOT NULL, DEFAULT 'user' | User role (admin, user) |
| `createdAt` | TIMESTAMP | NOT NULL | Account creation time |
| `updatedAt` | TIMESTAMP | NOT NULL | Last update time |
| `lastSignedIn` | TIMESTAMP | NOT NULL | Last login time |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE (`openId`)

---

#### `restaurants`

Restaurant/business information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Restaurant ID |
| `ownerId` | INT | FK → users.id, NOT NULL | Owner user ID |
| `name` | VARCHAR(255) | NOT NULL | Restaurant name |
| `businessType` | VARCHAR(100) | NULL | Type of restaurant |
| `address` | TEXT | NULL | Street address |
| `city` | VARCHAR(100) | NULL | City |
| `state` | VARCHAR(50) | NULL | State/province |
| `zipCode` | VARCHAR(20) | NULL | Postal code |
| `phone` | VARCHAR(20) | NULL | Phone number |
| `email` | VARCHAR(320) | NULL | Contact email |
| `website` | VARCHAR(255) | NULL | Website URL |
| `createdAt` | TIMESTAMP | NOT NULL | Creation time |
| `updatedAt` | TIMESTAMP | NOT NULL | Last update time |

**Relationships:**
- `ownerId` → `users.id`

---

#### `locations`

Physical restaurant locations (multi-location support).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Location ID |
| `restaurantId` | INT | FK → restaurants.id, NOT NULL | Restaurant ID |
| `name` | VARCHAR(255) | NOT NULL | Location name |
| `address` | TEXT | NULL | Street address |
| `city` | VARCHAR(100) | NULL | City |
| `state` | VARCHAR(50) | NULL | State/province |
| `zipCode` | VARCHAR(20) | NULL | Postal code |
| `latitude` | DECIMAL(10,8) | NULL | GPS latitude |
| `longitude` | DECIMAL(11,8) | NULL | GPS longitude |
| `timezone` | VARCHAR(50) | NULL | Timezone (e.g., "America/Los_Angeles") |
| `isActive` | BOOLEAN | NOT NULL, DEFAULT true | Active status |
| `createdAt` | TIMESTAMP | NOT NULL | Creation time |
| `updatedAt` | TIMESTAMP | NOT NULL | Last update time |

**Relationships:**
- `restaurantId` → `restaurants.id`

---

### Sales & POS Tables

#### `pos_integrations`

POS system integrations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Integration ID |
| `restaurantId` | INT | FK → restaurants.id, NOT NULL | Restaurant ID |
| `posSystem` | VARCHAR(100) | NOT NULL | POS system name (Toast, Square, etc.) |
| `apiKey` | TEXT | NULL | Encrypted API key |
| `apiSecret` | TEXT | NULL | Encrypted API secret |
| `locationId` | VARCHAR(255) | NULL | POS location ID |
| `isActive` | BOOLEAN | NOT NULL, DEFAULT true | Active status |
| `lastSyncAt` | TIMESTAMP | NULL | Last sync time |
| `createdAt` | TIMESTAMP | NOT NULL | Creation time |
| `updatedAt` | TIMESTAMP | NOT NULL | Last update time |

**Relationships:**
- `restaurantId` → `restaurants.id`

---

#### `sales_data`

Daily aggregated sales data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Sales record ID |
| `locationId` | INT | FK → locations.id, NOT NULL | Location ID |
| `date` | DATE | NOT NULL | Sales date |
| `totalSales` | DECIMAL(10,2) | NOT NULL | Total sales amount |
| `transactionCount` | INT | NOT NULL | Number of transactions |
| `customerCount` | INT | NULL | Number of customers |
| `averageTicket` | DECIMAL(10,2) | NULL | Average transaction amount |
| `createdAt` | TIMESTAMP | NOT NULL | Creation time |
| `updatedAt` | TIMESTAMP | NOT NULL | Last update time |

**Relationships:**
- `locationId` → `locations.id`

**Planned Indexes:**
```sql
CREATE INDEX idx_sales_date ON sales_data(date, location_id);
```

---

#### `item_sales`

Item-level sales data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Item sales ID |
| `salesDataId` | INT | FK → sales_data.id, NOT NULL | Sales record ID |
| `itemName` | VARCHAR(255) | NOT NULL | Item name |
| `category` | VARCHAR(100) | NULL | Item category |
| `quantity` | INT | NOT NULL | Quantity sold |
| `revenue` | DECIMAL(10,2) | NOT NULL | Revenue from item |
| `createdAt` | TIMESTAMP | NOT NULL | Creation time |

**Relationships:**
- `salesDataId` → `sales_data.id`

---

### Recipe Management Tables

#### `recipes`

Menu items and recipes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Recipe ID |
| `restaurantId` | INT | FK → restaurants.id, NOT NULL | Restaurant ID |
| `name` | VARCHAR(255) | NOT NULL | Recipe name |
| `category` | VARCHAR(100) | NOT NULL | Category (e.g., "Rolls") |
| `description` | TEXT | NULL | Recipe description |
| `servings` | INT | NOT NULL | Number of servings |
| `prepTime` | INT | NULL | Prep time (minutes) |
| `cookTime` | INT | NULL | Cook time (minutes) |
| `sellingPrice` | DECIMAL(10,2) | NOT NULL | Selling price |
| `createdAt` | TIMESTAMP | NOT NULL | Creation time |
| `updatedAt` | TIMESTAMP | NOT NULL | Last update time |

**Relationships:**
- `restaurantId` → `restaurants.id`

---

#### `ingredients`

Ingredient inventory.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Ingredient ID |
| `restaurantId` | INT | FK → restaurants.id, NOT NULL | Restaurant ID |
| `name` | VARCHAR(255) | NOT NULL | Ingredient name |
| `category` | VARCHAR(100) | NOT NULL | Category (e.g., "Produce") |
| `unit` | VARCHAR(50) | NOT NULL | Unit of measure |
| `costPerUnit` | DECIMAL(10,2) | NULL | Cost per unit |
| `supplier` | VARCHAR(255) | NULL | Supplier name |
| `createdAt` | TIMESTAMP | NOT NULL | Creation time |
| `updatedAt` | TIMESTAMP | NOT NULL | Last update time |

**Relationships:**
- `restaurantId` → `restaurants.id`

---

#### `recipe_ingredients`

Junction table linking recipes to ingredients.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Link ID |
| `recipeId` | INT | FK → recipes.id, NOT NULL | Recipe ID |
| `ingredientId` | INT | FK → ingredients.id, NOT NULL | Ingredient ID |
| `quantity` | DECIMAL(10,2) | NOT NULL | Quantity needed |
| `unit` | VARCHAR(50) | NOT NULL | Unit of measure |
| `createdAt` | TIMESTAMP | NOT NULL | Creation time |

**Relationships:**
- `recipeId` → `recipes.id`
- `ingredientId` → `ingredients.id`

---

### External Data Tables

#### `weather_data`

Historical and forecast weather data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Weather record ID |
| `locationId` | INT | FK → locations.id, NOT NULL | Location ID |
| `date` | DATE | NOT NULL | Weather date |
| `tempMin` | DECIMAL(5,2) | NULL | Min temperature (°F) |
| `tempMax` | DECIMAL(5,2) | NULL | Max temperature (°F) |
| `tempAvg` | DECIMAL(5,2) | NULL | Avg temperature (°F) |
| `precipitation` | DECIMAL(5,2) | NULL | Precipitation (inches) |
| `conditions` | VARCHAR(100) | NULL | Weather conditions |
| `windSpeed` | DECIMAL(5,2) | NULL | Wind speed (mph) |
| `humidity` | INT | NULL | Humidity (%) |
| `isForecast` | BOOLEAN | NOT NULL, DEFAULT false | Is forecast data |
| `createdAt` | TIMESTAMP | NOT NULL | Creation time |
| `updatedAt` | TIMESTAMP | NOT NULL | Last update time |

**Relationships:**
- `locationId` → `locations.id`

---

#### `events`

Local events that may impact sales.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Event ID |
| `locationId` | INT | FK → locations.id, NOT NULL | Location ID |
| `name` | VARCHAR(255) | NOT NULL | Event name |
| `category` | VARCHAR(100) | NULL | Event category |
| `startDate` | DATE | NOT NULL | Start date |
| `endDate` | DATE | NULL | End date |
| `impact` | ENUM | NULL | Expected impact (high, medium, low) |
| `description` | TEXT | NULL | Event description |
| `createdAt` | TIMESTAMP | NOT NULL | Creation time |

**Relationships:**
- `locationId` → `locations.id`

---

### Forecasting & Planning Tables

#### `forecasts`

AI-powered sales forecasts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Forecast ID |
| `locationId` | INT | FK → locations.id, NOT NULL | Location ID |
| `forecastDate` | DATE | NOT NULL | Date being forecasted |
| `predictedSales` | DECIMAL(10,2) | NOT NULL | Predicted sales amount |
| `confidence` | DECIMAL(5,2) | NULL | Confidence score (0-100) |
| `weatherFactor` | DECIMAL(5,2) | NULL | Weather impact factor |
| `eventFactor` | DECIMAL(5,2) | NULL | Event impact factor |
| `aiInsights` | TEXT | NULL | AI-generated insights |
| `createdAt` | TIMESTAMP | NOT NULL | Creation time |

**Relationships:**
- `locationId` → `locations.id`

---

#### `prep_plans`

Daily prep planning schedules.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Prep plan ID |
| `locationId` | INT | FK → locations.id, NOT NULL | Location ID |
| `planDate` | DATE | NOT NULL | Date for prep |
| `forecastId` | INT | FK → forecasts.id, NULL | Associated forecast |
| `status` | ENUM | NOT NULL, DEFAULT 'draft' | Status (draft, approved, completed) |
| `notes` | TEXT | NULL | Prep notes |
| `createdAt` | TIMESTAMP | NOT NULL | Creation time |
| `updatedAt` | TIMESTAMP | NOT NULL | Last update time |

**Relationships:**
- `locationId` → `locations.id`
- `forecastId` → `forecasts.id`

---

#### `prep_plan_items`

Individual ingredient quantities for prep plans.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Prep item ID |
| `prepPlanId` | INT | FK → prep_plans.id, NOT NULL | Prep plan ID |
| `ingredientId` | INT | FK → ingredients.id, NOT NULL | Ingredient ID |
| `quantity` | DECIMAL(10,2) | NOT NULL | Quantity to prep |
| `unit` | VARCHAR(50) | NOT NULL | Unit of measure |
| `priority` | ENUM | NULL | Priority (high, medium, low) |
| `completed` | BOOLEAN | NOT NULL, DEFAULT false | Completion status |
| `createdAt` | TIMESTAMP | NOT NULL | Creation time |

**Relationships:**
- `prepPlanId` → `prep_plans.id`
- `ingredientId` → `ingredients.id`

---

#### `reports`

Generated PDF reports.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Report ID |
| `restaurantId` | INT | FK → restaurants.id, NOT NULL | Restaurant ID |
| `reportType` | VARCHAR(100) | NOT NULL | Report type |
| `title` | VARCHAR(255) | NOT NULL | Report title |
| `startDate` | DATE | NULL | Report period start |
| `endDate` | DATE | NULL | Report period end |
| `fileUrl` | VARCHAR(500) | NULL | S3 URL to PDF |
| `generatedBy` | INT | FK → users.id, NULL | User who generated |
| `createdAt` | TIMESTAMP | NOT NULL | Creation time |

**Relationships:**
- `restaurantId` → `restaurants.id`
- `generatedBy` → `users.id`

---

## External Integrations

### Manus Platform Services

**LLM Service:**
- Endpoint: `BUILT_IN_FORGE_API_URL`
- Authentication: Bearer token (`BUILT_IN_FORGE_API_KEY`)
- Model: GPT-4 Turbo
- Usage: AI insights, recommendations

**S3 Storage:**
- Endpoint: Configured via `storage.ts`
- Authentication: Automatic
- Usage: File uploads, PDF reports

**OAuth:**
- Endpoint: `OAUTH_SERVER_URL`
- Flow: Authorization Code with PKCE
- Session: HTTP-only cookies

### OpenWeather API (Planned)

**Base URL:** `https://api.openweathermap.org/data/2.5`

**Endpoints:**
- Historical: `/onecall/timemachine`
- Forecast: `/forecast`

**Authentication:** API key in query parameter

**Rate Limits:** 1,000 calls/day (free tier)

---

## Error Codes

### tRPC Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `BAD_REQUEST` | 400 | Invalid input or validation error |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `TIMEOUT` | 408 | Request timeout |
| `CONFLICT` | 409 | Resource conflict (e.g., duplicate) |
| `PRECONDITION_FAILED` | 412 | Precondition not met |
| `PAYLOAD_TOO_LARGE` | 413 | Request payload too large |
| `TOO_MANY_REQUESTS` | 429 | Rate limit exceeded |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

### Error Response Format

```typescript
{
  error: {
    code: string;
    message: string;
    data?: {
      zodError?: ZodError; // For validation errors
      // ... other error-specific data
    };
  };
}
```

**Example:**
```typescript
{
  error: {
    code: "BAD_REQUEST",
    message: "Invalid input",
    data: {
      zodError: {
        issues: [
          {
            path: ["name"],
            message: "Name is required"
          }
        ]
      }
    }
  }
}
```

---

## Rate Limits

**Current:** No rate limits (MVP)

**Planned (Phase 2):**
- 100 requests/minute per user
- 1,000 requests/hour per user
- 10,000 requests/day per user

**Expensive Operations (Future):**
- Forecast generation: 10/hour
- Report generation: 5/hour
- CSV import: 5/hour

---

## Appendix: Type Definitions

### Common Types

```typescript
// User role
type UserRole = "admin" | "user";

// Prep plan status
type PrepPlanStatus = "draft" | "approved" | "completed";

// Event impact
type EventImpact = "high" | "medium" | "low";

// Priority
type Priority = "high" | "medium" | "low";

// Report type
type ReportType = "operational" | "financial" | "forecast" | "custom";
```

### Database Types (Generated by Drizzle)

```typescript
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { users, recipes, ingredients } from "./schema";

// Select types (reading from DB)
export type User = InferSelectModel<typeof users>;
export type Recipe = InferSelectModel<typeof recipes>;
export type Ingredient = InferSelectModel<typeof ingredients>;

// Insert types (writing to DB)
export type InsertUser = InferInsertModel<typeof users>;
export type InsertRecipe = InferInsertModel<typeof recipes>;
export type InsertIngredient = InferInsertModel<typeof ingredients>;
```

---

**Document Maintenance:**
- Update this document when adding new endpoints
- Keep database schema in sync with actual schema.ts
- Document all external API integrations
- Add examples for new endpoints

**Last Reviewed:** December 28, 2024  
**Next Review:** March 28, 2025
