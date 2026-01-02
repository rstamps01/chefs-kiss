# Sushi Rice Cost Calculation Fix

## Problem

Sushi Rice cost was being calculated incorrectly in all recipes using cup measurements.

**Symptoms:**
- RSM Full showed $19.00 cost (should be $16.77)
- Sushi Rice ingredient cost: $3.75 for 1.5 cups (should be $1.52)
- Console errors: "Failed to convert 0.1 cup to oz"
- "Missing unit conversions" warnings on recipes

## Root Cause

The mathjs library does NOT support volume-to-weight conversions (cup → lb or cup → oz) because these conversions require ingredient-specific density information.

**The Issue:**
- Sushi Rice priced at $2.50/lb in database
- Recipes use Sushi Rice in cups (e.g., 1.5 cups)
- System tried to convert 1.5 cups → lb, which failed
- System defaulted to treating 1.5 cups as 1.5 lb, giving $3.75 cost (1.5 × $2.50)

## Solution

Added ingredient-specific cup-to-ounce conversion support in `server/unitConversion.ts`:

1. Created `ingredientCupWeights` dictionary mapping ingredient names to oz/cup values
2. Added `getIngredientCupWeight()` function to look up cup weights
3. Added special handling for "cup" unit conversions (similar to existing "pc" handling)
4. Defined Sushi Rice: 1 cup = 6.5 oz (standard culinary measurement)

**Code Changes:**
```typescript
const ingredientCupWeights: Record<string, number> = {
  'Sushi Rice': 6.5,  // 1 cup cooked sushi rice = 6.5 oz
};

// In convertUnit() function:
if (fromUnit.toLowerCase() === 'cup') {
  if (ingredientName) {
    const cupWeight = getIngredientCupWeight(ingredientName);
    if (cupWeight !== null) {
      const valueInOz = value * cupWeight;
      // Convert oz to target unit (e.g., lb)
      return convertOzToTarget(valueInOz, toUnit);
    }
  }
  return null; // Cannot convert without ingredient-specific data
}
```

## Results

**RSM Full Recipe:**
- BEFORE: $19.00 cost, 49% margin
- AFTER: $16.77 cost, 51% margin
- Savings: $2.23 per recipe (12% cost reduction)

**Sushi Rice Cost (1.5 cups):**
- BEFORE: $3.75 (treating 1.5 cups as 1.5 lb)
- AFTER: $1.52 (1.5 cups × 6.5 oz/cup × $0.156/oz)
- Savings: $2.23 (59% reduction)

**Calculation:**
- 1.5 cups × 6.5 oz/cup = 9.75 oz
- 9.75 oz ÷ 16 oz/lb = 0.609 lb
- 0.609 lb × $2.50/lb = $1.52 ✅

## Impact

All recipes using Sushi Rice now calculate correctly:
- RSM Full: $16.77 cost, 51% margin ✅
- RSM Half: $8.37 cost, 66% margin ✅
- Geisha Girl: $10.72 cost, 56% margin ✅
- Shishito-Kamikaze: $8.60 cost, 64% margin ✅
- Pizza Maki Roll: $22.62 cost, -21% margin (improved from -29%)

## Future Enhancements

Consider adding cup weights for other ingredients that use cup measurements:
- Sauces (Ponzu, Spicy Mayo, Sriracha, etc.)
- Other grains (quinoa, couscous, etc.)
- Vegetables (diced onions, chopped peppers, etc.)

Each ingredient requires research to determine accurate oz/cup conversion based on preparation method (raw, cooked, diced, etc.).
