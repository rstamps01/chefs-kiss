# Release Notes - Chef's Kiss v0.2.0

**Release Date**: February 15, 2026

**Release Type**: Feature Release + Critical Bug Fix

---

## 🎯 Overview

Version 0.2.0 brings significant improvements to category management throughout Chef's Kiss, including automatic alphabetical sorting across all interfaces and a critical bug fix that restores category deletion functionality.

---

## ✨ New Features

### Alphabetical Sorting System
All category and unit lists now display in consistent alphabetical order (A-Z) throughout the application:

- **Settings Page**: Recipe categories, ingredient categories, and ingredient units automatically sort alphabetically
- **Recipe Management**: Category dropdowns in List View filter, Create modal, and Edit modal display in A-Z order
- **Table Inline Editing**: Category dropdown in recipe table edit mode shows alphabetized options
- **Dynamic Updates**: Sorting automatically maintains order when categories are added, renamed, or toggled active/inactive

**Benefits**:
- Improved user experience with predictable, consistent ordering
- Faster category location in long lists
- Reduced cognitive load when managing multiple categories

---

## 🐛 Critical Bug Fixes

### Category Deletion Functionality Restored

**Issue**: Categories could not be deleted from Settings, even when not in use by any recipes or ingredients.

**Root Cause**: Malformed SQL query in `deleteRecipeCategory` function used invalid subquery syntax that prevented proper usage checking.

**Solution**: Replaced with proper two-step approach:
1. Fetch category name from database
2. Check if category is used in any recipes/ingredients
3. Delete if unused, or return error with usage information

**Impact**: Both recipe and ingredient categories can now be successfully deleted when not in use.

---

## 🔧 Improvements

### Category Type Separation

Recipe and ingredient categories are now properly separated in Create/Edit modals:
- Recipe modals only show recipe categories
- Ingredient modals only show ingredient categories
- Removed incorrect grouped dropdown logic that mixed category types

**Benefits**:
- Clearer user interface
- Reduced confusion when selecting categories
- Better data organization

---

## 📝 Technical Details

### Files Modified
- `server/db.ts` - Fixed deleteRecipeCategory SQL query
- `client/src/components/CategoriesUnitsManager.tsx` - Added alphabetical sorting
- `client/src/pages/Recipes.tsx` - Sorted category filter dropdown
- `client/src/components/RecipeCreateModal.tsx` - Sorted category dropdown
- `client/src/components/RecipeEditModal.tsx` - Sorted category dropdown
- `client/src/components/RecipesTableView.tsx` - Sorted table category dropdown

### Database Changes
No schema changes required. All improvements are code-level enhancements.

---

## 🧪 Testing

All features have been tested and verified:
- ✅ Alphabetical sorting in Settings for all lists
- ✅ Alphabetical sorting in all recipe category dropdowns
- ✅ Category deletion for unused recipe categories
- ✅ Category deletion for unused ingredient categories
- ✅ Proper error handling when categories are in use
- ✅ Category type separation in modals

---

## 📦 Upgrade Instructions

### From v0.1.0 to v0.2.0

1. **Pull latest code**
   ```bash
   git pull origin main
   git checkout v0.2.0
   ```

2. **Install dependencies** (if needed)
   ```bash
   pnpm install
   ```

3. **No database migration required** - all changes are code-level

4. **Restart development server**
   ```bash
   pnpm dev
   ```

---

## 🔜 What's Next?

Future improvements planned for v0.3.0:
- Category usage counts in Settings
- Bulk category reassignment tool
- Category merge functionality
- Confirmation dialogs before deletion
- Category color coding system

---

## 🙏 Acknowledgments

Special thanks to the testing team for identifying the category deletion bug and providing detailed feedback on the sorting requirements.

---

## 📞 Support

For questions or issues:
- GitHub Issues: https://github.com/rstamps01/chefs-kiss/issues
- Documentation: See README.md and CHANGELOG.md
- Support: https://help.manus.im
