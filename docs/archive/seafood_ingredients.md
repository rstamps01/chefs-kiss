# Seafood Ingredients Analysis

Based on the Ingredients tab view, here are the seafood ingredients currently in the database:

## Fish & Seafood Ingredients (Currently Visible)

1. **Albacore (sashimi grade)** - $0.86/pc - Unit: (pc)
2. **Yellowtail (sashimi grade)** - $0.94/pc - Unit: (pc)
3. **Tuna (sashimi grade)** - $0.94/pc - Unit: (pc)
4. **Salmon (sashimi grade)** - $0.75/pc - Unit: (pc)
5. **Test Shrimp** - $0.75/oz - Unit: (oz) ✅ ALREADY CONVERTED
6. **Scallops (Hokkaido Hotate)** - $1.20/oz - Unit: (oz) ✅ ALREADY CONVERTED (from previous session)

## Observations

### Already Using Oz-Based Pricing:
- Test Shrimp: $0.75/oz ✅
- Scallops: $1.20/oz ✅ (converted in previous session)

### Using Piece-Based Pricing:
- Albacore: $0.86/pc
- Yellowtail: $0.94/pc
- Tuna: $0.94/pc
- Salmon: $0.75/pc

**Note:** These fish are already priced per piece, which is actually the ideal state! They don't need conversion to oz-based pricing because:
1. Recipes use them in pieces (e.g., "2 pieces of salmon")
2. They're already priced per piece
3. No unit conversion is needed (pc → pc is direct)

### Need to Scroll to See More Ingredients

The page shows "Search ingredients..." which suggests there are more ingredients below. Need to scroll down to see if there are any other seafood ingredients using lb-based pricing that need conversion.

## Action Plan

1. Scroll down to see all remaining ingredients
2. Identify any seafood ingredients still using lb (pound) pricing
3. Convert those to oz-based pricing
4. Update piece weight definitions for any new seafood types
