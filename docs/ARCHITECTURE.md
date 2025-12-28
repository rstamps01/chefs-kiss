# Architecture Documentation

**Chef's Kiss - Restaurant Resource Planning Platform**

**Last Updated:** December 28, 2024  
**Version:** 0.1.0 (MVP)

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Patterns](#architecture-patterns)
4. [Database Design](#database-design)
5. [API Layer](#api-layer)
6. [Frontend Architecture](#frontend-architecture)
7. [External Integrations](#external-integrations)
8. [Security Architecture](#security-architecture)
9. [Deployment Architecture](#deployment-architecture)
10. [Scalability Considerations](#scalability-considerations)

---

## System Overview

### Purpose

Chef's Kiss is a restaurant resource planning platform that transforms POS data into actionable insights through AI-powered forecasting and weather intelligence. The system helps restaurant operators optimize prep planning, reduce waste, and increase profitability.

### Core Capabilities

**Data Ingestion:**
- POS data import (CSV and API)
- Weather data integration (historical + forecast)
- Local events data collection

**Analytics & Forecasting:**
- Historical sales trend analysis
- Weather-correlated sales forecasting
- AI-powered insights and recommendations
- Anomaly detection

**Operational Planning:**
- Ingredient-level prep planning
- Recipe and cost management
- PDF report generation
- Multi-location support (architecture ready)

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Dashboard   │  │   Recipes    │  │  Forecasting │      │
│  │   Pages      │  │  Management  │  │   & Reports  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                │                  │              │
│           └────────────────┴──────────────────┘              │
│                            │                                 │
│                    tRPC Client (Type-safe)                   │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                    Backend (Express + tRPC)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Routers    │  │   Business   │  │  External    │      │
│  │  (API Layer) │  │    Logic     │  │  Services    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                │                  │              │
│           └────────────────┴──────────────────┘              │
│                            │                                 │
│                   Database Layer (Drizzle ORM)               │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                    Data Layer (MySQL/TiDB)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Sales     │  │   Recipes    │  │  Forecasts   │      │
│  │     Data     │  │ & Ingredients│  │  & Weather   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘

External Services:
┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
│ OpenWeather│  │  Manus LLM │  │   Manus    │  │    POS     │
│     API    │  │  Service   │  │   OAuth    │  │  Systems   │
└────────────┘  └────────────┘  └────────────┘  └────────────┘
```

---

## Technology Stack

### Frontend

**Core Framework:**
- **React 19** - Latest React with concurrent features, improved hooks, and better TypeScript support
  - *Why chosen:* Industry standard, excellent ecosystem, strong TypeScript integration
  - *Alternative considered:* Vue 3 - Rejected due to smaller ecosystem for enterprise features

**Language:**
- **TypeScript 5.9** - Strict type checking enabled
  - *Why chosen:* Catches errors at compile time, excellent IDE support, self-documenting code
  - *Alternative considered:* JavaScript - Rejected due to lack of type safety in complex application

**Styling:**
- **Tailwind CSS 4** - Utility-first CSS framework with OKLCH color support
  - *Why chosen:* Rapid development, consistent design system, excellent responsive utilities
  - *Alternative considered:* CSS Modules - Rejected due to verbosity and lack of design constraints

**Component Library:**
- **shadcn/ui** - High-quality, customizable component library
  - *Why chosen:* Components are copied into project (full control), excellent accessibility, modern design
  - *Alternative considered:* Material-UI - Rejected due to opinionated styling and bundle size

**Routing:**
- **Wouter 3.3** - Lightweight routing library
  - *Why chosen:* Tiny bundle size (1.5KB), simple API, sufficient for SPA needs
  - *Alternative considered:* React Router - Rejected due to unnecessary complexity and larger bundle

**State Management:**
- **TanStack Query (via tRPC)** - Server state management
  - *Why chosen:* Automatic caching, optimistic updates, built into tRPC
  - *Alternative considered:* Redux - Rejected due to boilerplate and server state complexity

### Backend

**Runtime:**
- **Node.js 22.x** - JavaScript runtime
  - *Why chosen:* Excellent performance, large ecosystem, same language as frontend
  - *Alternative considered:* Python/FastAPI - Rejected due to team expertise and TypeScript benefits

**Framework:**
- **Express 4** - Minimal web framework
  - *Why chosen:* Battle-tested, flexible, works well with tRPC
  - *Alternative considered:* Fastify - Rejected due to smaller ecosystem and unnecessary performance gains

**API Layer:**
- **tRPC 11** - End-to-end type-safe API framework
  - *Why chosen:* Eliminates API contract drift, automatic client generation, excellent DX
  - *Alternative considered:* REST with OpenAPI - Rejected due to manual contract maintenance
  - *Alternative considered:* GraphQL - Rejected due to complexity and over-fetching concerns

**ORM:**
- **Drizzle ORM 0.44** - TypeScript ORM for SQL databases
  - *Why chosen:* Excellent TypeScript inference, lightweight, SQL-like syntax, great migrations
  - *Alternative considered:* Prisma - Rejected due to schema language abstraction and slower queries
  - *Alternative considered:* TypeORM - Rejected due to decorator syntax and Active Record pattern

### Database

**Primary Database:**
- **MySQL 8 / TiDB** - Relational database
  - *Why chosen:* ACID compliance, complex relationships (recipes-ingredients), mature ecosystem
  - *Alternative considered:* PostgreSQL - Rejected due to Manus platform MySQL support
  - *Alternative considered:* MongoDB - Rejected due to need for relational data and transactions

**Database Hosting:**
- **Manus Platform (TiDB)** - Managed MySQL-compatible database
  - *Why chosen:* Integrated with hosting platform, automatic backups, horizontal scaling capability
  - *Alternative considered:* Self-hosted MySQL - Rejected due to operational overhead

### Infrastructure

**Hosting:**
- **Manus Platform** - Integrated hosting and services platform
  - *Why chosen:* Automatic env vars, OAuth, LLM access, S3 storage, zero config deployment
  - *Alternative considered:* Vercel - Rejected due to need for integrated database and services
  - *Alternative considered:* AWS - Rejected due to complexity and operational overhead

**File Storage:**
- **S3-compatible Storage** - Object storage for files
  - *Why chosen:* Scalable, reliable, integrated with Manus platform
  - *Alternative considered:* Local filesystem - Rejected due to scaling and backup concerns

**Authentication:**
- **Manus OAuth** - OAuth 2.0 authentication
  - *Why chosen:* Integrated with platform, handles user management, secure
  - *Alternative considered:* Auth0 - Rejected due to cost and unnecessary complexity
  - *Alternative considered:* Custom JWT - Rejected due to security concerns and maintenance

---

## Architecture Patterns

### Overall Pattern: Three-Tier Architecture

**Presentation Tier (Frontend):**
- React components for UI
- tRPC client for API calls
- Local state for UI-only concerns
- Server state managed by TanStack Query

**Application Tier (Backend):**
- tRPC routers for API endpoints
- Business logic in service modules
- Database queries in db.ts helpers
- External service integrations

**Data Tier (Database):**
- MySQL for persistent storage
- Drizzle ORM for type-safe queries
- Foreign keys for referential integrity
- Indexes for performance (to be added)

### Design Patterns Used

**1. Repository Pattern (Database Layer)**

*Location:* `server/db.ts`

*Purpose:* Separate database queries from business logic

*Example:*
```typescript
// Repository function
export async function getRecipesWithIngredients(restaurantId: number) {
  const db = await getDb();
  return db
    .select()
    .from(recipes)
    .leftJoin(recipeIngredients, eq(recipes.id, recipeIngredients.recipeId))
    .leftJoin(ingredients, eq(recipeIngredients.ingredientId, ingredients.id))
    .where(eq(recipes.restaurantId, restaurantId));
}

// Used in router
recipes: router({
  list: protectedProcedure.query(({ ctx }) => 
    getRecipesWithIngredients(ctx.user.restaurantId)
  ),
}),
```

**2. Procedure Pattern (API Layer)**

*Location:* `server/routers.ts`

*Purpose:* Type-safe API endpoints with middleware

*Example:*
```typescript
// Public procedure (no auth required)
publicProcedure
  .input(z.object({ email: z.string().email() }))
  .query(async ({ input }) => {
    // Logic here
  });

// Protected procedure (auth required)
protectedProcedure
  .input(z.object({ recipeId: z.number() }))
  .mutation(async ({ ctx, input }) => {
    // ctx.user is guaranteed to exist
  });
```

**3. Component Composition (Frontend)**

*Location:* `client/src/components/`

*Purpose:* Reusable, composable UI components

*Example:*
```typescript
// Atomic components (shadcn/ui)
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Composed components
function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{recipe.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Content */}
      </CardContent>
      <CardFooter>
        <Button>Edit</Button>
      </CardFooter>
    </Card>
  );
}
```

**4. Custom Hooks Pattern (Frontend)**

*Location:* `client/src/hooks/` and `client/src/_core/hooks/`

*Purpose:* Reusable stateful logic

*Example:*
```typescript
// useAuth hook
export function useAuth() {
  const { data: user, isLoading, error } = trpc.auth.me.useQuery();
  
  return {
    user,
    loading: isLoading,
    error,
    isAuthenticated: !!user,
  };
}

// Usage in component
function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <LoginPrompt />;
  return <DashboardContent user={user} />;
}
```

**5. Service Layer Pattern (Backend)**

*Location:* `server/forecasting.ts`, `server/weather.ts` (to be created)

*Purpose:* Encapsulate business logic separate from API layer

*Example:*
```typescript
// Service module
export async function generateForecast(params: ForecastParams) {
  // 1. Fetch historical sales
  const sales = await getSalesData(params);
  
  // 2. Fetch weather forecast
  const weather = await getWeatherForecast(params);
  
  // 3. Apply forecasting algorithm
  const forecast = calculateForecast(sales, weather);
  
  // 4. Generate AI insights
  const insights = await generateInsights(forecast);
  
  return { forecast, insights };
}

// Used in router
forecasting: router({
  generate: protectedProcedure
    .input(forecastParamsSchema)
    .mutation(({ input }) => generateForecast(input)),
}),
```

---

## Database Design

### Schema Overview

**15 Tables organized into 5 categories:**

1. **Core Tables** (3) - users, restaurants, locations
2. **Sales & POS** (3) - pos_integrations, sales_data, item_sales
3. **Recipe Management** (3) - recipes, ingredients, recipe_ingredients
4. **External Data** (2) - weather_data, events
5. **Forecasting & Planning** (4) - forecasts, prep_plans, prep_plan_items, reports

### Entity Relationship Diagram

```
┌──────────────┐
│    users     │
│──────────────│
│ id (PK)      │
│ openId       │
│ role         │
└──────┬───────┘
       │ 1
       │
       │ N
┌──────┴───────┐       ┌──────────────┐
│ restaurants  │───────│  locations   │
│──────────────│  1:N  │──────────────│
│ id (PK)      │       │ id (PK)      │
│ ownerId (FK) │       │ restaurantId │
└──────┬───────┘       └──────┬───────┘
       │ 1                    │ 1
       │                      │
       │ N                    │ N
┌──────┴───────┐       ┌──────┴───────┐
│   recipes    │       │  sales_data  │
│──────────────│       │──────────────│
│ id (PK)      │       │ id (PK)      │
│ restaurantId │       │ locationId   │
└──────┬───────┘       └──────────────┘
       │ N
       │
       │ N (junction table)
┌──────┴──────────────┐
│ recipe_ingredients  │
│─────────────────────│
│ recipeId (FK)       │
│ ingredientId (FK)   │
│ quantity            │
└──────┬──────────────┘
       │ N
       │
       │ 1
┌──────┴───────┐
│ ingredients  │
│──────────────│
│ id (PK)      │
│ restaurantId │
└──────────────┘
```

### Key Design Decisions

**1. Many-to-Many Relationships**

*Decision:* Use junction tables (e.g., `recipe_ingredients`) instead of JSON columns

*Rationale:*
- Enables proper foreign key constraints
- Allows querying ingredients by recipe efficiently
- Supports quantity and unit per relationship
- Maintains data integrity

**2. Decimal vs Float for Money**

*Decision:* Use `decimal(10,2)` for all monetary values

*Rationale:*
- Avoids floating-point precision errors
- Standard practice for financial data
- Exact representation of currency

**3. Timestamps in UTC**

*Decision:* Store all timestamps in UTC, convert to local time in UI

*Rationale:*
- Simplifies multi-timezone support
- Avoids daylight saving time issues
- Standard best practice

**4. Soft Deletes vs Hard Deletes**

*Decision:* Hard deletes for MVP, soft deletes for Phase 2

*Rationale:*
- Simpler implementation for MVP
- Can add `deletedAt` column later if needed
- Most data is not user-deletable anyway

**5. Normalization Level**

*Decision:* 3rd Normal Form (3NF) with some denormalization for performance

*Rationale:*
- Eliminates most data redundancy
- Maintains data integrity
- Allows strategic denormalization later (e.g., caching forecast results)

### Indexing Strategy (Future)

**Planned Indexes:**
```sql
-- Sales queries by date range
CREATE INDEX idx_sales_date ON sales_data(date, location_id);

-- Recipe lookups
CREATE INDEX idx_recipes_restaurant ON recipes(restaurant_id);

-- Ingredient searches
CREATE INDEX idx_ingredients_name ON ingredients(name, restaurant_id);

-- Weather queries
CREATE INDEX idx_weather_date ON weather_data(date, location_id);

-- Forecast lookups
CREATE INDEX idx_forecasts_date ON forecasts(forecast_date, location_id);
```

---

## API Layer

### tRPC Architecture

**Router Organization:**

```typescript
appRouter
├── auth
│   ├── me (query)
│   └── logout (mutation)
├── recipes
│   ├── list (query)
│   ├── create (mutation)
│   └── update (mutation)
├── ingredients
│   └── list (query)
├── restaurant
│   └── get (query)
└── system
    └── notifyOwner (mutation)
```

### Procedure Types

**1. Public Procedures**
- No authentication required
- Used for: health checks, public data

**2. Protected Procedures**
- Requires authentication
- `ctx.user` is guaranteed to exist
- Used for: most application features

**3. Admin Procedures** (Future)
- Requires admin role
- Used for: system administration

### Input Validation

**Using Zod schemas:**

```typescript
const createRecipeSchema = z.object({
  name: z.string().min(1).max(255),
  category: z.string().min(1).max(100),
  servings: z.number().int().positive(),
  sellingPrice: z.number().positive(),
  ingredients: z.array(z.object({
    ingredientId: z.number().int().positive(),
    quantity: z.number().positive(),
    unit: z.string().min(1).max(50),
  })),
});

recipes: router({
  create: protectedProcedure
    .input(createRecipeSchema)
    .mutation(async ({ input, ctx }) => {
      // input is fully type-safe and validated
    }),
}),
```

### Error Handling

**tRPC Error Codes:**
- `BAD_REQUEST` - Invalid input
- `UNAUTHORIZED` - Not authenticated
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource doesn't exist
- `INTERNAL_SERVER_ERROR` - Unexpected error

**Example:**
```typescript
if (!recipe) {
  throw new TRPCError({
    code: 'NOT_FOUND',
    message: 'Recipe not found',
  });
}
```

---

## Frontend Architecture

### Component Structure

```
client/src/
├── _core/              # Core utilities (don't modify)
│   └── hooks/          # Built-in hooks
├── components/
│   ├── ui/             # shadcn/ui components
│   ├── DashboardLayout.tsx
│   └── ErrorBoundary.tsx
├── contexts/           # React contexts
│   └── ThemeContext.tsx
├── hooks/              # Custom hooks
├── lib/                # Client libraries
│   └── trpc.ts
├── pages/              # Page components
│   ├── Home.tsx
│   ├── Analytics.tsx
│   └── ...
├── App.tsx             # Main app component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

### State Management Strategy

**Server State (via tRPC + TanStack Query):**
- All data from backend
- Automatic caching and revalidation
- Optimistic updates for mutations

**Local State (via useState/useReducer):**
- Form inputs
- UI-only state (modals, dropdowns)
- Temporary calculations

**Global State (via Context):**
- Theme (dark/light)
- User authentication status
- App-wide settings

**No Redux/Zustand needed** - Server state dominates, local state is minimal

### Routing Strategy

**Pattern:** File-based routing (manual)

**Routes:**
```typescript
<Switch>
  <Route path="/" component={Home} />
  <Route path="/recipes-view" component={RecipeIngredientsView} />
  <Route path="/recipes/add" component={AddRecipeForm} />
  <Route path="/dashboard">
    <DashboardLayout>
      <Analytics />
    </DashboardLayout>
  </Route>
  {/* ... */}
</Switch>
```

**Protected Routes (Future):**
```typescript
function ProtectedRoute({ component: Component }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Redirect to={getLoginUrl()} />;
  
  return <Component />;
}
```

### Performance Optimizations

**Current:**
- Code splitting via dynamic imports (Vite default)
- Image optimization (WebP format)
- Tailwind CSS purging (production only)

**Planned:**
- React.lazy for route-based code splitting
- Virtualized lists for large data tables
- Service worker for offline support
- Image lazy loading

---

## External Integrations

### 1. Manus Platform Services

**OAuth Authentication:**
- Endpoint: `OAUTH_SERVER_URL`
- Flow: Authorization Code with PKCE
- Session: HTTP-only cookies

**LLM Service:**
- Endpoint: `BUILT_IN_FORGE_API_URL`
- Authentication: Bearer token (`BUILT_IN_FORGE_API_KEY`)
- Model: GPT-4 Turbo (default)
- Usage: AI insights, recommendations, report generation

**S3 Storage:**
- Endpoint: Configured via `storage.ts`
- Authentication: Automatic via Manus SDK
- Usage: File uploads, PDF reports, images

### 2. OpenWeather API (Planned)

**Endpoints:**
- Historical: `/data/2.5/onecall/timemachine`
- Forecast: `/data/2.5/forecast`

**Data Retrieved:**
- Temperature (min, max, avg)
- Precipitation (mm)
- Weather conditions (clear, rain, snow, etc.)
- Wind speed

**Caching Strategy:**
- Historical data: Cache indefinitely (doesn't change)
- Forecast data: Cache for 1 hour
- Store in `weather_data` table

### 3. POS Systems (Phase 2)

**Integration Priority:**
1. **Heartland POS / Global Payments REST API** (First priority - Homeland POC)
2. Toast POS (API)
3. Square (API)
4. Clover (API)
5. Generic CSV import (fallback for any POS)

**Heartland/Global Payments Integration:**
- **Target Platform:** Genius for Restaurants (Heartland's next-gen POS)
- **API Type:** REST API with OAuth 2.0 or API Key authentication
- **Base URL:** `https://apis.globalpay.com/ucp` (Production)
- **Sandbox URL:** `https://apis-cert.globalpay.com/ucp` (Testing)
- **SDK:** `@globalpayments/api` (Node.js)
- **Key Endpoints:**
  - `/transactions` - Retrieve sales transactions
  - `/reports` - Access sales reports and summaries
  - `/batches` - Get batch settlement data
  - `/devices` - Manage POS devices

**Architecture Pattern:**
- **Adapter Pattern:** Each POS system has its own adapter implementing a common interface
- **Normalization Layer:** Convert POS-specific data to Chef's Kiss standard schema
- **Incremental Sync:** Fetch only new transactions since last sync
- **Raw Data Storage:** Store original POS data for re-processing if schema changes

**Data Mapping (All POS Systems):**
- Transaction date/time → `sales_data.date` (converted to UTC)
- Total sales amount → `sales_data.totalSales`
- Line items → `item_sales` table (individual menu items)
- Customer/guest count → `sales_data.customerCount`
- Payment method → `pos_integrations` metadata
- Server/employee info → Future enhancement

**CSV Import Fallback:**
- User uploads CSV export from any POS
- Field mapping UI (user maps CSV columns to Chef's Kiss fields)
- Validation and preview before import
- Same normalization as API integrations

---

## Security Architecture

### Authentication & Authorization

**Authentication:**
- OAuth 2.0 via Manus platform
- Session cookies (HTTP-only, Secure, SameSite)
- JWT tokens for session validation

**Authorization:**
- Role-based access control (admin, user)
- Resource ownership checks (user owns restaurant)
- Row-level security in queries

**Example:**
```typescript
// Ensure user owns restaurant
const restaurant = await getRestaurantByUser(ctx.user.id);
if (!restaurant) {
  throw new TRPCError({ code: 'FORBIDDEN' });
}
```

### Data Security

**At Rest:**
- Database encryption (managed by Manus/TiDB)
- S3 encryption (server-side)
- No sensitive data in logs

**In Transit:**
- HTTPS only (enforced)
- Secure cookies
- API authentication via Bearer tokens

**Input Validation:**
- Zod schemas for all inputs
- SQL injection prevention (parameterized queries via Drizzle)
- XSS prevention (React escaping)

### API Security

**Rate Limiting (Future):**
- Per-user limits on expensive operations
- Global limits on public endpoints

**CORS:**
- Configured for Manus domain
- No wildcard origins

**CSRF Protection:**
- SameSite cookies
- CSRF tokens for mutations (Future)

---

## Deployment Architecture

### Manus Platform Deployment

**Build Process:**
```bash
# Frontend build
vite build  # → dist/

# Backend build
esbuild server/_core/index.ts --bundle --platform=node --outdir=dist/
```

**Environment:**
- Node.js 22.x runtime
- MySQL/TiDB database
- S3-compatible storage
- Automatic HTTPS

**Deployment Steps:**
1. Create checkpoint in Manus UI
2. Click "Publish" button
3. Automatic build and deployment
4. Health checks verify deployment

**Rollback:**
- Use `webdev_rollback_checkpoint` tool
- Or rollback via Manus UI

### Environment Variables

**Automatic (Manus):**
- `DATABASE_URL`
- `JWT_SECRET`
- `OAUTH_SERVER_URL`
- `BUILT_IN_FORGE_API_KEY`
- All Manus platform variables

**Manual (User-provided):**
- `OPENWEATHER_API_KEY` (via Manus Secrets UI)

---

## Scalability Considerations

### Current Limitations

**Single-tenant per database:**
- Each restaurant has own rows
- No multi-tenancy isolation yet

**No caching layer:**
- All queries hit database
- Repeated queries not cached

**No job queue:**
- Long-running tasks block request
- No background processing

### Scaling Strategy (Future)

**Horizontal Scaling:**
- Stateless backend (can run multiple instances)
- Load balancer distributes requests
- Shared database (TiDB scales horizontally)

**Caching:**
- Redis for session storage
- Redis for frequently-accessed data (recipes, ingredients)
- CDN for static assets

**Background Jobs:**
- Bull queue for async tasks
- Forecast generation runs in background
- Report generation queued

**Database Optimization:**
- Add indexes for common queries
- Partition sales_data by date
- Read replicas for analytics queries

### Performance Targets

**MVP (Current):**
- Page load < 2 seconds
- API response < 500ms
- Support 10 concurrent users

**Phase 2:**
- Page load < 1 second
- API response < 200ms
- Support 100 concurrent users

**Phase 3:**
- Page load < 500ms
- API response < 100ms
- Support 1000+ concurrent users

---

## Future Architecture Enhancements

### Planned Improvements

**1. Microservices (Phase 3)**
- Separate forecasting service
- Separate report generation service
- Event-driven architecture

**2. Real-time Updates (Phase 2)**
- WebSocket support for live data
- Real-time dashboard updates
- Collaborative editing

**3. Mobile App (Phase 3)**
- React Native app
- Shared tRPC API
- Offline-first architecture

**4. Multi-tenancy (Phase 2)**
- Tenant isolation at database level
- Tenant-specific customization
- White-label support

**5. Advanced Analytics (Phase 3)**
- Machine learning models
- Predictive analytics
- Custom reporting engine

---

## Appendix: Technology Decision Matrix

| Requirement | Options Considered | Chosen | Reason |
|-------------|-------------------|--------|--------|
| Frontend Framework | React, Vue, Svelte | React 19 | Ecosystem, team expertise, TypeScript support |
| Styling | Tailwind, CSS Modules, Styled Components | Tailwind 4 | Rapid development, consistency, utility-first |
| API Layer | REST, GraphQL, tRPC | tRPC 11 | Type safety, DX, no code generation needed |
| ORM | Prisma, Drizzle, TypeORM | Drizzle | TypeScript inference, performance, SQL-like |
| Database | PostgreSQL, MySQL, MongoDB | MySQL/TiDB | Platform support, relational data, ACID |
| Hosting | Vercel, AWS, Manus | Manus | Integrated services, zero config, cost |
| Auth | Auth0, Custom JWT, Manus OAuth | Manus OAuth | Integrated, secure, no extra cost |

---

**Document Maintenance:**
- Update this document when making architectural changes
- Document new technology choices with rationale
- Keep diagrams current with system evolution
- Review quarterly for accuracy

**Last Reviewed:** December 28, 2024  
**Next Review:** March 28, 2025
