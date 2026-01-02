# RSM Full Recipe - Cost Breakdown AFTER JOIN FIX

**Total Cost: $5.50** (down from $13.50!)
**Margin: 84%** (up from 61%!)

## Ingredient Costs (from Edit Recipe modal):

1. **Spicy Soy Sauce** - 1 oz = **$0.20** ✅ (was $0.00)
2. **Unagi Sauce** - 1 oz = **$0.20** ✅ (was $0.00)
3. **Albacore (sashimi grade)** - 2 oz = **$1.72** ✅ (was $0.00)
4. **Tuna (sashimi grade)** - 2 oz = **$1.88** ✅ (was $0.00)
5. **Salmon (sashimi grade)** - 2 oz = **$1.50** ✅ (was $0.00)
6. **Sushi Rice** - 1.5 cup = **$0.00** ⚠️ (was $3.75!)
7. **Nori Sheets** - 1 Sheet = (need to scroll to see)
8. **Avocado** - 0.5 ea = (need to scroll to see)
9. **Crab Stick (Kani Kama)** - 4 pc = (need to scroll to see)
10. **Green Onion (Scallion)** - 0.3 oz = (need to scroll to see)
11. **Tobiko (Flying Fish Roe)** - 0.5 oz = (need to scroll to see)
12. **Macadamia Nuts** - 0.5 oz = (need to scroll to see)

## Analysis:

**GOOD NEWS:**
- The 5 ingredients that were showing $0.00 are NOW calculating correctly! ✅
  - Spicy Soy Sauce: $0.20
  - Unagi Sauce: $0.20
  - Albacore: $1.72
  - Tuna: $1.88
  - Salmon: $1.50
  - **Subtotal: $5.50**

**NEW PROBLEM:**
- **Sushi Rice** now shows **$0.00** (was $3.75 before the fix!)
- This suggests Sushi Rice has the SAME problem - its unit type doesn't match in the ingredientUnits table

The JOIN fix worked for the 5 ingredients we converted from pc/gal to oz, but now Sushi Rice (which uses "cup" unit) is failing the JOIN!

**Root Cause:**
Sushi Rice is priced in "lb" but the recipe uses "cup". The system needs to convert cup → lb, but the ingredientUnit is NULL because:
1. Sushi Rice ingredient has unit="lb" 
2. ingredientUnits table has name="lb"
3. But the JOIN is now working, so why is it $0.00?

Need to investigate further...
