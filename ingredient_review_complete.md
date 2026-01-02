# Complete Ingredient Review - Fish & Meat Products

## Current View (Top of List)

### Fish & Seafood - Already Using Piece (pc) Pricing ✅
1. **Albacore (sashimi grade)** - $0.86/pc - Fish & Seafood
2. **Yellowtail (sashimi grade)** - $0.94/pc - Fish & Seafood
3. **Tuna (sashimi grade)** - $0.94/pc - Fish & Seafood
4. **Salmon (sashimi grade)** - $0.75/pc - Fish & Seafood

### Fish & Seafood - Already Converted to OZ ✅
5. **Test Shrimp** - $0.75/oz - Fish & Seafood (test ingredient)

### Other Ingredients Visible
6. **Macadamia Nuts** - $1.00/oz - Toppings & Garnishes
7. **Sweet Egg (Tamago)** - $5.00/oz - Roe & Eggs
8. **Ikura (Salmon Eggs)** - $5.00/oz - Roe & Eggs
9. **Tobiko (Flying Fish Roe)** - $3.00/oz - Roe & Eggs

## Analysis So Far

### ✅ GOOD: Piece-Based Pricing (No Conversion Needed)
The sashimi-grade fish (Albacore, Yellowtail, Tuna, Salmon) are already priced per piece, which is ideal for sushi restaurants. These don't need conversion because:
- Recipes use them in pieces
- They're already priced per piece
- No unit conversion needed (pc → pc is direct)

### ✅ GOOD: Already Using OZ Pricing
- Test Shrimp: $0.75/oz
- Macadamia Nuts: $1.00/oz
- Sweet Egg (Tamago): $5.00/oz
- Ikura (Salmon Eggs): $5.00/oz
- Tobiko (Flying Fish Roe): $3.00/oz

### 🔍 NEED TO SCROLL DOWN
Need to continue scrolling to find:
1. Any remaining fish/seafood using LB pricing
2. Meat products (beef, chicken, pork) - especially "New York Steak" mentioned in Surf's Up recipe
3. Other protein ingredients

## Next Steps
1. Scroll down through entire ingredient list
2. Document ALL fish and meat products
3. Identify any using LB pricing that need conversion
4. Check for specialty items (crab meat, processed seafood, etc.)


## Complete Ingredient List Review (After Full Scroll)

### Fish & Seafood Products - Summary

#### ✅ Already Using Piece (pc) Pricing - NO CONVERSION NEEDED
1. Albacore (sashimi grade) - $0.86/pc
2. Yellowtail (sashimi grade) - $0.94/pc
3. Tuna (sashimi grade) - $0.94/pc
4. Salmon (sashimi grade) - $0.75/pc

#### ✅ Already Converted to OZ Pricing - COMPLETED
1. Smoked Salmon - $1.25/oz ✅
2. Cooked Salmon - $0.9375/oz ✅
3. Snow Crab - $1.3125/oz ✅
4. Crab Stick (Kani Kama) - $1.5625/oz ✅
5. Soft-Shell Crab - $1.875/oz ✅
6. Shrimp Tempura - $1.25/oz ✅
7. Cooked Shrimp (Ebi) - $0.8125/oz ✅
8. Eel (Unagi) - $1.8125/oz ✅
9. Scallops (Hokkaido Hotate) - $1.20/oz ✅
10. Salmon Belly - $1.75/oz ✅
11. Shrimp (cooked) - $1.00/oz ✅
12. Salmon - $0.9375/oz ✅
13. Tuna (Ahi) - $1.125/oz ✅
14. Test Shrimp - $0.75/oz ✅ (test ingredient)

### Meat Products Found

#### ⚠️ New York Steak (Sliced) - $15.00/lb
- Category: Specialty Items
- Unit: lb (pound)
- Used in: Surf's Up recipe
- **REQUIRES INVESTIGATION:** Need to check how it's measured in recipes

### Other Protein/Egg Products (Already Using OZ or EA)
- Sweet Egg (Tamago) - $5.00/oz ✅
- Ikura (Salmon Eggs) - $5.00/oz ✅
- Tobiko (Flying Fish Roe) - $3.00/oz ✅
- Quail Egg - $0.75/ea ✅

### Non-Protein Ingredients Using LB (NOT Converting)
These are NOT fish/meat, so we're leaving them as-is:
- Fried Tofu (Inari) - $5.00/lb (Dairy & Other)
- Cream Cheese - $3.00/lb (Dairy & Other)
- Sesame Seeds - $6.00/lb (Ingredient)
- Ginger (Pickled) - $8.00/lb (Ingredient)
- Wasabi Paste - $25.00/lb (Ingredient)
- Sushi Rice - $2.50/lb (Ingredient)

### Produce/Garnishes Using EA (Each)
- Habanero Tobiko - $3.50/ea
- Shiitake Mushroom - $1.50/ea
- Fresh Cilantro - $0.50/ea
- Micro Cilantro - $2.00/ea
- Shishito Pepper - $0.50/ea
- Green Onion (Scallion) - $1.00/ea

### Toppings Using CUP
- Sweet Potato Crisps - $1.00/cup
- Tempura Crunch - $1.00/cup

## CONCLUSION

### ✅ ALL SEAFOOD CONVERTED SUCCESSFULLY
All 12+ seafood ingredients have been successfully converted from lb to oz pricing. No additional seafood conversions needed.

### ⚠️ ONE MEAT PRODUCT REQUIRES DECISION
**New York Steak (Sliced)** - $15.00/lb
- This is the ONLY meat product in the database
- Used in Surf's Up recipe
- Need to check recipe to see if it uses weight-based or piece-based measurements
- If recipe uses oz measurements, should convert to oz pricing
- If recipe uses lb measurements, can leave as-is

### 📋 NEXT STEP
Check Surf's Up recipe to see how New York Steak is measured, then decide if conversion is needed.


## Phase 2 Complete: Categorization

### Summary of Findings

**FISH & SEAFOOD:** ✅ All 14 seafood ingredients already converted to oz or pc pricing. No additional conversions needed.

**MEAT PRODUCTS:** ⚠️ **1 CRITICAL ISSUE FOUND**

#### New York Steak (Sliced) - REQUIRES IMMEDIATE CONVERSION

**Current State:**
- Ingredient pricing: $15.00/lb
- Recipe usage: 3 pieces (pc) in Surf's Up recipe
- Current cost calculation: $45.00 (INCORRECT!)
- Recipe margin: -196% (unprofitable due to wrong cost)

**Problem:**
The system is trying to convert 3 pieces → pounds, but there's NO piece weight defined for New York Steak. This causes massive cost inflation.

**Solution Required:**
1. Research standard piece weight for sliced steak in sushi rolls
2. Add piece weight to unitConversion.ts
3. Convert ingredient from $15.00/lb to oz pricing
4. Retest Surf's Up recipe

---

## Phase 3: Research Piece Weights for New York Steak

### Industry Standards for Sliced Steak in Sushi Rolls

**New York Steak (Sliced) for Sushi Rolls:**
- **Typical slice weight:** 2.0-3.0 oz per slice
- **Standard portion:** 2-3 slices per roll
- **Reasoning:**
  - Sushi rolls with beef typically use thin-sliced, seared steak
  - Each slice should be substantial enough to cover the roll
  - 2.5 oz is a good middle ground for premium rolls
  - Matches typical protein portions in specialty rolls

**Recommended Piece Weight:** 2.5 oz per slice

### Cost Calculation Verification

**Current (WRONG):**
- 3 pieces × ??? = $45.00 (system likely treating as 3 lb)

**After Conversion (CORRECT):**
- Ingredient: $15.00/lb ÷ 16 = $0.9375/oz
- Recipe: 3 pieces × 2.5 oz/piece × $0.9375/oz = **$7.03**
- **Cost reduction: $37.97 savings!**
- **New margin:** ($22.25 - $7.03 adjusted cost) / $22.25 = **Much better!**

(Note: Need to recalculate with all ingredients to get exact margin)
