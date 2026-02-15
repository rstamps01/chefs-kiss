# Changelog

All notable changes to Chef's Kiss Restaurant Resource Planner will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - 2026-02-15

#### CSV Import/Export Enhancements
- **ID Column Support**: Added ID columns to all CSV exports (Ingredients, Recipes, Recipe Ingredients) for precise re-import matching
- **Upsert Logic**: Implemented intelligent upsert functionality - updates existing entries when ID or name matches, creates new entries otherwise
- **Full-Screen Preview Modal**: Converted CSV preview modal to full-screen layout (100vw × 100vh) for better data visibility
- **Batch Query Optimization**: Optimized duplicate detection from O(n) individual queries to O(1) batch query, reducing preview time from timeout to <1 second for 115-row files
- **HTTP 414 Fix**: Changed CSV preview from GET to POST requests to handle large file uploads without URL length errors
- **Updated Templates**: All CSV templates now include optional ID column matching export structure

#### UI/UX Improvements
- **ID Display**: Added ingredient and recipe IDs to both tile and list views in Recipe Management for easy reference
- **Export Filter Fix**: Fixed frontend export to always include ID column regardless of table visibility settings
- **Modal Layout**: Improved CSV preview modal with horizontal scrolling, proper action button visibility, and 98% viewport width

#### Performance & Testing
- **5 Passing Tests**: Comprehensive vitest coverage for upsert logic (ingredients and recipes)
- **Database Optimization**: Single batch query for duplicate detection instead of per-row queries
- **Error Handling**: Added try-catch blocks and user-friendly error messages in CSV preview

### Fixed - 2026-02-15
- CSV preview endpoint returning HTML errors due to URL length limits (HTTP 414)
- Duplicate ingredient/recipe creation on re-import (now updates existing entries)
- Missing ID column in ingredient CSV exports
- CSV preview modal too narrow, causing text overlap and inaccessible buttons
- Dialog component CSS override preventing full-screen modal display
- Frontend filtering out ID column from exports

### Changed - 2026-02-15
- CSV preview endpoints changed from `query` to `mutation` (GET → POST) for large file support
- Modal width increased from 95vw to 98vw, then to full-screen (100vw × 100vh)
- Table scrolling improved with fixed headers and action buttons
- Import logic now matches by name when no ID provided, enabling bulk updates

## [Previous Versions]

See git history for changes prior to 2026-02-15.
