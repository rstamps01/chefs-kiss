# RSM Full Recipe - COMPLETE Cost Breakdown AFTER JOIN FIX

**Total Reported Cost: $5.50**
**Actual Cost (manual calculation): $11.50**
**Price: $34.50**
**Reported Margin: 84%**
**Actual Margin: 67%**

## Complete Ingredient Costs (from Edit Recipe modal):

1. **Spicy Soy Sauce** - 1 oz = **$0.20** ✅ (FIXED from $0.00)
2. **Unagi Sauce** - 1 oz = **$0.20** ✅ (FIXED from $0.00)
3. **Albacore (sashimi grade)** - 2 oz = **$1.72** ✅ (FIXED from $0.00)
4. **Tuna (sashimi grade)** - 2 oz = **$1.88** ✅ (FIXED from $0.00)
5. **Salmon (sashimi grade)** - 2 oz = **$1.50** ✅ (FIXED from $0.00)
6. **Sushi Rice** - 1.5 cup = **$0.00** ⚠️ (BROKEN - was $3.75, should be ~$3.75)
7. **Nori Sheets** - 1 Sheet = **$0.00** ⚠️ (should be ~$0.20)
8. **Avocado** - 0.5 ea = **$0.00** ⚠️ (should be ~$1.00)
9. **Crab Stick (Kani Kama)** - 4 pc = **$0.00** ⚠️ (should be ~$6.25)
10. **Green Onion (Scallion)** - 0.3 oz = **$0.00** ⚠️ (should be ~$0.30)
11. **Tobiko (Flying Fish Roe)** - 0.5 oz = **$0.00** ⚠️ (should be ~$1.50)
12. **Macadamia Nuts** - 0.5 oz = **$0.00** ⚠️ (should be ~$0.50)

**Subtotal of ingredients showing $0.00: $13.50** (estimated)
**Subtotal of ingredients with costs: $5.50**
**Expected total: $19.00**

## Analysis:

### GOOD NEWS ✅
The JOIN fix worked! The 5 ingredients we converted (Spicy Soy Sauce, Unagi Sauce, Albacore, Tuna, Salmon) now calculate correctly.

### BAD NEWS ⚠️
**7 ingredients are now showing $0.00 cost** (were working before the JOIN fix):
- Sushi Rice (cup → lb conversion)
- Nori Sheets (Sheet unit)
- Avocado (ea unit)
- Crab Stick (pc → oz conversion)
- Green Onion (oz unit - should work!)
- Tobiko (oz unit - should work!)
- Macadamia Nuts (oz unit - should work!)

### ROOT CAUSE HYPOTHESIS:

The JOIN fix changed from:
```typescript
.leftJoin(ingredientUnits, eq(ingredients.unit, ingredientUnits.id))
```
to:
```typescript
.leftJoin(ingredientUnits, eq(ingredients.unit, ingredientUnits.name))
```

This assumes `ingredients.unit` stores the UNIT NAME (like "oz", "lb", "cup").

But I suspect some ingredients still have `ingredients.unit` storing the old INTEGER ID instead of the string name!

**The database migration was incomplete** - when we converted ingredients via the UI, only SOME ingredients got their unit column updated to string names. Others still have integer IDs.

### SOLUTION:

Need to check the `ingredients` table to see which ingredients have integer IDs vs string names in the `unit` column, then update ALL ingredients to use string names consistently.
