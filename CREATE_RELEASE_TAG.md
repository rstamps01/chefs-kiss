# How to Create Release Tag v0.2.0

## Option 1: Using GitHub CLI (Recommended)

If you have GitHub CLI (`gh`) installed and authenticated:

```bash
# Navigate to project directory
cd /home/ubuntu/restaurant-resource-planner

# Create and push annotated tag
git tag -a v0.2.0 -m "Release v0.2.0: Category Management Improvements

- Alphabetical sorting for all category and unit lists
- Fixed critical category deletion bug
- Separated recipe and ingredient categories in modals
- Updated documentation with CHANGELOG.md

See RELEASE_NOTES_v0.2.0.md for full details."

# Push tag to GitHub
git push origin v0.2.0

# Create GitHub release from tag
gh release create v0.2.0 \
  --title "v0.2.0 - Category Management Improvements" \
  --notes-file RELEASE_NOTES_v0.2.0.md
```

## Option 2: Using Git Commands Only

```bash
# Navigate to project directory
cd /home/ubuntu/restaurant-resource-planner

# Create annotated tag
git tag -a v0.2.0 -m "Release v0.2.0: Category Management Improvements"

# Push tag to remote
git push origin v0.2.0
```

Then manually create the release on GitHub.com:
1. Go to https://github.com/rstamps01/chefs-kiss/releases
2. Click "Draft a new release"
3. Select tag: v0.2.0
4. Release title: "v0.2.0 - Category Management Improvements"
5. Copy content from RELEASE_NOTES_v0.2.0.md into description
6. Click "Publish release"

## Option 3: Using GitHub Web Interface Only

1. **Navigate to repository**
   - Go to https://github.com/rstamps01/chefs-kiss

2. **Create new release**
   - Click "Releases" (right sidebar)
   - Click "Draft a new release"

3. **Configure release**
   - Click "Choose a tag"
   - Type: `v0.2.0`
   - Click "Create new tag: v0.2.0 on publish"
   - Target: `main` branch

4. **Add release information**
   - Release title: `v0.2.0 - Category Management Improvements`
   - Description: Copy content from `RELEASE_NOTES_v0.2.0.md`

5. **Publish**
   - Click "Publish release"

## Verify Release

After creating the release, verify:

```bash
# Check local tags
git tag -l

# Check remote tags
git ls-remote --tags origin

# View tag details
git show v0.2.0
```

Or visit:
- https://github.com/rstamps01/chefs-kiss/releases/tag/v0.2.0
- https://github.com/rstamps01/chefs-kiss/tags

## Tag Message

```
Release v0.2.0: Category Management Improvements

✨ New Features:
- Alphabetical sorting for all category and unit lists
- Automatic sorting maintenance when categories are modified

🐛 Bug Fixes:
- Fixed critical category deletion bug in deleteRecipeCategory function
- Corrected malformed SQL query preventing category deletion

🔧 Improvements:
- Separated recipe and ingredient categories in Create/Edit modals
- Updated documentation with comprehensive CHANGELOG.md

📝 Documentation:
- Added RELEASE_NOTES_v0.2.0.md
- Updated README.md with new features
- Created detailed COMMIT_MESSAGE.txt

See RELEASE_NOTES_v0.2.0.md for complete details.
```

## Semantic Versioning

This release follows [Semantic Versioning](https://semver.org/):
- **v0.2.0** = MINOR version (new features, backward compatible)
- Format: MAJOR.MINOR.PATCH
- Next patch: v0.2.1 (bug fixes only)
- Next minor: v0.3.0 (new features)
- Next major: v1.0.0 (breaking changes)
