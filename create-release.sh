#!/bin/bash
# Quick script to create and push v0.2.0 release tag

set -e  # Exit on error

echo "🚀 Creating Release v0.2.0 for Chef's Kiss"
echo "==========================================="
echo ""

# Navigate to project directory
cd /home/ubuntu/restaurant-resource-planner

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "❌ Error: Not a git repository"
    exit 1
fi

echo "📝 Adding new documentation files..."
git add CHANGELOG.md COMMIT_MESSAGE.txt GITHUB_EXPORT_INSTRUCTIONS.md RELEASE_NOTES_v0.2.0.md CREATE_RELEASE_TAG.md create-release.sh

echo "💾 Committing documentation updates..."
git commit -m "docs: add release documentation for v0.2.0

- Added CHANGELOG.md with version history
- Added RELEASE_NOTES_v0.2.0.md with detailed release information
- Added CREATE_RELEASE_TAG.md with tagging instructions
- Updated README.md with category management improvements"

echo "📤 Pushing commits to GitHub..."
git push origin main

echo "🏷️  Creating annotated tag v0.2.0..."
git tag -a v0.2.0 -m "Release v0.2.0: Category Management Improvements

✨ New Features:
- Alphabetical sorting for all category and unit lists
- Automatic sorting maintenance when categories are modified

🐛 Bug Fixes:
- Fixed critical category deletion bug in deleteRecipeCategory function
- Corrected malformed SQL query preventing category deletion

🔧 Improvements:
- Separated recipe and ingredient categories in Create/Edit modals
- Updated documentation with comprehensive CHANGELOG.md

See RELEASE_NOTES_v0.2.0.md for complete details."

echo "📤 Pushing tag to GitHub..."
git push origin v0.2.0

echo "🎉 Creating GitHub release..."
gh release create v0.2.0 \
  --title "v0.2.0 - Category Management Improvements" \
  --notes-file RELEASE_NOTES_v0.2.0.md

echo ""
echo "✅ Release v0.2.0 created successfully!"
echo "🔗 View at: https://github.com/rstamps01/chefs-kiss/releases/tag/v0.2.0"
