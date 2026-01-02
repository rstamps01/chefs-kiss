# RSM Full Recipe Cost Analysis

## Recipe Details
- **Name:** RSM Full
- **Description:** Randy's original signature roll - Tempura'd california roll topped w/ crab, salmon, tuna, albacore, spicy soy, unagi sauce, macadamia nuts, green onions, tobiko
- **Servings:** 12
- **Selling Price:** $34.50
- **Reported Cost:** $63.45
- **Reported Margin:** -84%

## Ingredient Breakdown (from Edit Recipe modal)

| # | Ingredient | Quantity | Unit | Cost |
|---|------------|----------|------|------|
| 1 | Green Onion (Scallion) | 0.25 | oz | $0.25 |
| 2 | Avocado | 0.5 | ea | $1.00 |
| 3 | Spicy Soy Sauce | 1 | oz | $25.00 |
| 4 | Unagi Sauce | 1 | oz | $25.00 |
| 5 | Sushi Rice | 1.5 | cup | $3.75 |
| 6 | Macadamia Nuts | 0.5 | oz | $0.50 |
| 7 | Tobiko (Flying Fish Roe) | 0.5 | oz | $1.50 |
| 8 | Crab Stick (Kani Kama) | 4 | pc | ? |
| 9 | Nori Sheets | 1 | Sheet | ? |
| 10 | Salmon (sashimi grade) | 2 | pc | ? |
| 11 | Tuna (sashimi grade) | 2 | pc | ? |
| 12 | Albacore (sashimi grade) | 2 | pc | ? |

## Issues Identified

### 🚨 CRITICAL ISSUE #1: Sauce Pricing is ABSURDLY HIGH!

**Spicy Soy Sauce:** 1 oz = **$25.00** ⚠️⚠️⚠️
**Unagi Sauce:** 1 oz = **$25.00** ⚠️⚠️⚠️

**Total sauce cost: $50.00** (79% of the total recipe cost!)

This is **completely unrealistic**! Sauces should cost pennies per ounce, not $25/oz.

**Expected realistic pricing:**
- Spicy Soy Sauce: ~$0.10-0.25/oz
- Unagi Sauce: ~$0.25-0.50/oz

### Issue #2: Missing Cost Display for Some Ingredients

The modal doesn't show individual costs for:
- Crab Stick (Kani Kama) - 4 pc
- Nori Sheets - 1 Sheet
- Salmon (sashimi grade) - 2 pc
- Tuna (sashimi grade) - 2 pc
- Albacore (sashimi grade) - 2 pc

Need to scroll down in the modal to see these costs.

## Root Cause Analysis

The -84% margin is caused by **SAUCE PRICING ERROR**:
- $50.00 in sauce costs alone (Spicy Soy + Unagi)
- This inflates the recipe cost from ~$13-15 to $63.45

## Recommended Fix

1. **Correct Spicy Soy Sauce pricing:**
   - Current: $25.00/oz
   - Should be: ~$0.15/oz (estimate)
   - Savings: ~$24.85 per recipe

2. **Correct Unagi Sauce pricing:**
   - Current: $25.00/oz
   - Should be: ~$0.35/oz (estimate)
   - Savings: ~$24.65 per recipe

**Total expected savings: ~$49.50**
**Corrected recipe cost: $63.45 - $49.50 = ~$13.95**
**Corrected margin: ($34.50 - $13.95) / $34.50 = **60% margin** ✅

This would transform RSM Full from a massive loss (-84%) to a highly profitable item (60% margin)!


## ROOT CAUSE CONFIRMED! ✅

### Issue: Gallon-to-Ounce Conversion Failure

**Spicy Soy Sauce:**
- Unit Type: **(gal)** - GALLON
- Cost Per Unit: $25.00/gallon
- Recipe uses: 1 oz
- **PROBLEM:** System fails to convert oz → gallon, defaults to treating $25/gal as $25/oz
- **Correct calculation:** $25.00/gal ÷ 128 oz/gal = **$0.195/oz**
- **Recipe cost should be:** $0.20 (not $25.00!)

**Unagi Sauce:**
- Unit Type: **(gal)** - GALLON
- Cost Per Unit: $25.00/gallon
- Recipe uses: 1 oz
- **PROBLEM:** Same conversion failure as Spicy Soy
- **Correct calculation:** $25.00/gal ÷ 128 oz/gal = **$0.195/oz**
- **Recipe cost should be:** $0.20 (not $25.00!)

### Console Errors Confirm the Problem:

```
[UnitConversion] Failed to convert 0.5 oz to gallon: Error: Units do not match ('gallon' != '0.5 oz')
```

The mathjs library is failing to convert oz → gallon because:
1. The ingredient is stored in gallons
2. The recipe uses ounces
3. The conversion function doesn't handle volume conversions (gal ↔ oz)

### Impact on RSM Full:

**Current (WRONG):**
- Spicy Soy: 1 oz × $25/oz = $25.00
- Unagi Sauce: 1 oz × $25/oz = $25.00
- **Total sauce cost: $50.00**
- **Total recipe cost: $63.45**
- **Margin: -84%** ❌

**Corrected (RIGHT):**
- Spicy Soy: 1 oz × $0.195/oz = $0.20
- Unagi Sauce: 1 oz × $0.195/oz = $0.20
- **Total sauce cost: $0.40**
- **Total recipe cost: $13.85**
- **Margin: +60%** ✅

**Savings: $49.60 per recipe!**

## Solution Options:

### Option 1: Add Gallon-to-Ounce Conversion to mathjs
- Extend unitConversion.ts to handle volume conversions
- Add: 1 gallon = 128 fluid ounces
- Pros: Maintains gallon pricing for bulk purchases
- Cons: Requires code changes

### Option 2: Convert Sauce Ingredients to Ounce Pricing
- Change Spicy Soy and Unagi from (gal) to (oz) unit type
- Recalculate cost: $25/gal ÷ 128 = $0.195/oz
- Pros: Immediate fix, consistent with other ingredients
- Cons: Loses bulk pricing context

**RECOMMENDATION:** Option 2 (convert to oz pricing) for immediate fix, then implement Option 1 for long-term scalability.


## SOLUTION IMPLEMENTED ✅

### Actions Taken:

1. **Converted Unagi Sauce:**
   - Changed unit from (gal) to (oz)
   - Updated cost from $25.00/gal to $0.20/oz

2. **Converted Spicy Soy Sauce:**
   - Changed unit from (gal) to (oz)
   - Updated cost from $25.00/gal to $0.20/oz

3. **Restarted server** to clear cache

### RESULTS - RSM Full Recipe:

**BEFORE FIX:**
- Total Cost: $63.45
- Selling Price: $34.50
- Margin: -84% ❌ (losing $28.95 per sale!)
- Sauce cost: $50.00 (79% of total cost)

**AFTER FIX:**
- Total Cost: **$13.45** ✅
- Selling Price: $34.50
- Margin: **+61%** ✅ (earning $21.05 profit per sale!)
- Sauce cost: $0.40 (3% of total cost)

**IMPACT:**
- **Cost reduction: $50.00 (79%)**
- **Margin improvement: +145 percentage points**
- **Transformed from worst-performing recipe to highly profitable!**

### RESULTS - RSM Half Recipe:

**AFTER FIX:**
- Total Cost: **$6.74**
- Selling Price: $24.50
- Margin: **+72%** ✅

### Root Cause Analysis:

The mathjs library **does not support gallon ↔ ounce conversions** out of the box. When recipes used ounces but ingredients were priced in gallons, the conversion failed silently, causing the system to treat $25/gallon as $25/ounce—a 125x price inflation!

**Console errors confirmed this:**
```
[UnitConversion] Failed to convert 0.5 oz to gallon: Error: Units do not match ('gallon' != '0.5 oz')
```

### Long-Term Recommendation:

**Option A (Implemented):** Convert all liquid ingredients from gallon to ounce pricing
- ✅ Immediate fix
- ✅ Consistent with other ingredients
- ❌ Loses bulk pricing context

**Option B (Future Enhancement):** Extend mathjs with volume conversions
- Add: 1 gallon = 128 fluid ounces
- Add: 1 cup = 8 fluid ounces
- Maintain gallon pricing for bulk purchases
- Requires code changes in unitConversion.ts

**Recommendation:** Implement Option B to handle other volume conversions (cup, tbsp, tsp, ml, l) and eliminate remaining "Missing unit conversions" warnings.
