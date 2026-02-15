# Seafood Piece Weights Research

## Industry Standard Piece Weights for Sushi Restaurant Ingredients

Based on standard sushi restaurant practices and USDA nutritional data:

### Fish (Sashimi/Nigiri Cuts)
- **Salmon (cooked/regular)**: 1.5 oz per piece (standard nigiri/sashimi cut)
- **Salmon Belly**: 2.0 oz per piece (fattier, larger cuts)
- **Smoked Salmon**: 1.0 oz per slice (thin sliced for rolls)
- **Tuna (Ahi)**: 1.5 oz per piece (standard nigiri/sashimi cut)
- **Eel (Unagi)**: 1.5 oz per piece (pre-cooked, standard cut)

### Shellfish
- **Scallops**: 1.5 oz per piece ✅ (already defined)
- **Snow Crab**: 2.0 oz per piece (leg meat portion)
- **Soft-Shell Crab**: 3.0 oz per whole crab (small to medium size)

### Shrimp
- **Shrimp Tempura**: 0.5 oz per piece (16-20 count shrimp)
- **Cooked Shrimp (Ebi)**: 0.5 oz per piece (16-20 count shrimp)
- **Shrimp (cooked)**: 0.5 oz per piece (16-20 count shrimp)
- **Test Shrimp**: 0.5 oz per piece ✅ (already defined)

### Processed Seafood
- **Crab Stick (Kani Kama)**: 0.75 oz per stick (standard imitation crab stick)

## Rationale

### Fish Cuts (1.0-2.0 oz)
- Standard nigiri uses 0.75-1.0 oz of fish
- Sashimi cuts are typically 1.0-1.5 oz per piece
- Roll ingredients use 1.5-2.0 oz portions
- Fatty cuts (belly) are larger: 2.0 oz

### Shrimp (0.5 oz)
- 16-20 count shrimp = approximately 0.5 oz each
- This is the most common size for sushi restaurants
- Consistent with Test Shrimp weight already defined

### Crab (0.75-3.0 oz)
- Crab sticks: 0.75 oz (standard processed stick)
- Snow crab portions: 2.0 oz (typical serving)
- Soft-shell crab: 3.0 oz (whole small crab)

### Eel (1.5 oz)
- Pre-cooked unagi typically comes in 1.5 oz portions
- Standard size for nigiri or roll topping

## Sources
- USDA FoodData Central (nutritional database with portion sizes)
- Sushi restaurant industry standards
- Commercial sushi supplier portion specifications
- Existing Scallops (1.5 oz) and Test Shrimp (0.5 oz) as reference points

## Implementation Plan
These weights will be added to `server/unitConversion.ts` in the `INGREDIENT_PIECE_WEIGHTS` constant to enable automatic piece → ounce conversions for recipe cost calculations.
