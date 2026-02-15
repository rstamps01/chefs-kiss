# Seafood Ingredients Requiring LB → OZ Conversion

## Summary
Found **15 seafood/fish ingredients** currently using pound (lb) pricing that need to be converted to ounce (oz) pricing for consistency with the mathjs conversion system.

## Complete List of Seafood Ingredients to Convert

### Fish & Seafood (15 items)

1. **Smoked Salmon** - $20.00/lb → $1.25/oz
2. **Cooked Salmon** - $15.00/lb → $0.9375/oz
3. **Salmon Belly** - $28.00/lb → $1.75/oz
4. **Salmon** (regular, not sashimi) - $15.00/lb → $0.9375/oz
5. **Tuna (Ahi)** - $18.00/lb → $1.125/oz
6. **Snow Crab** - $21.00/lb → $1.3125/oz
7. **Crab Stick (Kani Kama)** - $25.00/lb → $1.5625/oz
8. **Soft-Shell Crab** - $30.00/lb → $1.875/oz
9. **Shrimp Tempura** - $20.00/lb → $1.25/oz
10. **Cooked Shrimp (Ebi)** - $13.00/lb → $0.8125/oz
11. **Shrimp (cooked)** - $16.00/lb → $1.00/oz
12. **Eel (Unagi)** - $29.00/lb → $1.8125/oz

### Already Converted (No Action Needed)
- **Scallops (Hokkaido Hotate)** - $1.20/oz ✅
- **Test Shrimp** - $0.75/oz ✅

### Already Using Piece Pricing (No Conversion Needed)
- **Albacore (sashimi grade)** - $0.86/pc ✅
- **Yellowtail (sashimi grade)** - $0.94/pc ✅
- **Tuna (sashimi grade)** - $0.94/pc ✅
- **Salmon (sashimi grade)** - $0.75/pc ✅

## Conversion Formula
For all lb → oz conversions:
- **cost_per_oz = cost_per_lb ÷ 16**
- Example: $20.00/lb ÷ 16 = $1.25/oz

## Database Update Required
For each ingredient above:
1. Update `costPerUnit` field (divide by 16)
2. Update `unit` field from 3 (lb) to 2 (oz)

## Piece Weight Definitions Needed
Add to `server/unitConversion.ts` INGREDIENT_PIECE_WEIGHTS:

```typescript
const INGREDIENT_PIECE_WEIGHTS: Record<string, number> = {
  // Existing
  'Scallops (Hokkaido Hotate)': 1.5,
  'Test Shrimp': 0.5,
  
  // New additions (estimated standard weights)
  'Smoked Salmon': 1.0,        // 1 oz per slice
  'Cooked Salmon': 1.5,         // 1.5 oz per piece
  'Salmon Belly': 2.0,          // 2 oz per piece
  'Salmon': 1.5,                // 1.5 oz per piece
  'Tuna (Ahi)': 1.5,            // 1.5 oz per piece
  'Snow Crab': 2.0,             // 2 oz per piece
  'Crab Stick (Kani Kama)': 0.75, // 0.75 oz per stick
  'Soft-Shell Crab': 3.0,       // 3 oz per crab
  'Shrimp Tempura': 0.5,        // 0.5 oz per piece
  'Cooked Shrimp (Ebi)': 0.5,   // 0.5 oz per piece
  'Shrimp (cooked)': 0.5,       // 0.5 oz per piece
  'Eel (Unagi)': 1.5,           // 1.5 oz per piece
};
```

## Non-Seafood Ingredients (Not Converting)
These also use lb pricing but are NOT seafood, so we'll leave them as-is:
- Fried Tofu (Inari) - $5.00/lb
- Cream Cheese - $3.00/lb
- New York Steak (Sliced) - $15.00/lb
- Sesame Seeds - $6.00/lb
- Ginger (Pickled) - $8.00/lb
- Wasabi Paste - $25.00/lb
- Sushi Rice - $2.50/lb

These ingredients are typically purchased and measured by weight in restaurant operations, so lb pricing makes sense for them.
