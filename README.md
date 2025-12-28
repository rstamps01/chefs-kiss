# Chef's Kiss 👨‍🍳

**Intelligent Operations Platform for Data-Driven Restaurants**

Transform your POS data into actionable insights. Optimize prep planning, reduce waste, and increase profitability with AI-powered forecasting and weather intelligence.

---

## 🎯 Overview

Chef's Kiss is a comprehensive restaurant resource planning tool designed specifically for independent restaurants and small chains. It combines historical sales data, weather forecasting, and AI-powered analytics to help restaurant operators make data-driven decisions about food preparation, staffing, and operations.

### Key Features

- **📊 Sales Analytics** - Visualize historical sales trends with interactive charts
- **🤖 AI-Powered Forecasting** - Predict future sales based on patterns and weather
- **📝 Prep Planning** - Convert forecasts into ingredient-level prep quantities
- **🍱 Recipe Management** - Define menu items and track ingredient costs
- **🌤️ Weather Integration** - Correlate weather conditions with sales patterns
- **📄 PDF Reports** - Generate professional operational analysis reports
- **🔐 User Authentication** - Secure access with role-based permissions
- **🏢 Multi-Location Ready** - Architecture supports multiple restaurant locations

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

### Backend
- **Node.js** - JavaScript runtime
- **Express 4** - Web application framework
- **tRPC 11** - Type-safe API layer
- **Drizzle ORM** - TypeScript ORM for MySQL
- **MySQL/TiDB** - Relational database
- **Manus OAuth** - Authentication system

### Infrastructure
- **Manus Platform** - Hosting and deployment
- **S3-compatible Storage** - File storage
- **OpenWeather API** - Weather data integration
- **LLM Integration** - AI-powered insights

---

## 📁 Project Structure

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
│   │   │   ├── Recipes.tsx
│   │   │   ├── RecipeIngredientsView.tsx
│   │   │   ├── AddRecipeForm.tsx
│   │   │   ├── Reports.tsx
│   │   │   ├── Settings.tsx
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
│   ├── db.ts                  # Database queries
│   ├── routers.ts             # tRPC routers
│   └── auth.logout.test.ts    # Example test
├── drizzle/                    # Database schema and migrations
│   └── schema.ts              # Database schema definition
├── shared/                     # Shared code between client/server
│   └── const.ts               # Shared constants
├── docs/                       # Documentation
│   ├── LLM_Integration_Specification.md
│   ├── MVP_Stakeholder_Presentation.md
│   └── Restaurant_Resource_Planning_Tool_PRD.md
├── seed-database.ts           # Database seeding script
├── todo.md                    # Project task tracking
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── vite.config.ts             # Vite configuration
└── README.md                  # This file
```

---

## 🗄️ Database Schema

The application uses 15 interconnected tables:

### Core Tables
- **users** - User authentication and profiles
- **restaurants** - Restaurant business information
- **locations** - Physical restaurant locations

### Sales & POS
- **pos_integrations** - POS system connections
- **sales_data** - Daily aggregated sales
- **item_sales** - Item-level sales tracking

### Recipe Management
- **recipes** - Menu items with pricing
- **ingredients** - Ingredient inventory
- **recipe_ingredients** - Recipe-ingredient relationships

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
   pnpm tsx seed-database.ts
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

### 1. View Sample Data

Navigate to `/recipes-view` to see the sample recipes and ingredients loaded in the database.

### 2. Add a New Recipe

1. Click the **"+ Add Recipe"** button
2. Fill in the recipe details:
   - Name, category, servings
   - Prep time, cook time, selling price
   - Optional description
3. Add ingredients:
   - Select ingredient from dropdown
   - Enter quantity and unit
   - Click "Add" to include in recipe
4. Click **"Create Recipe"** to save

### 3. View Analytics Dashboard

Navigate to `/dashboard` to access:
- Sales trends and charts
- Weather correlation analysis
- Forecasting predictions
- Prep planning recommendations

### 4. Generate Reports

Go to `/reports` to:
- Select report type and date range
- Generate PDF operational analysis
- Download or email reports

---

## 🔌 API Integration

### POS Systems Supported

The platform is designed to integrate with major POS systems:
- Toast POS
- Square
- Clover
- Lightspeed
- TouchBistro
- Revel Systems

### Weather Data

Weather integration uses **OpenWeather API**:
- Historical weather data (past 30 days)
- 7-day weather forecasts
- Temperature, precipitation, conditions

### AI/LLM Features

Powered by Manus LLM infrastructure:
- Natural language insights
- Automated recommendations
- Anomaly detection
- Conversational analytics

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
   # Use the Manus UI to create a checkpoint
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

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🎨 Branding

The Chef's Kiss brand identity features an elegant chef silhouette with the iconic "chef's kiss" gesture, paired with classic serif typography. The complete branding package is available in the `/branding` directory.

### Brand Assets
- **Logo Variations**: Primary, horizontal, stacked, wordmark-only
- **Color Palette**: Monochromatic (Black #000000, White #FFFFFF)
- **Typography**: Didot/Bodoni-style serif for wordmark, Helvetica Neue/Lato for body text
- **Formats**: PNG with transparent backgrounds
- **Usage Guidelines**: See `/branding/brand_guide/style_guide.md`

All branding assets are provided in both black (for light backgrounds) and white (for dark backgrounds) versions.

---

## 🙏 Acknowledgments

- **Manus Platform** - Hosting and infrastructure
- **shadcn/ui** - Component library
- **Drizzle ORM** - Database toolkit
- **OpenWeather** - Weather data API
- **Chart.js** - Data visualization
- **Sushi Confidential Campbell** - Inspiration and case study

---

## 📞 Support

For questions, issues, or feature requests:

- **GitHub Issues**: [https://github.com/rstamps01/chefs-kiss/issues](https://github.com/rstamps01/chefs-kiss/issues)
- **Documentation**: See `/docs` folder for detailed specifications
- **Email**: [Your contact email]

---

## 🗺️ Roadmap

### Phase 1 (Current - MVP)
- ✅ Core dashboard and UI
- ✅ Database schema and seed data
- ✅ Recipe and ingredient management
- ✅ Recipe creation form
- 🔄 POS data import (CSV)
- 🔄 Sales forecasting engine
- 🔄 Weather integration
- 🔄 PDF report generation

### Phase 2 (Q1 2026)
- Multi-location management UI
- Advanced AI recommendations
- Events integration (PredictHQ)
- Mobile responsive optimization
- Bulk recipe import/export

### Phase 3 (Q2 2026)
- Real-time POS API integrations
- Inventory management
- Staff scheduling
- Cost optimization engine
- Customer analytics

---

## 📊 Project Status

**Current Version**: 0.1.0 (MVP Development)

**Last Updated**: December 27, 2024

**Status**: Active Development 🚧

---

Built with ❤️ by the Chef's Kiss team
