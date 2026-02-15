# Project Structure

This document outlines the organization of the Chef's Kiss Restaurant Resource Planner project.

## Root Directory

The root directory contains only essential configuration files and project documentation:

```
restaurant-resource-planner/
├── .gitignore              # Git ignore rules
├── .prettierignore         # Prettier ignore rules
├── .prettierrc             # Prettier configuration
├── README.md               # Project overview and setup instructions
├── components.json         # shadcn/ui components configuration
├── drizzle.config.ts       # Drizzle ORM configuration
├── package.json            # Node.js dependencies and scripts
├── pnpm-lock.yaml          # pnpm lockfile
├── todo.md                 # Project task tracking
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
└── vitest.config.ts        # Vitest test configuration
```

## Application Directories

### `/client`
Frontend React application built with Vite, React 19, and Tailwind CSS 4.

```
client/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   └── ui/            # shadcn/ui components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   ├── pages/             # Page-level components
│   ├── App.tsx            # Main application component
│   ├── index.css          # Global styles
│   └── main.tsx           # Application entry point
└── index.html             # HTML template
```

### `/server`
Backend Express server with tRPC API.

```
server/
├── _core/                 # Framework-level code (do not modify)
├── routers.ts             # tRPC procedure definitions
├── db.ts                  # Database query helpers
├── csv-helpers.ts         # CSV export functions
├── csv-preview-helpers.ts # CSV import preview logic
├── csv-templates.ts       # CSV template generation
└── *.test.ts              # Server-side tests
```

### `/drizzle`
Database schema and migrations.

```
drizzle/
├── schema.ts              # Database table definitions
└── migrations/            # SQL migration files
```

### `/shared`
Code shared between client and server.

```
shared/
└── constants.ts           # Shared constants and types
```

### `/docs`
Project documentation.

```
docs/
├── PROJECT_STRUCTURE.md   # This file
├── CHANGELOG.md           # Version history and changes
├── GITHUB_COMMIT_INSTRUCTIONS.md  # GitHub sync instructions
└── archive/               # Archived documentation
    ├── CONVERSION_SYSTEM_FIX_REPORT.md
    ├── CONVERSION_TEST_RESULTS.md
    ├── ingredient_review_complete.md
    ├── piece_based_fish_findings.md
    ├── rsm_full_analysis.md
    ├── sashimi_conversion_impact.md
    ├── seafood_conversion_list.md
    ├── seafood_conversion_test_results.md
    ├── seafood_ingredients.md
    ├── seafood_piece_weights_research.md
    ├── sushi_rice_fix_documentation.md
    └── unit_migration_success.md
```

### `/scripts`
Utility scripts and archived migration scripts.

```
scripts/
└── archive/               # Archived migration and seed scripts
    ├── add-final-conversions.mjs
    ├── add-pieces-lb-conversions.mjs
    ├── analyze-conversions.mjs
    ├── check-ingredient-units.mjs
    ├── check-restaurant-ids.mjs
    ├── check-unit-names.mjs
    ├── convert-to-oz-pricing.sql
    ├── convert_seafood_to_oz.sql
    ├── create-test-recipe.sql
    ├── debug-rsm-conversions.mjs
    ├── debug-scallops-conversions.mjs
    ├── debug-scallops-cost.mjs
    ├── find-all-missing-conversions.mjs
    ├── find-duplicates.mjs
    ├── fix-ingredient-units.mjs
    ├── fix-sashimi-units.mjs
    ├── fix-scallops-unit-id.mjs
    ├── fix-scallops.sql
    ├── migrate-to-universal-conversions.mjs
    ├── migrate_piece_weights_to_db.mjs
    ├── migrate_unit_ids_to_names.mjs
    ├── query_seafood.mjs
    ├── query_seafood.sql
    ├── query_seafood.ts
    ├── seed-all-recipes.mjs
    ├── seed-categories-units.mjs
    ├── seed-database.ts
    ├── seed-menu-ingredients.mjs
    ├── seed-standard-conversions.mjs
    ├── seed-unit-conversions.mjs
    ├── seed-unit-system.mjs
    ├── test-db-connection.mjs
    ├── test-forecast-debug.mjs
    ├── test-forecast.mjs
    ├── test-prep-debug.mjs
    ├── test-prep.mjs
    ├── test-scallops-conversion.mjs
    └── test-scallops-cost.mjs
```

### `/tests`
Test files and archived test data.

```
tests/
└── archive/               # Archived test files and data
    ├── test-csv-parse.cjs
    ├── test-ingredients-import.csv
    ├── test-parse-with-actions.cjs
    ├── test-preview-endpoint.mjs
    ├── test-preview-full.mjs
    └── test-recipes-import.csv
```

## System Directories

These directories are managed by the build system and should not be modified:

- `/.git` - Git version control
- `/.manus` - Manus platform metadata
- `/.manus-logs` - Manus platform logs
- `/.webdev` - Webdev tool metadata
- `/dist` - Build output
- `/node_modules` - npm dependencies
- `/patches` - pnpm patches
- `/test-data` - Test data files

## File Organization Principles

1. **Root directory** contains only essential configuration files
2. **Documentation** is centralized in `/docs`
3. **Archived files** are organized by type in `/docs/archive`, `/scripts/archive`, and `/tests/archive`
4. **Active development** happens in `/client`, `/server`, `/drizzle`, and `/shared`
5. **Tests** are colocated with source code (e.g., `server/*.test.ts`)

## Adding New Files

- **Documentation**: Add to `/docs` (or `/docs/archive` if historical)
- **Scripts**: Add to `/scripts` (or `/scripts/archive` if one-time migration)
- **Tests**: Add to `/server` as `*.test.ts` files
- **Components**: Add to `/client/src/components`
- **Pages**: Add to `/client/src/pages`
- **Database changes**: Update `/drizzle/schema.ts` and run `pnpm db:push`

## Maintenance

Periodically review and archive files that are no longer actively used:

1. Move old documentation to `/docs/archive`
2. Move one-time scripts to `/scripts/archive`
3. Move test files to `/tests/archive`
4. Update this document when making structural changes
