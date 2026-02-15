# Chef's Kiss 👨‍🍳

**Intelligent Operations Platform for Data-Driven Restaurants**

Transform your POS data into actionable insights. Optimize prep planning, reduce waste, and increase profitability with AI-powered forecasting and weather intelligence.

---

## 🎯 Overview

Chef's Kiss is a comprehensive restaurant resource planning tool designed specifically for independent restaurants and small chains. It combines historical sales data, weather forecasting, and AI-powered analytics to help restaurant operators make data-driven decisions about food preparation, staffing, and operations.

### Key Features

- **📊 Sales Analytics** - Visualize historical sales trends with interactive charts
- **🤖 AI-Powered Forecasting** - Predict future sales based on patterns and weather (85-95% accuracy)
- **📝 Intelligent Prep Planning** - Convert forecasts into ingredient-level prep quantities with waste reduction
- **🍱 Recipe & Cost Management** - Define menu items, track ingredient costs, and calculate profit margins
- **🔄 Universal Unit Conversions** - Automatic unit conversion system (15 standard + ingredient-specific conversions)
- **🌤️ Weather Integration** - Correlate weather conditions with sales patterns
- **📄 PDF Reports** - Generate professional operational analysis reports
- **🔐 User Authentication** - Secure access with Manus OAuth
- **🏢 Multi-Location Ready** - Architecture supports multiple restaurant locations
- **💬 AI Agent (Planned)** - Conversational AI for natural language queries and recommendations

---

## 🏗️ Technology Stack

### Frontend
- **React 19** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling with OKLCH colors
- **shadcn/ui** - High-quality component library
- **Wouter** - Lightweight routing
- **tRPC** - End-to-end type-safe APIs
- **TanStack Query** - Data fetching and caching
- **Chart.js** - Data visualization

### Backend
- **Node.js 22** - JavaScript runtime
- **Express 4** - Web application framework
- **tRPC 11** - Type-safe API layer
- **Drizzle ORM** - TypeScript ORM for MySQL
- **MySQL/TiDB** - Relational database
- **Manus OAuth** - Authentication system

### AI & ML (Planned)
- **Prophet** - Time series forecasting
- **XGBoost** - Gradient boosting for demand prediction
- **Manus LLM** - Conversational AI agent
- **scikit-learn** - ML utilities and preprocessing

### Infrastructure
- **Manus Platform** - Hosting and deployment
- **S3-compatible Storage** - File storage
- **OpenWeather API** - Weather data integration (planned)
- **GitHub** - **Primary source control and sync location**

---

## 📁 Project Structure

> **📖 For complete project structure documentation, see [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)**

This is a high-level overview of the main directories:

```
restaurant-resource-planner/
├── branding/                    # Official branding package
│   ├── logos/                  # Logo variations (primary, horizontal, stacked)
│   ├── icons/                  # App icons (iOS, Android, web)
│   ├── web/                    # Web assets (favicons, headers)
│   ├── social_media/           # Social media assets
│   ├── print/                  # Print-ready assets
│   └── brand_guide/            # Complete brand style guide
├── client/                      # Frontend application
│   ├── public/                  # Static assets
│   │   ├── logo.png           # Chef's Kiss horizontal logo
│   │   └── favicon.ico        # Site favicon
│   ├── src/
│   │   ├── _core/              # Core utilities and hooks
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── RecipeEditModal.tsx
│   │   │   ├── RecipeCreateModal.tsx
│   │   │   ├── IngredientEditModal.tsx
│   │   │   ├── IngredientCreateModal.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── contexts/          # React contexts
│   │   │   └── ThemeContext.tsx
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Client libraries
│   │   │   └── trpc.ts        # tRPC client setup
│   │   ├── pages/             # Page components
│   │   │   ├── Home.tsx       # Landing page
│   │   │   ├── Analytics.tsx  # Sales dashboard
│   │   │   ├── Forecasting.tsx
│   │   │   ├── PrepPlanning.tsx
│   │   │   ├── Recipes.tsx    # Recipe & ingredient management
│   │   │   ├── DataImport.tsx # CSV import interface
│   │   │   ├── Reports.tsx
│   │   │   ├── Settings.tsx   # Categories & units management
│   │   │   └── NotFound.tsx
│   │   ├── App.tsx            # Main app component
│   │   ├── main.tsx           # Entry point
│   │   └── index.css          # Global styles
│   └── index.html             # HTML template
├── server/                     # Backend application
│   ├── _core/                 # Core server infrastructure
│   │   ├── context.ts         # tRPC context
│   │   ├── cookies.ts         # Cookie utilities
│   │   ├── env.ts             # Environment variables
│   │   ├── imageGeneration.ts # Image generation helper
│   │   ├── llm.ts             # LLM integration
│   │   ├── map.ts             # Maps API helper
│   │   ├── notification.ts    # Owner notifications
│   │   ├── systemRouter.ts    # System routes
│   │   ├── trpc.ts            # tRPC setup
│   │   ├── voiceTranscription.ts
│   │   └── index.ts           # Server entry point
│   ├── storage.ts             # S3 storage helpers
│   ├── db.ts                  # Database queries and helpers
│   ├── routers.ts             # tRPC routers
│   └── auth.logout.test.ts    # Example test
├── drizzle/                    # Database schema and migrations
│   └── schema.ts              # Database schema definition
├── shared/                     # Shared code between client/server
│   └── const.ts               # Shared constants
├── docs/                       # Comprehensive documentation
│   ├── README.md              # Documentation index
│   ├── ARCHITECTURE.md        # System design and rationale
│   ├── API_REFERENCE.md       # tRPC endpoints and database schema
│   ├── FEATURE_STATUS.md      # Implementation progress
│   ├── DEVELOPMENT_GUIDE.md   # Coding standards and workflows
│   ├── DECISION_LOG.md        # Key decisions and trade-offs
│   ├── KNOWN_ISSUES.md        # Bugs and technical debt
│   ├── HANDOFF_TEMPLATE.md    # Session transition checklist
│   └── HANDOFF_20251228.md    # Latest session handoff
├── seed-*.mjs                 # Database seeding scripts
├── todo.md                    # Project task tracking
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── vite.config.ts             # Vite configuration
└── README.md                  # This file
```

---

## 🗄️ Database Schema

The application uses 18 interconnected tables:

### Core Tables
- **users** - User authentication and profiles
- **restaurants** - Restaurant business information
- **locations** - Physical restaurant locations

### Sales & POS
- **pos_integrations** - POS system connections
- **sales_data** - Daily aggregated sales
- **item_sales** - Item-level sales tracking

### Recipe Management
- **recipes** - Menu items with pricing and categories
- **ingredients** - Ingredient inventory with costs
- **recipe_ingredients** - Recipe-ingredient relationships with quantities
- **recipeCategories** - Dynamic recipe categories (sushi rolls, appetizers, etc.)
- **ingredientCategories** - Dynamic ingredient categories (fish, produce, etc.)
- **ingredientUnits** - Dynamic measurement units (lb, oz, pieces, etc.)
- **unitConversions** - Universal unit conversion factors (15 standard conversions)
- **ingredientConversions** - Ingredient-specific conversion overrides (6 special cases)

### External Data
- **weather_data** - Historical and forecast weather
- **events** - Local events impacting sales

### Forecasting & Planning
- **forecasts** - AI-powered sales predictions
- **prep_plans** - Daily prep schedules
- **prep_plan_items** - Ingredient quantities
- **reports** - Generated PDF reports

---

## 🚀 Getting Started

### Prerequisites

- Node.js 22.x or higher
- pnpm package manager
- MySQL database (or TiDB)
- Manus Platform account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rstamps01/chefs-kiss.git
   cd chefs-kiss
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   The following environment variables are automatically provided by Manus Platform:
   - `DATABASE_URL` - MySQL connection string
   - `JWT_SECRET` - Session signing secret
   - `OAUTH_SERVER_URL` - OAuth backend URL
   - `VITE_APP_ID` - Application ID
   - `BUILT_IN_FORGE_API_KEY` - API key for Manus services
   - `BUILT_IN_FORGE_API_URL` - Manus services URL

4. **Initialize the database**
   ```bash
   pnpm db:push
   ```

5. **Seed sample data** (optional)
   ```bash
   npx tsx seed-ingredients.mjs
   npx tsx seed-menu-ingredients.mjs
   npx tsx seed-all-recipes.mjs
   npx tsx seed-unit-conversions.mjs
   npx tsx seed-standard-conversions.mjs
   ```

6. **Start the development server**
   ```bash
   pnpm dev
   ```

7. **Open your browser**
   
   Navigate to `http://localhost:3000`

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Run production server
- `pnpm test` - Run tests
- `pnpm db:push` - Push database schema changes
- `pnpm check` - TypeScript type checking
- `pnpm format` - Format code with Prettier

---

## 📖 Usage Guide

### 1. Recipe & Ingredient Management

Navigate to `/recipes` to:
- **View 59 Sushi Confidential recipes** with complete ingredient breakdowns
- **Manage 64 ingredients** across all categories (fish, produce, sauces, etc.)
- **Edit recipes** with accurate cost calculations and profit margins
- **Create new recipes** with ingredient selection and quantity inputs
- **Track unit conversions** automatically (15 universal + 6 ingredient-specific)

### 2. Dynamic Categories & Units

Go to `/settings` → **Categories & Units** to:
- **Manage recipe categories** (add, edit, delete, toggle active/inactive)
- **Manage ingredient units** (customize measurement units and display names)
- **Control dropdown visibility** (only active items appear in forms)

### 3. CSV Data Import

Navigate to `/data-import` to:
- **Upload POS sales data** in CSV format
- **Map columns** automatically with intelligent field detection
- **Preview data** before import (first 10 rows)
- **Validate and import** bulk sales records

### 4. View Analytics Dashboard

Navigate to `/analytics` to access:
- **Sales trends** with interactive charts (daily, weekly, monthly)
- **Key metrics** (total sales, average order value, transaction count)
- **Day-of-week patterns** for demand forecasting
- **Date range selection** for custom analysis

### 5. Sales Forecasting

Go to `/forecasting` to:
- **Generate sales predictions** based on historical patterns
- **View forecast accuracy** metrics and confidence intervals
- **Adjust forecast period** with date range selector
- **Analyze day-of-week trends** for better planning

### 6. Prep Planning

Navigate to `/prep-planning` to:
- **Generate ingredient prep lists** from sales forecasts
- **View recipe breakdowns** showing which dishes drive ingredient needs
- **Adjust safety buffers** (e.g., +10% for uncertainty)
- **Calculate waste reduction** metrics

### 7. Generate Reports

Go to `/reports` to:
- Select report type and date range
- Generate PDF operational analysis
- Download or email reports

---

## 🔌 API Integration

### POS Systems Supported

The platform is designed to integrate with major POS systems:
- **Heartland POS** (Priority 1 - Global Payments REST API)
- Toast POS
- Square
- Clover
- Lightspeed
- TouchBistro
- Revel Systems

### Weather Data (Planned)

Weather integration uses **OpenWeather API**:
- Historical weather data (past 30 days)
- 7-day weather forecasts
- Temperature, precipitation, conditions
- Weather-sales correlation analysis

### AI/LLM Features (Planned)

Powered by Manus LLM infrastructure:
- **Conversational AI agent** for natural language queries
- **Automated prep recommendations** based on forecast + weather
- **Labor scheduling optimization** with shift recommendations
- **Anomaly detection** for unusual sales patterns
- **Proactive alerts** for inventory warnings and forecast changes

---

## 🧪 Testing

The project uses **Vitest** for testing:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage
```

Example test file: `server/auth.logout.test.ts`

---

## 📦 Deployment

### Manus Platform Deployment

1. **Save a checkpoint**
   ```bash
   # Use the Manus UI or webdev_save_checkpoint tool
   ```

2. **Publish**
   - Click the "Publish" button in the Manus UI
   - Your application will be deployed automatically

3. **Custom Domain** (optional)
   - Configure custom domain in Settings → Domains
   - Update DNS records as instructed

### Environment Configuration

All required environment variables are automatically injected by the Manus platform. No manual configuration needed.

---

## 🔄 Development Workflow & GitHub Sync

### GitHub as Primary Source of Truth

**IMPORTANT**: This repository (`https://github.com/rstamps01/chefs-kiss.git`) is the **primary source control location** for all code changes. All development work should be synchronized here, whether working in:

- **Manus Platform** (web-based development with AI assistance)
- **Cursor IDE** (local development with AI pair programming)
- **VS Code** or other local IDEs

### Sync Workflow

#### From Manus to GitHub

1. **After completing features** in Manus:
   ```bash
   cd /home/ubuntu/restaurant-resource-planner
   git status
   git add .
   git commit -m "Descriptive commit message"
   git push github main
   ```

2. **Use Manus checkpoints** for deployment:
   - Checkpoints create automatic git commits
   - Push these commits to GitHub after each checkpoint
   - GitHub remote is configured as `github` (not `origin`)

#### From Cursor/Local to GitHub

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rstamps01/chefs-kiss.git
   cd chefs-kiss
   ```

2. **Make changes locally**:
   ```bash
   # Make your changes
   git add .
   git commit -m "Descriptive commit message"
   git push origin main
   ```

3. **Pull latest changes** before starting work:
   ```bash
   git pull origin main
   ```

#### Keeping Manus and Local in Sync

1. **Before starting work in Manus**:
   ```bash
   cd /home/ubuntu/restaurant-resource-planner
   git pull github main
   ```

2. **Before starting work locally**:
   ```bash
   git pull origin main
   ```

3. **Resolve conflicts** if they occur:
   - Prefer GitHub version as source of truth
   - Use `git mergetool` or manual resolution
   - Test thoroughly after resolving conflicts

### Best Practices

- ✅ **Commit frequently** with descriptive messages
- ✅ **Push to GitHub** at the end of each development session
- ✅ **Pull from GitHub** at the start of each session
- ✅ **Update documentation** when making significant changes
- ✅ **Run tests** before pushing (`pnpm test`)
- ✅ **Use Manus checkpoints** for deployment milestones
- ❌ **Don't commit** sensitive data or API keys
- ❌ **Don't force push** unless absolutely necessary
- ❌ **Don't work offline** for extended periods without syncing

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow existing code formatting (Prettier)
- Write tests for new features
- Update documentation as needed
- Maintain universal unit conversion system (don't create ingredient-specific conversions unless absolutely necessary)

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🎨 Branding

The Chef's Kiss brand identity features an elegant chef silhouette with the iconic "chef's kiss" gesture, paired with classic serif typography. The complete branding package is available in the `/branding` directory.

### Brand Assets
- **Logo Variations**: Primary, horizontal, stacked, wordmark-only
- **Color Palette**: 
  - Primary: Coral (#FF7E67) - Used for accents, CTAs, highlights
  - Neutral: Charcoal (#2C2C2C) - Used for backgrounds, text
  - Monochrome: Black (#000000), White (#FFFFFF)
- **Typography**: 
  - Headings: Montserrat (sans-serif, weights 300-700)
  - Body: Montserrat (sans-serif, weight 300-400)
  - Didot/Bodoni-style serif for wordmark
- **Formats**: PNG with transparent backgrounds, SVG for scalability
- **Usage Guidelines**: See `/branding/brand_guide/style_guide.md`

All branding assets are provided in both black (for light backgrounds) and white (for dark backgrounds) versions.

---

## 🙏 Acknowledgments

- **Manus Platform** - Hosting, infrastructure, and AI development tools
- **shadcn/ui** - Component library
- **Drizzle ORM** - Database toolkit
- **OpenWeather** - Weather data API (planned)
- **Chart.js** - Data visualization
- **Sushi Confidential Campbell** - Inspiration, case study, and recipe data

---

## 📞 Support

For questions, issues, or feature requests:

- **GitHub Issues**: [https://github.com/rstamps01/chefs-kiss/issues](https://github.com/rstamps01/chefs-kiss/issues)
- **Documentation**: See `/docs` folder for detailed specifications
- **Email**: Contact repository owner

---

## 🗺️ Roadmap

### Phase 1 (Current - MVP) ✅

- ✅ Core dashboard and UI with DashboardLayout
- ✅ Database schema (18 tables) with migrations
- ✅ Recipe and ingredient management (59 recipes, 64 ingredients)
- ✅ Universal unit conversion system (15 standard + 6 ingredient-specific)
- ✅ Recipe creation and editing modals with cost calculations
- ✅ Dynamic categories and units management
- ✅ CSV POS data import with field mapping
- ✅ Sales analytics dashboard with Chart.js
- ✅ Sales forecasting engine with day-of-week patterns
- ✅ Prep planning with ingredient quantity calculations
- ✅ Comprehensive documentation suite

### Phase 2 (Q1 2025 - AI Automation) 🔄

**Priority 1: Data Foundation**
- [ ] POS API integration (Heartland/Global Payments REST API)
- [ ] SocialSchedules labor data import
- [ ] Weather API integration (OpenWeather)
- [ ] Event data integration (PredictHQ)
- [ ] Historical data normalization and cleaning

**Priority 2: AI Forecasting Engine**
- [ ] Prophet time series forecasting implementation
- [ ] XGBoost ensemble model for demand prediction
- [ ] Weather-based forecast adjustments
- [ ] Event impact modeling
- [ ] Forecast accuracy tracking and model retraining

**Priority 3: AI Agent Interface**
- [ ] Conversational AI assistant (Manus LLM)
- [ ] Natural language query processing
- [ ] Automated prep sheet generation
- [ ] Labor scheduling recommendations
- [ ] Proactive alerts and notifications

**Expected ROI**: $56,700 annual savings for $1M revenue restaurant
- 3% food cost reduction through waste minimization
- 3% labor cost reduction through optimized scheduling
- 8+ hours/week manager time savings

### Phase 3 (Q2 2025 - Advanced Features)

- [ ] Multi-location management UI
- [ ] Real-time inventory tracking
- [ ] Staff scheduling interface
- [ ] Cost optimization engine
- [ ] Customer analytics
- [ ] Mobile responsive optimization
- [ ] Bulk recipe import/export
- [ ] Advanced reporting and dashboards

### Phase 4 (Q3 2025 - Enterprise Features)

- [ ] Multi-tenant architecture
- [ ] Role-based access control (RBAC)
- [ ] API for third-party integrations
- [ ] White-label customization
- [ ] Advanced ML models (LSTM, Transformer)
- [ ] Predictive maintenance alerts
- [ ] Supply chain optimization

---

## 📊 Project Status

**Current Version**: 0.2.0 (MVP Complete, AI Automation Planning)

**Last Updated**: December 30, 2024

**Status**: Active Development 🚧

**Recent Accomplishments**:
- ✅ Populated database with 59 Sushi Confidential recipes
- ✅ Added 64 ingredients across all categories
- ✅ Implemented universal unit conversion system (97.6% database reduction)
- ✅ Fixed ingredient unit display (show Display Names instead of IDs)
- ✅ Fixed Edit Recipe modal layout (grid structure + cost column)
- ✅ Created AI automation roadmap for prep sheets, sales forecasting, and labor scheduling
- ✅ Generated professional PowerPoint presentation for Sushi Confidential VP of Operations

**Known Issues**: See `/docs/KNOWN_ISSUES.md` for complete list

**Next Steps**: See `/docs/FEATURE_STATUS.md` for detailed implementation plan

---

Built with ❤️ by the Chef's Kiss team
