# Development Guide

**Chef's Kiss - Restaurant Resource Planning Platform**

**Last Updated:** December 28, 2024  
**Version:** 0.1.0 (MVP)

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Coding Standards](#coding-standards)
4. [Testing Requirements](#testing-requirements)
5. [Git Workflow](#git-workflow)
6. [Database Development](#database-development)
7. [API Development](#api-development)
8. [Frontend Development](#frontend-development)
9. [Common Patterns](#common-patterns)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

**Required Software:**
- Node.js 22.x or later
- pnpm 10.x (package manager)
- Git 2.x
- MySQL 8.x (for local development) or access to Manus platform

**Optional Software:**
- VS Code (recommended IDE)
- MySQL Workbench (database GUI)
- Postman (API testing)

### Initial Setup

**1. Clone Repository:**
```bash
git clone https://github.com/rstamps01/chefs-kiss.git
cd chefs-kiss
```

**2. Install Dependencies:**
```bash
pnpm install
```

**3. Configure Environment:**

If developing locally (not on Manus platform):
```bash
cp .env.example .env
# Edit .env with your database URL and API keys
```

If developing on Manus platform:
- All environment variables are automatically provided
- No manual configuration needed

**4. Initialize Database:**
```bash
# Push schema to database
pnpm db:push

# Seed with sample data (optional)
pnpm tsx seed-database.ts
```

**5. Start Development Server:**
```bash
pnpm dev
```

Visit `http://localhost:3000` to see the application.

### Project Structure

```
chefs-kiss/
├── client/                 # Frontend React application
│   ├── public/             # Static assets
│   └── src/
│       ├── _core/          # Core utilities (don't modify)
│       ├── components/     # React components
│       ├── pages/          # Page components
│       ├── hooks/          # Custom hooks
│       ├── contexts/       # React contexts
│       ├── lib/            # Client libraries
│       ├── App.tsx         # Main app component
│       ├── main.tsx        # Entry point
│       └── index.css       # Global styles
├── server/                 # Backend Express + tRPC
│   ├── _core/              # Core infrastructure (don't modify)
│   ├── db.ts               # Database queries
│   ├── routers.ts          # tRPC API endpoints
│   └── *.ts                # Service modules (forecasting, weather, etc.)
├── drizzle/                # Database schema and migrations
│   ├── schema.ts           # Database schema
│   └── *.sql               # Migration files
├── docs/                   # Documentation
├── shared/                 # Shared types and constants
├── todo.md                 # Task tracking
└── package.json            # Dependencies and scripts
```

---

## Development Workflow

### Daily Workflow

**1. Start Your Day:**
```bash
# Pull latest changes
git pull origin main

# Check for dependency updates
pnpm install

# Start dev server
pnpm dev
```

**2. Check Current Status:**
- Read latest `docs/HANDOFF_*.md` file
- Review `todo.md` for current tasks
- Check `docs/FEATURE_STATUS.md` for implementation status

**3. Create Feature Branch:**
```bash
git checkout -b feature/your-feature-name
```

**4. Develop:**
- Write code following coding standards (see below)
- Test manually in browser
- Write tests for new features
- Update documentation as you go

**5. Commit Frequently:**
```bash
git add .
git commit -m "feat: descriptive commit message"
```

**6. End Your Day:**
- Run tests: `pnpm test`
- Check TypeScript: `pnpm check`
- Update `todo.md` with progress
- Create handoff document (see HANDOFF_TEMPLATE.md)
- Push to GitHub: `git push origin feature/your-feature-name`

### Feature Development Process

**1. Design Phase:**
- Review requirements in PRD or feature request
- Design database schema changes (if needed)
- Design API endpoints (tRPC procedures)
- Design UI components
- Document decisions in DECISION_LOG.md

**2. Implementation Phase:**
- **Database First:** Update `drizzle/schema.ts`, run `pnpm db:push`
- **Backend Second:** Add queries to `server/db.ts`, add procedures to `server/routers.ts`
- **Frontend Third:** Create page components, connect to tRPC
- **Test Fourth:** Write vitest tests, manual testing

**3. Review Phase:**
- Self-review code for quality
- Run all tests
- Test in browser
- Update documentation

**4. Merge Phase:**
- Create pull request (or merge directly if solo)
- Update FEATURE_STATUS.md
- Create Manus checkpoint (if on platform)
- Merge to main branch

### POS Integration Workflow

**Priority Order:**
1. **Heartland POS / Global Payments REST API** (First implementation)
2. Toast POS
3. Square
4. Clover
5. Generic CSV import (universal fallback)

**Heartland Integration Steps:**

**1. Setup & Authentication:**
- Install SDK: `pnpm add @globalpayments/api`
- Request sandbox credentials from Heartland (merchant account required)
- Store credentials in environment variables:
  - `HEARTLAND_API_KEY` or `HEARTLAND_PUBLIC_KEY` + `HEARTLAND_SECRET_KEY`
  - `HEARTLAND_API_URL` (sandbox vs production)
- Implement OAuth 2.0 flow if using OAuth (alternative to API key)

**2. Database Preparation:**
- Ensure `pos_integrations` table has Heartland-specific fields
- Add `rawData` JSONB column to `sales_data` for storing original transaction data
- Create migration if schema changes needed

**3. Adapter Implementation:**
- Create `server/adapters/heartland.ts` with:
  - `HeartlandAdapter` class implementing `POSAdapter` interface
  - `authenticate()` - Validate credentials
  - `fetchTransactions(startDate, endDate)` - Retrieve sales data
  - `normalizeTransaction(rawData)` - Convert to Chef's Kiss schema
  - `syncSalesData(locationId)` - Full sync workflow

**4. API Integration:**
- Use Global Payments SDK to call:
  - `/transactions` endpoint for sales data
  - `/reports` endpoint for daily summaries
  - `/batches` endpoint for settlement data
- Handle pagination (transactions may span multiple pages)
- Implement error handling and retry logic
- Log all API calls for debugging

**5. Data Normalization:**
- Map Heartland transaction fields to Chef's Kiss schema:
  - `transaction_date` → `sales_data.date` (convert to UTC)
  - `amount` → `sales_data.totalSales`
  - `line_items[]` → `item_sales` table
  - `guest_count` → `sales_data.customerCount`
- Store original JSON in `sales_data.rawData` for future re-processing
- Handle timezone conversions (POS local time → UTC)

**6. Incremental Sync:**
- Track last sync timestamp in `pos_integrations.lastSyncAt`
- Fetch only transactions after `lastSyncAt`
- Update `lastSyncAt` after successful sync
- Handle overlapping date ranges to avoid gaps

**7. Testing:**
- Unit tests for adapter methods
- Integration tests with sandbox API
- Test error scenarios (auth failure, network timeout, invalid data)
- Test timezone edge cases (midnight transactions)

**8. UI Integration:**
- Add "Connect Heartland POS" button in settings
- Credential input form (API key or OAuth flow)
- Sync status display (last sync time, next sync scheduled)
- Manual sync trigger button
- Transaction log viewer

**CSV Import Workflow (Universal Fallback):**

**1. Upload Interface:**
- File upload component (accept `.csv` only)
- Preview first 10 rows after upload
- Detect CSV delimiter and encoding

**2. Field Mapping:**
- Display CSV columns
- Dropdown to map each column to Chef's Kiss field:
  - Date (required)
  - Total Sales (required)
  - Item Name (optional)
  - Item Quantity (optional)
  - Customer Count (optional)
- Save mapping template for future uploads

**3. Validation:**
- Check required fields are mapped
- Validate data types (date format, numeric values)
- Show validation errors with row numbers
- Allow user to fix and re-upload

**4. Import:**
- Parse CSV with mapped fields
- Normalize data to Chef's Kiss schema
- Insert into `sales_data` and `item_sales` tables
- Show progress bar for large files
- Display summary (X rows imported, Y errors)

**5. Error Handling:**
- Skip invalid rows, log errors
- Allow partial import (import valid rows, report invalid ones)
- Provide downloadable error report CSV

---

## Coding Standards

### TypeScript Standards

**1. Strict Type Safety:**
```typescript
// ✅ Good: Explicit types
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ Bad: Implicit any
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

**2. No `any` Types:**
```typescript
// ✅ Good: Proper typing
function processData(data: unknown): ProcessedData {
  if (isValidData(data)) {
    return transformData(data);
  }
  throw new Error('Invalid data');
}

// ❌ Bad: Using any
function processData(data: any): any {
  return transformData(data);
}
```

**3. Use Type Inference:**
```typescript
// ✅ Good: Let TypeScript infer
const recipes = await getRecipes(); // Type inferred from getRecipes()

// ❌ Unnecessary: Redundant type annotation
const recipes: Recipe[] = await getRecipes();
```

**4. Prefer Interfaces for Objects:**
```typescript
// ✅ Good: Interface for object shape
interface Recipe {
  id: number;
  name: string;
  ingredients: Ingredient[];
}

// ❌ Bad: Type alias for simple object (use for unions/intersections)
type Recipe = {
  id: number;
  name: string;
};
```

### Naming Conventions

**Files:**
- React components: `PascalCase.tsx` (e.g., `RecipeCard.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatCurrency.ts`)
- Pages: `PascalCase.tsx` (e.g., `Analytics.tsx`)
- Tests: `*.test.ts` (e.g., `auth.logout.test.ts`)

**Variables:**
- `camelCase` for variables and functions
- `PascalCase` for React components and classes
- `SCREAMING_SNAKE_CASE` for constants
- `_privateMethod` for private methods (by convention)

**Examples:**
```typescript
// Variables
const totalSales = 1000;
const userName = "John";

// Constants
const MAX_RETRIES = 3;
const API_ENDPOINT = "https://api.example.com";

// Functions
function calculateForecast() { }
function getUserById() { }

// React Components
function RecipeCard() { }
function DashboardLayout() { }

// Classes
class ForecastingEngine { }
```

### Code Organization

**1. Import Order:**
```typescript
// 1. External libraries
import { useState, useEffect } from 'react';
import { z } from 'zod';

// 2. Internal utilities
import { trpc } from '@/lib/trpc';
import { formatCurrency } from '@/utils/format';

// 3. Components
import { Button } from '@/components/ui/button';
import { RecipeCard } from '@/components/RecipeCard';

// 4. Types
import type { Recipe } from '@/types';

// 5. Styles (if any)
import './styles.css';
```

**2. Component Structure:**
```typescript
// 1. Imports
import { useState } from 'react';
import { trpc } from '@/lib/trpc';

// 2. Types/Interfaces
interface RecipeListProps {
  restaurantId: number;
}

// 3. Component
export function RecipeList({ restaurantId }: RecipeListProps) {
  // 3a. Hooks
  const [filter, setFilter] = useState('');
  const { data: recipes, isLoading } = trpc.recipes.list.useQuery();
  
  // 3b. Derived state
  const filteredRecipes = recipes?.filter(r => r.name.includes(filter));
  
  // 3c. Event handlers
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };
  
  // 3d. Render
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div>
      <input value={filter} onChange={handleFilterChange} />
      {filteredRecipes?.map(recipe => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}
```

**3. File Size Limits:**
- Components: < 300 lines
- Utility modules: < 200 lines
- If larger, split into multiple files

### Code Style

**1. Use Descriptive Names:**
```typescript
// ✅ Good: Clear intent
function generateWeeklyForecast(startDate: Date, historicalData: SalesData[]) { }

// ❌ Bad: Unclear
function gen(d: Date, data: any[]) { }
```

**2. Avoid Magic Numbers:**
```typescript
// ✅ Good: Named constant
const DAYS_IN_FORECAST = 7;
const forecast = generateForecast(DAYS_IN_FORECAST);

// ❌ Bad: Magic number
const forecast = generateForecast(7);
```

**3. Use Early Returns:**
```typescript
// ✅ Good: Early return
function processRecipe(recipe: Recipe | null) {
  if (!recipe) return null;
  if (!recipe.ingredients.length) return null;
  
  return calculateCost(recipe);
}

// ❌ Bad: Nested conditions
function processRecipe(recipe: Recipe | null) {
  if (recipe) {
    if (recipe.ingredients.length) {
      return calculateCost(recipe);
    }
  }
  return null;
}
```

**4. Prefer Functional Programming:**
```typescript
// ✅ Good: Functional approach
const totalCost = ingredients
  .filter(i => i.isActive)
  .map(i => i.price * i.quantity)
  .reduce((sum, cost) => sum + cost, 0);

// ❌ Bad: Imperative approach
let totalCost = 0;
for (let i = 0; i < ingredients.length; i++) {
  if (ingredients[i].isActive) {
    totalCost += ingredients[i].price * ingredients[i].quantity;
  }
}
```

---

## Testing Requirements

### Test Strategy

**Unit Tests:**
- All database queries in `server/db.ts`
- All tRPC procedures in `server/routers.ts`
- Complex business logic functions
- Utility functions

**Integration Tests:**
- API endpoint flows (create recipe → fetch recipe)
- Database operations with relationships

**Manual Tests:**
- UI interactions
- Form validation
- Error states
- Loading states

### Writing Tests

**Location:** `server/*.test.ts`

**Example Test:**
```typescript
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("recipes.create", () => {
  it("creates a recipe with ingredients", async () => {
    // Arrange
    const ctx: TrpcContext = {
      user: {
        id: 1,
        openId: "test-user",
        role: "user",
        // ... other fields
      },
      req: {} as any,
      res: {} as any,
    };
    
    const caller = appRouter.createCaller(ctx);
    
    const input = {
      name: "Test Recipe",
      category: "Rolls",
      servings: 8,
      sellingPrice: 12.00,
      ingredients: [
        { ingredientId: 1, quantity: 0.5, unit: "lb" },
      ],
    };
    
    // Act
    const result = await caller.recipes.create(input);
    
    // Assert
    expect(result.success).toBe(true);
    expect(result.recipeId).toBeGreaterThan(0);
  });
});
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test server/recipes.test.ts

# Run with coverage
pnpm test --coverage
```

### Test Coverage Goals

**MVP (Current):**
- Core authentication flows: 100%
- Critical business logic: 80%+
- Database queries: 50%+

**Phase 2:**
- All business logic: 90%+
- All database queries: 80%+
- API endpoints: 90%+

---

## Git Workflow

### Branch Strategy

**Main Branch:**
- `main` - Production-ready code
- Always deployable
- Protected (no direct commits in team environment)

**Feature Branches:**
- `feature/feature-name` - New features
- `fix/bug-name` - Bug fixes
- `docs/doc-name` - Documentation updates
- `refactor/refactor-name` - Code refactoring

**Example:**
```bash
git checkout -b feature/pos-csv-import
# ... develop feature ...
git push origin feature/pos-csv-import
# ... create PR or merge ...
```

### Commit Message Format

**Format:** `type: description`

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, no logic change)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Build process or auxiliary tool changes

**Examples:**
```bash
git commit -m "feat: add CSV import for POS data"
git commit -m "fix: correct forecast calculation for rainy days"
git commit -m "docs: update API reference with new endpoints"
git commit -m "refactor: extract forecast logic into service module"
```

**Multi-line commits:**
```bash
git commit -m "feat: add weather-based sales forecasting

- Integrate OpenWeather API for historical and forecast data
- Implement correlation algorithm between weather and sales
- Add AI-powered insights for forecast explanations
- Update database schema with weather_data table"
```

### Pull Request Process

**1. Create PR:**
- Descriptive title
- List of changes
- Screenshots (if UI changes)
- Link to related issues/tasks

**2. Self-Review:**
- Review your own code first
- Check for console.logs, commented code
- Verify tests pass
- Update documentation

**3. Merge:**
- Squash commits if many small commits
- Update FEATURE_STATUS.md
- Delete feature branch after merge

---

## Database Development

### Schema Changes

**1. Edit Schema:**
```typescript
// drizzle/schema.ts
export const newTable = mysqlTable("new_table", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
```

**2. Generate Migration:**
```bash
pnpm db:push
```

This command:
- Generates migration SQL
- Applies migration to database
- Updates TypeScript types

**3. Commit Migration:**
```bash
git add drizzle/
git commit -m "feat: add new_table for feature X"
```

### Writing Queries

**Location:** `server/db.ts`

**Pattern:**
```typescript
import { eq, and, desc } from "drizzle-orm";
import { recipes, ingredients, recipeIngredients } from "../drizzle/schema";

export async function getRecipeWithIngredients(recipeId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select({
      recipe: recipes,
      ingredient: ingredients,
      quantity: recipeIngredients.quantity,
      unit: recipeIngredients.unit,
    })
    .from(recipes)
    .leftJoin(recipeIngredients, eq(recipes.id, recipeIngredients.recipeId))
    .leftJoin(ingredients, eq(recipeIngredients.ingredientId, ingredients.id))
    .where(eq(recipes.id, recipeId));
  
  return result;
}
```

**Best Practices:**
- Always check if `db` is null (for local tooling)
- Use parameterized queries (Drizzle does this automatically)
- Use transactions for multi-step operations
- Add indexes for frequently queried columns (future)

### Seeding Data

**Location:** `seed-database.ts`

**Pattern:**
```typescript
import { getDb } from "./server/db.js";
import { recipes, ingredients } from "./drizzle/schema.js";

const db = await getDb();

// Insert data
await db.insert(recipes).values([
  { name: "Recipe 1", category: "Category 1", /* ... */ },
  { name: "Recipe 2", category: "Category 2", /* ... */ },
]);
```

**Run Seeding:**
```bash
pnpm tsx seed-database.ts
```

---

## API Development

### Creating tRPC Procedures

**Location:** `server/routers.ts`

**Pattern:**
```typescript
import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from './_core/trpc';
import { getRecipes, createRecipe } from './db';

export const appRouter = router({
  recipes: router({
    // Query (GET)
    list: protectedProcedure
      .query(async ({ ctx }) => {
        return getRecipes(ctx.user.restaurantId);
      }),
    
    // Mutation (POST/PUT/DELETE)
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        category: z.string(),
        servings: z.number().int().positive(),
        sellingPrice: z.number().positive(),
      }))
      .mutation(async ({ input, ctx }) => {
        const recipeId = await createRecipe({
          ...input,
          restaurantId: ctx.user.restaurantId,
        });
        return { success: true, recipeId };
      }),
  }),
});
```

### Input Validation

**Use Zod schemas:**
```typescript
const createRecipeSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  category: z.string().min(1, "Category is required"),
  servings: z.number().int().positive("Servings must be positive"),
  sellingPrice: z.number().positive("Price must be positive"),
  ingredients: z.array(z.object({
    ingredientId: z.number().int().positive(),
    quantity: z.number().positive(),
    unit: z.string().min(1).max(50),
  })).min(1, "At least one ingredient required"),
});
```

### Error Handling

**Use tRPC errors:**
```typescript
import { TRPCError } from '@trpc/server';

if (!recipe) {
  throw new TRPCError({
    code: 'NOT_FOUND',
    message: 'Recipe not found',
  });
}

if (ctx.user.role !== 'admin') {
  throw new TRPCError({
    code: 'FORBIDDEN',
    message: 'Admin access required',
  });
}
```

---

## Frontend Development

### Creating Pages

**Location:** `client/src/pages/`

**Pattern:**
```typescript
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';

export default function RecipesPage() {
  const { user, isAuthenticated } = useAuth();
  const { data: recipes, isLoading } = trpc.recipes.list.useQuery();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Recipes</h1>
      <div className="grid gap-4">
        {recipes?.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
```

### Using tRPC in Components

**Queries:**
```typescript
// Simple query
const { data, isLoading, error } = trpc.recipes.list.useQuery();

// Query with input
const { data } = trpc.recipes.getById.useQuery({ id: 123 });

// Conditional query (only runs when enabled)
const { data } = trpc.recipes.list.useQuery(undefined, {
  enabled: isAuthenticated,
});
```

**Mutations:**
```typescript
const utils = trpc.useUtils();

const createRecipe = trpc.recipes.create.useMutation({
  onSuccess: () => {
    // Invalidate and refetch recipes list
    utils.recipes.list.invalidate();
    toast.success('Recipe created!');
  },
  onError: (error) => {
    toast.error(error.message);
  },
});

// Call mutation
const handleSubmit = (data: RecipeInput) => {
  createRecipe.mutate(data);
};
```

**Optimistic Updates:**
```typescript
const deleteRecipe = trpc.recipes.delete.useMutation({
  onMutate: async (deletedId) => {
    // Cancel outgoing refetches
    await utils.recipes.list.cancel();
    
    // Snapshot previous value
    const previousRecipes = utils.recipes.list.getData();
    
    // Optimistically update
    utils.recipes.list.setData(undefined, (old) =>
      old?.filter(r => r.id !== deletedId)
    );
    
    return { previousRecipes };
  },
  onError: (err, deletedId, context) => {
    // Rollback on error
    utils.recipes.list.setData(undefined, context?.previousRecipes);
  },
  onSettled: () => {
    // Refetch after mutation
    utils.recipes.list.invalidate();
  },
});
```

### Styling with Tailwind

**Utility Classes:**
```tsx
<div className="container mx-auto px-4 py-8">
  <h1 className="text-3xl font-bold text-gray-900 mb-6">
    Title
  </h1>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Content */}
  </div>
</div>
```

**Responsive Design:**
```tsx
<div className="
  w-full           // Mobile: full width
  md:w-1/2         // Tablet: half width
  lg:w-1/3         // Desktop: third width
  p-4              // Padding all sides
  md:p-6           // Larger padding on tablet+
">
  Content
</div>
```

**Using shadcn/ui Components:**
```tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Recipe Name</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Recipe details...</p>
    <Button variant="default">Edit</Button>
    <Button variant="outline">Delete</Button>
  </CardContent>
</Card>
```

---

## Common Patterns

### Loading States

```typescript
function RecipeList() {
  const { data: recipes, isLoading, error } = trpc.recipes.list.useQuery();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <ErrorMessage error={error.message} />;
  }
  
  if (!recipes?.length) {
    return <EmptyState message="No recipes found" />;
  }
  
  return (
    <div>
      {recipes.map(recipe => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}
```

### Form Handling

```typescript
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

function CreateRecipeForm() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  
  const createRecipe = trpc.recipes.create.useMutation({
    onSuccess: () => {
      toast.success('Recipe created!');
      setName('');
      setCategory('');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRecipe.mutate({ name, category, /* ... */ });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Recipe name"
      />
      <button type="submit" disabled={createRecipe.isLoading}>
        {createRecipe.isLoading ? 'Creating...' : 'Create Recipe'}
      </button>
    </form>
  );
}
```

### Authentication Check

```typescript
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';

function ProtectedPage() {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return (
      <div>
        <p>Please log in to continue</p>
        <a href={getLoginUrl()}>Log In</a>
      </div>
    );
  }
  
  return (
    <div>
      <p>Welcome, {user.name}!</p>
      {/* Protected content */}
    </div>
  );
}
```

---

## Troubleshooting

### Common Issues

**1. TypeScript errors after schema changes:**
```bash
# Restart TypeScript server in VS Code
# Or restart dev server
pnpm dev
```

**2. Module not found errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
pnpm install
```

**3. Database connection errors:**
```bash
# Check DATABASE_URL in environment
echo $DATABASE_URL

# Test database connection
pnpm tsx -e "import { getDb } from './server/db.js'; const db = await getDb(); console.log('Connected:', !!db);"
```

**4. tRPC type errors:**
```bash
# Ensure routers.ts exports appRouter correctly
# Restart dev server to regenerate types
pnpm dev
```

**5. Tailwind styles not applying:**
```bash
# Check tailwind.config.js includes correct paths
# Restart dev server
pnpm dev
```

### Debug Commands

```bash
# Check TypeScript errors
pnpm check

# Run tests
pnpm test

# Check database schema
pnpm drizzle-kit studio

# View database in browser
# (opens Drizzle Studio)
```

### Getting Help

**Resources:**
- `docs/ARCHITECTURE.md` - System design and technology choices
- `docs/API_REFERENCE.md` - API endpoints and database schema
- `docs/HANDOFF_*.md` - Recent session notes and context
- `docs/KNOWN_ISSUES.md` - Known bugs and workarounds

**External Resources:**
- [tRPC Documentation](https://trpc.io/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## Appendix: Quick Reference

### Useful Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Build for production
pnpm start                  # Run production build

# Testing
pnpm test                   # Run tests
pnpm test --watch           # Run tests in watch mode
pnpm check                  # TypeScript type checking

# Database
pnpm db:push                # Push schema changes
pnpm tsx seed-database.ts   # Seed database

# Git
git status                  # Check status
git add .                   # Stage all changes
git commit -m "message"     # Commit changes
git push                    # Push to remote
```

### File Templates

**New Page Component:**
```typescript
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';

export default function PageName() {
  const { isAuthenticated } = useAuth();
  const { data, isLoading } = trpc.endpoint.useQuery();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Page Title</h1>
      {/* Content */}
    </div>
  );
}
```

**New tRPC Router:**
```typescript
import { z } from 'zod';
import { router, protectedProcedure } from './_core/trpc';
import { getItems, createItem } from './db';

export const itemRouter = router({
  list: protectedProcedure
    .query(({ ctx }) => getItems(ctx.user.restaurantId)),
  
  create: protectedProcedure
    .input(z.object({
      name: z.string(),
    }))
    .mutation(({ input, ctx }) => createItem(input)),
});
```

---

**Document Maintenance:**
- Update this guide when adding new patterns or conventions
- Keep examples current with actual codebase
- Add troubleshooting entries for common issues
- Review quarterly for accuracy

**Last Reviewed:** December 28, 2024  
**Next Review:** March 28, 2025
