# Changelog

All notable changes to Chef's Kiss will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Alphabetical sorting for all category and unit lists in Settings page
- Alphabetical sorting for recipe category dropdowns in List View filter, Create modal, and Edit modal
- Alphabetical sorting for category dropdown in Recipe table inline edit mode
- Automatic alphabetization that maintains order when categories are added, renamed, or toggled

### Fixed
- **Critical Bug**: Fixed category deletion functionality in Settings
  - Corrected malformed SQL query in `deleteRecipeCategory` function
  - Replaced invalid subquery syntax with proper two-step approach (fetch category name, then check usage)
  - Both recipe and ingredient categories can now be deleted when not in use
- Separated recipe and ingredient categories in Create/Edit modals
  - Recipe modals now only show recipe categories
  - Ingredient modals now only show ingredient categories
  - Removed incorrect grouped dropdown logic

### Changed
- Category lists now display in consistent alphabetical order across all interfaces
- Improved category management user experience with predictable ordering

## [0.1.0] - 2026-02-15

### Added
- Initial release of Chef's Kiss Restaurant Resource Planner
- Recipe and ingredient management system
- Category and unit management
- Sales analytics dashboard
- Data import functionality
- User authentication with Manus OAuth
- Responsive dashboard layout
- Dark mode support

---

## Commit Guidelines

When committing changes, please follow these conventions:

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Example
```
fix(categories): correct SQL query in deleteRecipeCategory function

The usage check query was using invalid subquery syntax that prevented
category deletion. Replaced with two-step approach: fetch category name
first, then check for usage in recipes/ingredients.

Fixes #123
```
