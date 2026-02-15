# Piece-Based Fish Ingredient Pricing Analysis

## Date: 2026-01-02

## Problem Identified
User reported that some fish ingredients are still priced by piece (pc) instead of ounce (oz), which is inconsistent with the planned oz-based pricing implementation.

## Fish Ingredients Using PIECE (pc) Pricing - INCONSISTENT ⚠️

1. **Albacore (sashimi grade)** - $0.86/pc
   - Category: Fish & Seafood
   - Should be: $0.86/oz (assuming this is the intended per-ounce cost)
   
2. **Yellowtail (sashimi grade)** - $0.94/pc
   - Category: Fish & Seafood
   - Should be: $0.94/oz
   
3. **Tuna (sashimi grade)** - $0.94/pc
   - Category: Fish & Seafood
   - Should be: $0.94/oz
   
4. **Salmon (sashimi grade)** - $0.75/pc
   - Category: Fish & Seafood
   - Should be: $0.75/oz

## Fish Ingredients Using OUNCE (oz) Pricing - CORRECT ✅

1. **Smoked Salmon** - $1.25/oz ✅
2. **Cooked Salmon** - $0.94/oz ✅
3. **Snow Crab** - $1.31/oz ✅
4. **Crab Stick (Kani Kama)** - $1.56/oz ✅
5. **Soft-Shell Crab** - $1.88/oz ✅
6. **Shrimp Tempura** - $1.25/oz ✅
7. **Cooked Shrimp (Ebi)** - $0.81/oz ✅
8. **Eel (Unagi)** - $1.81/oz ✅
9. **Scallops (Hokkaido Hotate)** - $1.20/oz ✅
10. **Salmon Belly** - $1.75/oz ✅
11. **Shrimp (cooked)** - $1.00/oz ✅
12. **Salmon** - $0.94/oz ✅

## Analysis

### The Inconsistency
- **4 sashimi-grade fish** are priced by piece (pc)
- **12 other seafood ingredients** are correctly priced by ounce (oz)
- This creates confusion in recipe cost calculations

### Why This Matters
1. **Piece weight definitions exist** in unitConversion.ts (e.g., 1.5 oz/piece for salmon)
2. **Recipes use pieces** (e.g., "2 pieces of salmon nigiri")
3. **Current system calculates**: 2 pieces × $0.75/piece = $1.50
4. **Should calculate**: 2 pieces × 1.5 oz/piece × $0.75/oz = $2.25

### Root Cause
These 4 ingredients were likely created with piece-based pricing before the oz-based pricing strategy was implemented. They need to be converted to match the rest of the seafood ingredients.

## Recommended Fix

Convert the 4 piece-based fish ingredients to oz-based pricing:

1. **Albacore (sashimi grade)**: Change unit from (pc) to (oz), keep cost at $0.86/oz
2. **Yellowtail (sashimi grade)**: Change unit from (pc) to (oz), keep cost at $0.94/oz
3. **Tuna (sashimi grade)**: Change unit from (pc) to (oz), keep cost at $0.94/oz
4. **Salmon (sashimi grade)**: Change unit from (pc) to (oz), keep cost at $0.75/oz

**Assumption**: The current costs ($0.75, $0.86, $0.94) represent the intended **per-ounce** costs, not per-piece costs. This assumption is based on:
- Similar pricing to other oz-based fish ($0.94/oz for Cooked Salmon, Salmon)
- Industry-standard sashimi pricing is typically per ounce
- Piece-based pricing would be much higher (e.g., $1.50-2.00 per piece)

## Impact on Recipes

After conversion, recipes using these ingredients will calculate costs correctly:
- **Before**: 2 pieces × $0.75/piece = $1.50
- **After**: 2 pieces × 1.5 oz/piece × $0.75/oz = $2.25

This will increase recipe costs for dishes using sashimi-grade fish, which is more accurate to real-world costs.
