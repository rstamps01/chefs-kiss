# RSM Full Recipe - Complete Ingredient Breakdown

**Recipe Details:**
- Name: RSM Full
- Description: Randy's original signature roll - Tempura'd california roll topped w/ crab, salmon, tuna, albacore, spicy soy, unagi sauce, macadamia nuts, green onions, tobiko
- Servings: 12
- Selling Price: $34.50
- **Total Cost: $13.50**
- **Margin: 61%** ✅

## Ingredient Costs (from Edit Recipe modal):

1. **Green Onion (Scallion)** - 0.3 oz = **$0.30**
2. **Avocado** - 0.5 ea = **$1.00**
3. **Sushi Rice** - 1.5 cup = **$3.75**
4. **Macadamia Nuts** - 0.5 oz = **$0.50**
5. **Tobiko (Flying Fish Roe)** - 0.5 oz = **$1.50**
6. **Crab Stick (Kani Kama)** - 4 pc = **$6.25**
7. **Nori Sheets** - 1 Sheet = **$0.20**
8. **Salmon (sashimi grade)** - 2 oz = **$0.00** ⚠️
9. **Tuna (sashimi grade)** - 2 oz = **$0.00** ⚠️
10. **Albacore (sashimi grade)** - 2 oz = **$0.00** ⚠️
11. **Unagi Sauce** - 1 oz = **$0.00** ⚠️
12. **Spicy Soy Sauce** - 1 oz = **$0.00** ⚠️

**Subtotal from visible costs:** $13.50

## CRITICAL ISSUE IDENTIFIED:

**Five ingredients are showing $0.00 cost:**
1. Salmon (sashimi grade) - 2 oz
2. Tuna (sashimi grade) - 2 oz
3. Albacore (sashimi grade) - 2 oz
4. Unagi Sauce - 1 oz
5. Spicy Soy Sauce - 1 oz

## Expected Costs (based on ingredient pricing):

1. **Salmon (sashimi grade):** $0.75/oz × 2 oz = **$1.50**
2. **Tuna (sashimi grade):** $0.94/oz × 2 oz = **$1.88**
3. **Albacore (sashimi grade):** $0.86/oz × 2 oz = **$1.72**
4. **Unagi Sauce:** $0.20/oz × 1 oz = **$0.20**
5. **Spicy Soy Sauce:** $0.20/oz × 1 oz = **$0.20**

**Expected additional cost:** $5.50

**Expected total cost:** $13.50 + $5.50 = **$19.00**

**Expected margin:** ($34.50 - $19.00) / $34.50 = **45%** (still good, but not 61%)

## Root Cause:

The recipe is showing **$13.50 cost** but **five ingredients are being calculated as $0.00**. This means the reported cost is **UNDER-REPORTING by $5.50** (29% underestimate).

The actual food cost should be **$19.00**, not $13.50.

## Why are these ingredients showing $0.00?

Possible reasons:
1. Recipe uses **oz** unit, but ingredients might still have old unit type in database
2. Conversion logic failing silently for these specific ingredients
3. Database query not returning correct ingredient costs
4. Frontend display issue showing $0.00 when cost calculation fails

## Next Steps:

1. Check ingredient pricing in database for these 5 ingredients
2. Verify unit types match between recipe (oz) and ingredients (should be oz)
3. Check backend cost calculation logic for these ingredients
4. Fix any mismatches or calculation errors
5. Retest recipe cost calculation


## Ingredient Pricing Verification (from Ingredients Tab):

✅ **All 5 ingredients have CORRECT pricing in database:**

1. **Salmon (sashimi grade):** $0.75/oz ✅
2. **Tuna (sashimi grade):** $0.94/oz ✅
3. **Albacore (sashimi grade):** $0.86/oz ✅
4. **Unagi Sauce:** $0.20/oz ✅ (verified earlier)
5. **Spicy Soy Sauce:** $0.20/oz ✅ (verified earlier)

## Conclusion:

**The ingredients have correct pricing in the database, but the recipe Edit modal is showing $0.00 for these 5 ingredients!**

This is a **FRONTEND DISPLAY BUG** or **BACKEND CALCULATION BUG** in the recipe cost calculation logic.

The recipe card shows **$13.50 total cost**, which matches the sum of the 7 ingredients that ARE displaying costs ($0.30 + $1.00 + $3.75 + $0.50 + $1.50 + $6.25 + $0.20 = $13.50).

This means the backend is **NOT including the 5 ingredients with $0.00 display** in the total cost calculation.

## Root Cause Hypothesis:

The recipe uses **oz units** for these 5 ingredients, and all 5 ingredients are priced in **oz**. However, the cost calculation is returning $0.00 for these specific ingredients.

Possible causes:
1. **Database JOIN issue:** Recipe ingredients table not properly joining with ingredients table
2. **NULL cost values:** Cost calculation returning NULL for these specific ingredients
3. **Conversion logic bug:** Even though both are in oz, conversion logic might be failing
4. **Caching issue:** Old data cached before we converted these ingredients to oz pricing

## Next Steps:

1. Check backend code in `server/routers.ts` for recipe cost calculation logic
2. Check database query that fetches recipe ingredients with costs
3. Look for any filtering or WHERE clauses that might exclude these ingredients
4. Check for NULL handling in cost calculation
5. Restart server to clear any caches
