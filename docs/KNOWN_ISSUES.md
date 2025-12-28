# Known Issues

**Chef's Kiss - Restaurant Resource Planning Platform**

**Last Updated:** December 28, 2024  
**Version:** 0.1.0 (MVP)

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

### User Experience

#### ISSUE-003: No Loading Skeletons

**Severity:** 🟡 Medium  
**Status:** Open  
**Reported:** December 28, 2024

**Description:**
Pages show blank white screens while data is loading. No loading skeletons or spinners to indicate progress.

**Impact:**
- Poor user experience
- Users may think app is broken

**Reproduction:**
1. Navigate to any data-driven page (Analytics, Recipes, etc.)
2. Observe blank screen for 1-2 seconds
3. Data appears suddenly

**Root Cause:**
No loading state UI implemented.

**Workaround:**
None. Users must wait for data to load.

**Fix:**
Add skeleton components for all data-loading pages using shadcn/ui Skeleton component.

**Estimated Effort:** 4 hours  
**Assigned To:** Unassigned  
**Target:** January 12, 2025

---

#### ISSUE-004: No Error Boundaries

**Severity:** 🟠 High  
**Status:** Open  
**Reported:** December 28, 2024

**Description:**
If a React component throws an error, the entire app crashes with a white screen. No error boundary to catch and display errors gracefully.

**Impact:**
- Poor user experience
- Hard to debug issues
- Users lose all context

**Reproduction:**
1. Trigger a runtime error in any component
2. Entire app crashes
3. Must refresh page to recover

**Root Cause:**
No error boundaries implemented in component tree.

**Workaround:**
Refresh the page.

**Fix:**
Wrap main app and route components in ErrorBoundary component.

**Estimated Effort:** 2 hours  
**Assigned To:** Unassigned  
**Target:** January 8, 2025

---

#### ISSUE-005: Form Validation Messages Not User-Friendly

**Severity:** 🟢 Low  
**Status:** Open  
**Reported:** December 28, 2024

**Description:**
Form validation error messages are technical and not user-friendly. For example, "Expected number, received nan" instead of "Please enter a valid number".

**Impact:**
- Poor user experience
- Users may not understand errors

**Reproduction:**
1. Go to Add Recipe form
2. Enter invalid data (e.g., text in price field)
3. See technical error message

**Root Cause:**
Using default Zod error messages without customization.

**Workaround:**
Users can infer what's wrong from context.

**Fix:**
Customize Zod error messages with user-friendly text.

**Estimated Effort:** 2 hours  
**Assigned To:** Unassigned  
**Target:** January 15, 2025

---

### Data & Database

#### ISSUE-006: No Data Validation on Ingredient Quantities

**Severity:** 🟡 Medium  
**Status:** Open  
**Reported:** December 28, 2024

**Description:**
Users can enter negative quantities for ingredients in recipes. No validation prevents this.

**Impact:**
- Data integrity issue
- Could cause calculation errors

**Reproduction:**
1. Go to Add Recipe form
2. Add ingredient with quantity = -5
3. Form accepts it

**Root Cause:**
Zod schema only checks for `number()`, not `positive()`.

**Workaround:**
Don't enter negative quantities.

**Fix:**
Update Zod schema to use `.positive()` for quantity fields.

**Estimated Effort:** 30 minutes  
**Assigned To:** Unassigned  
**Target:** January 5, 2025

---

#### ISSUE-007: Decimal Fields Stored as Strings

**Severity:** 🟢 Low  
**Status:** Open (By Design)  
**Reported:** December 28, 2024

**Description:**
Decimal fields (prices, quantities) are stored as strings in the database and returned as strings from API.

**Impact:**
- Requires parsing on frontend
- Slightly confusing for developers

**Reproduction:**
1. Query `recipes.list`
2. `sellingPrice` is returned as string "12.00" not number 12.00

**Root Cause:**
MySQL DECIMAL type is returned as string by Drizzle ORM to avoid floating-point precision issues.

**Workaround:**
Parse strings to numbers on frontend: `parseFloat(price)`.

**Fix:**
This is by design to preserve precision. Document in API reference.

**Estimated Effort:** N/A (no fix needed)  
**Assigned To:** N/A  
**Target:** N/A

---

### Performance

#### ISSUE-008: No Database Indexes

**Severity:** 🟡 Medium  
**Status:** Open  
**Reported:** December 28, 2024

**Description:**
Database tables have no indexes beyond primary keys. Queries will be slow at scale.

**Impact:**
- Slow queries with large datasets
- Poor performance at scale

**Reproduction:**
Not reproducible with current small dataset.

**Root Cause:**
Indexes not added during schema creation.

**Workaround:**
None needed for MVP (small dataset).

**Fix:**
Add indexes to frequently queried columns:
- `sales_data.date`
- `sales_data.location_id`
- `weather_data.date`
- `forecasts.forecast_date`

**Estimated Effort:** 2 hours  
**Assigned To:** Unassigned  
**Target:** Phase 2 (after MVP)

---

#### ISSUE-009: No Query Result Caching

**Severity:** 🟢 Low  
**Status:** Open  
**Reported:** December 28, 2024

**Description:**
tRPC queries are not cached. Same data is fetched multiple times unnecessarily.

**Impact:**
- Slower page loads
- Higher database load

**Reproduction:**
1. Navigate to Recipes page
2. Open browser DevTools Network tab
3. Navigate away and back to Recipes
4. Same query is executed again

**Root Cause:**
tRPC React Query cache not configured optimally.

**Workaround:**
None needed for MVP.

**Fix:**
Configure tRPC React Query with appropriate `staleTime` and `cacheTime` settings.

**Estimated Effort:** 1 hour  
**Assigned To:** Unassigned  
**Target:** Phase 2

---

### UI/UX

#### ISSUE-010: Mobile Navigation Not Optimized

**Severity:** 🟡 Medium  
**Status:** Open  
**Reported:** December 28, 2024

**Description:**
Sidebar navigation doesn't collapse on mobile. Takes up too much screen space.

**Impact:**
- Poor mobile experience
- Hard to use on phone

**Reproduction:**
1. Open app on mobile device (or resize browser to mobile width)
2. Sidebar takes up half the screen
3. Content area is cramped

**Root Cause:**
DashboardLayout doesn't have mobile-responsive sidebar.

**Workaround:**
Use desktop or tablet.

**Fix:**
Add hamburger menu for mobile that collapses sidebar.

**Estimated Effort:** 4 hours  
**Assigned To:** Unassigned  
**Target:** January 20, 2025

---

#### ISSUE-011: No Empty States

**Severity:** 🟢 Low  
**Status:** Open  
**Reported:** December 28, 2024

**Description:**
Pages with no data show blank screens. No empty state messages or calls-to-action.

**Impact:**
- Confusing for new users
- Missed opportunity to guide users

**Reproduction:**
1. Create new account (no data)
2. Navigate to Recipes page
3. See blank screen (should say "No recipes yet. Add your first recipe!")

**Root Cause:**
No empty state components implemented.

**Workaround:**
Users can infer they need to add data.

**Fix:**
Add empty state components with helpful messages and CTAs.

**Estimated Effort:** 3 hours  
**Assigned To:** Unassigned  
**Target:** January 15, 2025

---

## Limitations

### LIMIT-001: Single Location Only (UI)

**Type:** Feature Limitation  
**Status:** By Design (MVP)

**Description:**
UI only supports single location. Database schema supports multiple locations, but no location switcher in UI.

**Impact:**
- Can't onboard multi-location restaurants in MVP
- Users with multiple locations must wait for Phase 2

**Workaround:**
Create separate account for each location (not ideal).

**Plan:**
Add location switcher in Phase 2 (February 2025).

---

### LIMIT-002: CSV Import Only (No Direct POS API)

**Type:** Feature Limitation  
**Status:** By Design (MVP)

**Description:**
Users must manually export CSV from POS and upload. No direct API integration with POS systems.

**Impact:**
- Manual step for users
- Data may be stale
- Less "automated" than competitors

**Workaround:**
Export CSV from POS system and upload.

**Plan:**
Add direct POS API integrations in Phase 2 (Toast, Square, Clover).

---

### LIMIT-003: No Offline Support

**Type:** Technical Limitation  
**Status:** By Design

**Description:**
App requires internet connection. No offline functionality.

**Impact:**
- Can't use in kitchen without WiFi
- Poor experience in low-connectivity areas

**Workaround:**
Ensure reliable internet connection.

**Plan:**
May add PWA offline support in future, but not a priority.

---

### LIMIT-004: English Only

**Type:** Feature Limitation  
**Status:** By Design (MVP)

**Description:**
UI and AI insights are English-only. No internationalization.

**Impact:**
- Can't serve non-English speaking markets
- Limits addressable market

**Workaround:**
None.

**Plan:**
Add Spanish support in Phase 3 (if demand exists).

---

## Technical Debt

### DEBT-001: No Comprehensive Test Coverage

**Severity:** 🟡 Medium  
**Status:** Acknowledged

**Description:**
Only auth tests exist. No tests for recipes, database queries, or frontend components.

**Impact:**
- Higher risk of regressions
- Harder to refactor confidently

**Plan:**
Add tests incrementally:
1. Database queries (Priority 1)
2. tRPC procedures (Priority 2)
3. Frontend components (Priority 3)

**Target:** Ongoing (10% coverage increase per sprint)

---

### DEBT-002: Hardcoded Restaurant ID

**Severity:** 🟢 Low  
**Status:** Acknowledged

**Description:**
Some code assumes single restaurant and hardcodes restaurant ID or doesn't filter by restaurant.

**Impact:**
- Will break with multi-restaurant support
- Data leakage risk (low, since each user has one restaurant)

**Plan:**
Audit code and fix before adding multi-restaurant support.

**Target:** Before Phase 2

---

### DEBT-003: No Logging or Monitoring

**Severity:** 🟡 Medium  
**Status:** Acknowledged

**Description:**
No structured logging. No error monitoring (Sentry, etc.). Hard to debug production issues.

**Impact:**
- Can't diagnose production issues
- No visibility into errors

**Plan:**
Add logging and monitoring in Phase 2.

**Target:** February 2025

---

### DEBT-004: No API Rate Limiting

**Severity:** 🟢 Low  
**Status:** Acknowledged

**Description:**
No rate limiting on API endpoints. Vulnerable to abuse.

**Impact:**
- Could be abused (DOS attack)
- Higher costs

**Plan:**
Add rate limiting before public launch.

**Target:** Before Phase 2

---

## Resolved Issues

### ISSUE-RESOLVED-001: Chef Logo Had Grey Background

**Severity:** 🟡 Medium  
**Status:** Resolved  
**Resolved:** December 28, 2024

**Description:**
Chef logo had grey circular background that didn't match UI.

**Resolution:**
Removed background using AI-powered background removal. Logo now has transparent background.

**Fixed By:** Development Team

---

## Issue Reporting

**How to report a new issue:**

1. Check if issue already exists in this document
2. Reproduce the issue consistently
3. Gather details:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots (if applicable)
4. Add entry to this document using template below
5. Assign severity level
6. Notify team

**Template:**
```markdown
#### ISSUE-XXX: Issue Title

**Severity:** 🔴/🟠/🟡/🟢  
**Status:** Open | In Progress | Resolved  
**Reported:** YYYY-MM-DD

**Description:**
What is the issue?

**Impact:**
How does this affect users?

**Reproduction:**
1. Step 1
2. Step 2
3. Observe issue

**Root Cause:**
Why does this happen?

**Workaround:**
Temporary solution (if any).

**Fix:**
How to fix permanently.

**Estimated Effort:** X hours  
**Assigned To:** Name  
**Target:** Date
```

---

**Document Maintenance:**
- Update this document when new issues are discovered
- Move resolved issues to "Resolved Issues" section
- Review open issues weekly
- Prioritize fixes based on severity and impact

**Last Reviewed:** December 28, 2024  
**Next Review:** January 5, 2025
