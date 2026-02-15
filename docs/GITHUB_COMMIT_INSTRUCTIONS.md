# GitHub Commit Instructions

## Session Work Summary (2026-02-15)

This session completed major enhancements to the CSV import/export system, including:
- Upsert logic for intelligent duplicate handling
- Full-screen preview modal with performance optimization
- ID column support across all exports and templates
- UI improvements for better data visibility

## Files Changed

### New Files
- `CHANGELOG.md` - Complete changelog for this session
- `server/import.upsert.test.ts` - Upsert logic tests (5 passing)
- `server/ingredients-export-id.test.ts` - Export ID column tests
- `server/csv-export-actions-column.test.ts` - Export filtering tests

### Modified Files
- `server/db.ts` - Upsert logic in bulkUpdateIngredients and bulkUpdateRecipes
- `server/routers.ts` - Changed preview endpoints from query to mutation
- `server/csv-helpers.ts` - Added ID column filtering for exports
- `server/csv-preview-helpers.ts` - Batch query optimization for duplicate detection
- `server/csv-templates.ts` - Added ID columns to all templates
- `client/src/components/CSVPreviewModal.tsx` - Full-screen modal layout
- `client/src/components/IngredientsTableView.tsx` - ID column display and export fix
- `client/src/components/RecipesTableView.tsx` - ID column visibility
- `client/src/pages/Recipes.tsx` - ID badges in tile views
- `todo.md` - All completed tasks marked, session summary added

## How to Commit to GitHub

### Option 1: Using Manus Management UI (Recommended)

1. Open the **Management UI** panel (right side of the interface)
2. Navigate to **Settings** → **GitHub**
3. Click **"Export to GitHub"**
4. Select repository owner: `rstamps01`
5. Repository name: `chefs-kiss`
6. The system will automatically push all changes

### Option 2: Manual Git Commands

If you prefer manual control, run these commands in the project directory:

```bash
cd /home/ubuntu/restaurant-resource-planner

# Add the GitHub remote (if not already added)
git remote add github https://github.com/rstamps01/chefs-kiss.git

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: CSV import/export enhancements with upsert logic

- Add ID columns to all CSV exports and templates
- Implement intelligent upsert logic (update by ID/name, create if new)
- Optimize preview with batch queries (115 rows in <1s)
- Convert preview modal to full-screen layout
- Fix HTTP 414 errors by changing preview to POST
- Add ID display to all recipe/ingredient views
- Add 13 passing tests for upsert and export logic

Fixes: duplicate creation, missing IDs, preview timeouts, modal layout issues"

# Push to GitHub
git push github main
```

### Option 3: Create GitHub Pull Request

If you want to review changes before merging:

```bash
# Create a new branch
git checkout -b feature/csv-import-export-enhancements

# Stage and commit
git add .
git commit -m "feat: CSV import/export enhancements with upsert logic"

# Push to GitHub
git push github feature/csv-import-export-enhancements

# Then create a Pull Request on GitHub web interface
```

## Commit Message Template

If you want to customize the commit message, use this template:

```
feat: [Brief description]

[Detailed description of changes]

Changes:
- [Change 1]
- [Change 2]
- [Change 3]

Fixes: [List of bugs fixed]
Tests: [Number of tests added/passing]
```

## Verification

After committing, verify the changes on GitHub:
1. Visit https://github.com/rstamps01/chefs-kiss
2. Check the latest commit matches your local changes
3. Review the CHANGELOG.md to confirm all changes are documented

---

**Note**: The current git remote is configured for Manus internal storage. You'll need to add the GitHub remote manually or use the Management UI export feature.
