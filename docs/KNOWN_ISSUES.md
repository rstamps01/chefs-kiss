# Known Issues & Technical Debt

**Chef's Kiss - Restaurant Resource Planning Platform**

**Last Updated:** December 30, 2024  
**Version:** 0.2.0 (MVP Complete)

---

## Purpose

This document tracks known bugs, limitations, technical debt, and workarounds in the Chef's Kiss platform. Issues are categorized by severity and include workarounds where available.

**Severity Levels:**
- 🔴 **Critical** - Blocks core functionality, must fix immediately
- 🟠 **High** - Significant impact, fix in current sprint
- 🟡 **Medium** - Moderate impact, fix in next sprint
- 🟢 **Low** - Minor impact, fix when convenient

---

## Active Issues

### Security & Authentication

#### ISSUE-001: Dashboard Routes Not Protected

**Severity:** 🔴 Critical  
**Status:** Open  
**Reported:** December 28, 2024

**Description:**
Dashboard pages (Analytics, Forecasting, Prep Planning, etc.) are accessible without authentication. Users can navigate to these pages even when not logged in, though they won't see data.

**Impact:**
- Security risk (low, since no data is exposed)
- Poor user experience (blank pages)
- Violates principle of least privilege

**Reproduction:**
1. Log out of the application
2. Navigate to `/analytics` directly
3. Page loads but shows no data

**Root Cause:**
Pages don't check `isAuthenticated` before rendering.

**Workaround:**
None. Users should not access these pages without logging in.

**Fix:**
Add authentication check to all protected pages:
```typescript
const { isAuthenticated, loading } = useAuth();

if (loading) return <LoadingSpinner />;
if (!isAuthenticated) return <LoginPrompt />;
```

**Estimated Effort:** 2 hours  
**Assigned To:** Unassigned  
**Target:** January 5, 2025

---

#### ISSUE-002: No Session Timeout

**Severity:** 🟡 Medium  
**Status:** Open  
**Reported:** December 28, 2024

**Description:**
User sessions never expire. Once logged in, users remain logged in indefinitely unless they explicitly log out.

**Impact:**
- Security risk on shared devices
- Violates best practices

**Reproduction:**
1. Log in to the application
2. Close browser
3. Reopen browser days later
4. Still logged in

**Root Cause:**
Session cookies have no expiration time set.

**Workaround:**
Users should manually log out when done.

**Fix:**
Set session cookie expiration (e.g., 7 days) in `server/_core/cookies.ts`.

**Estimated Effort:** 1 hour  
**Assigned To:** Unassigned  
**Target:** January 10, 2025

---

### Data & Integration

#### ISSUE-003: No POS API Integration

**Severity:** 🟠 High  
**Status:** Planned  
**Reported:** December 30, 2024

**Description:**
Currently, sales data must be manually imported via CSV. There is no real-time integration with POS systems (Heartland, Toast, Square, etc.).

**Impact:**
- Manual data entry required
- Delayed data availability
- Increased risk of data entry errors
- Cannot leverage real-time sales data for forecasting

**Workaround:**
Use CSV import feature to upload daily sales exports from POS system.

**Fix:**
Implement Heartland/Global Payments REST API integration as Priority 1, followed by other POS systems.

**Estimated Effort:** 2-3 weeks  
**Assigned To:** Unassigned  
**Target:** Q1 2025

---

#### ISSUE-004: No Weather Data Integration

**Severity:** 🟡 Medium  
**Status:** Planned  
**Reported:** December 30, 2024

**Description:**
Weather data is not currently integrated. Forecasting relies solely on historical sales patterns without weather correlation.

**Impact:**
- Lower forecast accuracy (70-80% vs 85-95% with weather)
- Cannot adjust forecasts for weather events
- Missing key external factor in demand prediction

**Workaround:**
None. Forecasts are based on historical patterns only.

**Fix:**
Integrate OpenWeather API for historical and forecast weather data.

**Estimated Effort:** 1-2 weeks  
**Assigned To:** Unassigned  
**Target:** Q1 2025

---

### User Experience

#### ISSUE-005: No Loading Skeletons

**Severity:** 🟢 Low  
**Status:** Open  
**Reported:** December 28, 2024

**Description:**
Application uses generic spinners instead of skeleton screens during data loading. This makes the app feel slower than it actually is.

**Impact:**
- Poor perceived performance
- Less polished user experience

**Workaround:**
None. Spinners work but are not ideal.

**Fix:**
Replace spinners with skeleton screens that match the layout of loaded content.

**Estimated Effort:** 1 week  
**Assigned To:** Unassigned  
**Target:** Q2 2025

---

#### ISSUE-006: Limited Mobile Responsiveness

**Severity:** 🟡 Medium  
**Status:** Open  
**Reported:** December 30, 2024

**Description:**
While the application is functional on mobile devices, the UI is optimized for desktop. Some components (tables, charts, modals) are difficult to use on small screens.

**Impact:**
- Poor mobile user experience
- Difficult to use on tablets
- Limits accessibility for on-the-go users

**Workaround:**
Use desktop or laptop for best experience.

**Fix:**
Implement mobile-first responsive design with touch-friendly UI elements.

**Estimated Effort:** 2-3 weeks  
**Assigned To:** Unassigned  
**Target:** Q2 2025

---

### Testing & Quality

#### ISSUE-007: Low Test Coverage

**Severity:** 🟠 High  
**Status:** Open  
**Reported:** December 30, 2024

**Description:**
Only 1 test file exists (`server/auth.logout.test.ts`). Test coverage is <5%. Critical features like recipe management, unit conversions, and forecasting have no tests.

**Impact:**
- High risk of regressions
- Difficult to refactor with confidence
- Slower development velocity

**Workaround:**
Manual testing before each release.

**Fix:**
Write comprehensive test suite covering:
- Recipe management (CRUD operations)
- Unit conversion system (all conversion types)
- Forecasting algorithms (accuracy validation)
- Data import (CSV parsing and validation)
- Authentication (session management)

**Target Coverage:** 80%+

**Estimated Effort:** 3-4 weeks  
**Assigned To:** Unassigned  
**Target:** Q1 2025

---

#### ISSUE-008: No Error Boundaries

**Severity:** 🟡 Medium  
**Status:** Open  
**Reported:** December 30, 2024

**Description:**
Application does not have error boundaries around major page components. If a component crashes, the entire app becomes unusable.

**Impact:**
- Poor error handling
- Bad user experience during errors
- Difficult to debug production issues

**Workaround:**
None. Refresh page if error occurs.

**Fix:**
Add React error boundaries to all major page components with user-friendly error messages.

**Estimated Effort:** 1 week  
**Assigned To:** Unassigned  
**Target:** Q1 2025

---

### Performance

#### ISSUE-009: No Database Query Optimization

**Severity:** 🟡 Medium  
**Status:** Open  
**Reported:** December 30, 2024

**Description:**
Database queries are not optimized. No indexes on frequently queried columns. No query result caching. Potential N+1 query issues.

**Impact:**
- Slower page loads as data grows
- Higher database load
- Increased hosting costs

**Workaround:**
None. Performance is acceptable with current data volume.

**Fix:**
- Add indexes for performance-critical queries (sales_data.date, recipes.id, ingredients.id)
- Implement query result caching with Redis or in-memory cache
- Use database connection pooling
- Audit queries for N+1 issues

**Estimated Effort:** 1-2 weeks  
**Assigned To:** Unassigned  
**Target:** Q2 2025

---

### Technical Debt

#### ISSUE-010: Multiple Seed Scripts

**Severity:** 🟢 Low  
**Status:** Open  
**Reported:** December 30, 2024

**Description:**
Database seeding requires running multiple scripts in sequence (`seed-ingredients.mjs`, `seed-menu-ingredients.mjs`, `seed-all-recipes.mjs`, `seed-unit-conversions.mjs`, `seed-standard-conversions.mjs`). This is error-prone and difficult to maintain.

**Impact:**
- Confusing for new developers
- Risk of running scripts in wrong order
- No rollback capability

**Workaround:**
Run scripts in correct order as documented.

**Fix:**
Consolidate into single `seed-database.mjs` script with:
- Automatic dependency resolution
- Database transactions for atomicity
- Rollback capability
- Progress logging

**Estimated Effort:** 1 week  
**Assigned To:** Unassigned  
**Target:** Q2 2025

---

## Resolved Issues

### Recipe & Ingredient Management

#### ISSUE-011: Ingredient Unit Display Shows Numeric IDs ✅

**Severity:** 🟠 High  
**Status:** Resolved  
**Reported:** December 29, 2024  
**Resolved:** December 30, 2024

**Description:**
Ingredients tab displayed numeric unit IDs (1, 2, 3) instead of display names (lb, oz, pieces).

**Resolution:**
- Updated `getIngredients()` to LEFT JOIN `ingredientUnits` table
- Modified frontend to display `unitDisplayName` instead of `unit` ID
- Verified all 64 ingredients show correct display names

**Files Changed:**
- `server/db.ts` - Added LEFT JOIN to ingredientUnits
- `client/src/pages/Recipes.tsx` - Updated to use unitDisplayName

---

#### ISSUE-012: Edit Recipe Modal Ingredient Name Overlap ✅

**Severity:** 🟠 High  
**Status:** Resolved  
**Reported:** December 29, 2024  
**Resolved:** December 30, 2024

**Description:**
Long ingredient names (e.g., "Charred Scallion Sauce", "Crab Stick (Kani Kama)") overlapped with Quantity field in Edit Recipe modal.

**Resolution:**
- Replaced flex layout with CSS Grid (`grid-cols-[2fr_1fr_1.5fr_1fr_auto]`)
- Added `truncate` class to ingredient dropdown
- Added calculated cost column for each ingredient
- Adjusted delete button margin for alignment

**Files Changed:**
- `client/src/components/RecipeEditModal.tsx` - Grid layout + cost column

---

#### ISSUE-013: Missing Unit Conversions Warnings ✅

**Severity:** 🔴 Critical  
**Status:** Resolved  
**Reported:** December 29, 2024  
**Resolved:** December 30, 2024

**Description:**
All 59 recipes showed "Missing unit conversions" warnings even though costs were calculating correctly. This was caused by:
1. Unit comparison bug (comparing string vs integer ID)
2. Missing standard conversions (oz→lb, cup→gallon, pieces→lb)
3. Missing weight→count conversions (oz→each for produce)

**Resolution:**
- Fixed unit comparison bug in `getConversionFactor()` by joining `ingredientUnits` table
- Created universal unit conversion system (15 standard conversions)
- Added ingredient-specific conversions (6 special cases)
- Added pieces→lb conversions (19 seafood ingredients)
- Added weight→count conversions (5 produce items)
- Result: 97.6% database reduction (871 → 21 conversions)

**Files Changed:**
- `drizzle/schema.ts` - Added `unitConversions` table
- `server/db.ts` - Updated `getConversionFactor()` with 4-level priority lookup
- `seed-standard-conversions.mjs` - Universal conversions
- `add-pieces-lb-conversions.mjs` - Seafood conversions
- `add-final-conversions.mjs` - Produce conversions

---

#### ISSUE-014: Sashimi-Grade Fish Incorrect Unit Pricing ✅

**Severity:** 🔴 Critical  
**Status:** Resolved  
**Reported:** December 29, 2024  
**Resolved:** December 30, 2024

**Description:**
Sashimi-grade fish (Tuna, Salmon, Yellowtail, Albacore) were stored as $20-25/lb but recipes used "pieces". This caused extremely high costs ($100+ per recipe) and negative margins (-400% to -700%).

**Resolution:**
- Changed fish ingredient units from "lb" to "pieces"
- Adjusted costs from $/lb to $/piece (e.g., $20/lb → $0.75/piece)
- Conversion: $20/lb ÷ 16 oz/lb × 0.60 oz/piece = $0.75/piece
- Result: Recipe costs dropped 87-92%, margins now 56-72%

**Files Changed:**
- `fix-sashimi-units.mjs` - Updated fish units and costs

---

#### ISSUE-015: Ingredient Unit Data Type Mismatch ✅

**Severity:** 🔴 Critical  
**Status:** Resolved  
**Reported:** December 30, 2024  
**Resolved:** December 30, 2024

**Description:**
Ingredients table stored unit names as strings ("lb", "oz", "pieces") instead of unit IDs (integers). This caused LEFT JOIN failures and $0.00 costs for all recipes.

**Resolution:**
- Created `fix-ingredient-units.mjs` script to convert string unit names to integer IDs
- Updated all 63 ingredients with correct unit IDs
- Verified cost calculations working correctly

**Files Changed:**
- `fix-ingredient-units.mjs` - Unit data type conversion script

---

## Limitations

### Current Scope Limitations

1. **Single Location Only**
   - Application currently supports only one restaurant location
   - Multi-location management planned for Q2 2025

2. **No Real-Time Data**
   - All data is imported via CSV or manual entry
   - Real-time POS integration planned for Q1 2025

3. **Simple Forecasting Algorithm**
   - Current forecasting uses historical averages and day-of-week patterns
   - AI forecasting engine (Prophet + XGBoost) planned for Q1 2025
   - Expected accuracy improvement: 70-80% → 85-95%

4. **No Mobile App**
   - Web application only (responsive design)
   - Native mobile app planned for Q3 2025

5. **No Multi-Tenant Support**
   - Application designed for single restaurant/chain
   - Multi-tenant architecture planned for Q4 2025

6. **No API for Third-Party Integrations**
   - No public API for external systems
   - API planned for Q4 2025

---

## Workarounds

### General Workarounds

1. **For POS Data Import:**
   - Export daily sales from POS system as CSV
   - Use Data Import page to upload CSV
   - Map columns to Chef's Kiss fields
   - Import and verify data

2. **For Weather Correlation:**
   - Manually note weather conditions in description field
   - Adjust forecasts based on weather patterns
   - Wait for OpenWeather API integration (Q1 2025)

3. **For Multi-Location:**
   - Create separate Chef's Kiss instance for each location
   - Manually aggregate data across locations
   - Wait for multi-location management (Q2 2025)

4. **For Mobile Access:**
   - Use responsive web app on mobile browser
   - Desktop experience recommended for best results
   - Wait for native mobile app (Q3 2025)

---

## Reporting New Issues

To report a new issue:

1. **Check this document** to see if the issue is already known
2. **Create GitHub Issue** at https://github.com/rstamps01/chefs-kiss/issues
3. **Include the following information:**
   - Clear description of the issue
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots (if applicable)
   - Browser/device information
   - Error messages (if any)

---

**Last Updated:** December 30, 2024  
**Next Review:** January 15, 2025
