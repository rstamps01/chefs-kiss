import { create, all, Unit, MathJsInstance } from 'mathjs';

// Create mathjs instance with all functions
const math: MathJsInstance = create(all);

// Track initialized custom units to avoid duplicates
const initializedUnits = new Set<string>();

// Piece weights are now stored in the database (ingredients.piece_weight_oz column)
// This allows users to configure piece weights through the UI instead of hardcoding them here

// Store ingredient-specific cup weights (oz per cup)
// Used for automatic cup → ounce conversions in recipe cost calculations
// Note: Cup conversions are ingredient-specific because volume-to-weight requires density
const ingredientCupWeights: Record<string, number> = {
  'Sushi Rice': 6.5,                   // 1 cup cooked sushi rice = 6.5 oz (standard culinary measurement)
};

/**
 * Get the weight in ounces for one piece of an ingredient
 * Now accepts the piece weight directly from the database instead of looking up a hardcoded dictionary
 * 
 * @param pieceWeightOz - Weight in ounces per piece from database (nullable)
 * @returns Weight in ounces per piece, or null if not defined
 * 
 * @example
 * getIngredientPieceWeight(1.5) // returns 1.5
 * getIngredientPieceWeight(null) // returns null
 * getIngredientPieceWeight(0) // returns null (invalid weight)
 */
export function getIngredientPieceWeight(pieceWeightOz: number | null | undefined): number | null {
  // Handle null, undefined, zero, and negative values
  if (pieceWeightOz == null || pieceWeightOz <= 0) {
    return null;
  }
  return pieceWeightOz;
}

/**
 * Get the weight in ounces for one cup of an ingredient
 * Supports exact name matching for ingredient-specific cup weights
 * 
 * @param ingredientName - Name of the ingredient (must match exactly)
 * @returns Weight in ounces per cup, or null if not defined
 * 
 * @example
 * getIngredientCupWeight('Sushi Rice') // returns 6.5
 * getIngredientCupWeight('Unknown Ingredient') // returns null
 */
export function getIngredientCupWeight(ingredientName: string): number | null {
  return ingredientCupWeights[ingredientName] ?? null;
}

/**
 * Initialize custom ingredient-specific units
 * This is now a no-op since we handle piece conversions dynamically
 */
export function initializeCustomIngredientUnits() {
  console.log('[UnitConversion] Using dynamic ingredient piece weight conversions');
}

/**
 * Convert a quantity from one unit to another
 * Supports automatic multi-step conversions (e.g., pieces → oz → lb)
 * Special handling for ingredient-specific piece conversions using database values
 * 
 * @param value - Numeric value to convert
 * @param fromUnit - Source unit (e.g., 'pc', 'oz', 'cup')
 * @param toUnit - Target unit (e.g., 'lb', 'kg', 'ml')
 * @param pieceWeightOz - Optional piece weight from database (for pc conversions)
 * @param ingredientName - Optional ingredient name (for cup conversions only)
 * @returns Converted value or null if conversion fails
 */
export function convertUnit(
  value: number,
  fromUnit: string,
  toUnit: string,
  pieceWeightOz?: number | null,
  ingredientName?: string
): number | null {
  try {
    // Handle same-unit case (no conversion needed)
    if (fromUnit === toUnit) {
      return value;
    }

    // Handle unsupported units that should be treated as "each" (no conversion)
    const unsupportedUnits = ['each', 'ea'];
    if (unsupportedUnits.includes(fromUnit.toLowerCase()) || unsupportedUnits.includes(toUnit.toLowerCase())) {
      // If both are unsupported or same conceptually, return as-is
      if (unsupportedUnits.includes(fromUnit.toLowerCase()) && unsupportedUnits.includes(toUnit.toLowerCase())) {
        return value;
      }
      // Cannot convert between "each" and weight/volume units without ingredient-specific data
      return null;
    }

    // Special handling for "cup" conversions
    if (fromUnit.toLowerCase() === 'cup') {
      console.log(`[UnitConversion] DEBUG: Converting ${value} cup for ingredient: "${ingredientName || 'unknown'}"`);
      if (ingredientName) {
        const cupWeight = getIngredientCupWeight(ingredientName);
        console.log(`[UnitConversion] DEBUG: Cup weight lookup result: ${cupWeight}`);
        if (cupWeight !== null) {
          // Convert cups to ounces first
          const valueInOz = value * cupWeight;
          console.log(`[UnitConversion] DEBUG: ${value} cup × ${cupWeight} oz/cup = ${valueInOz} oz`);
          // Then convert ounces to target unit
          const ozQuantity: Unit = math.unit(valueInOz, 'oz');
          const converted: Unit = ozQuantity.to(toUnit);
          const result = converted.toNumber(toUnit);
          console.log(`[UnitConversion] DEBUG: ${valueInOz} oz → ${result} ${toUnit}`);
          return result;
        }
      }
      // If no ingredient name or cup weight not found, cannot convert "cup"
      console.warn(`[UnitConversion] Cannot convert "cup" without ingredient-specific weight data for: ${ingredientName || 'unknown ingredient'}`);
      return null;
    }

    // Special handling for "pc" (pieces) conversions
    const pieceUnits = ['pc', 'piece', 'pieces'];
    if (pieceUnits.includes(fromUnit.toLowerCase())) {
      console.log(`[UnitConversion] DEBUG: Converting ${value} pc with pieceWeightOz: ${pieceWeightOz}`);
      const pieceWeight = getIngredientPieceWeight(pieceWeightOz);
      if (pieceWeight !== null) {
        console.log(`[UnitConversion] DEBUG: Piece weight lookup result: ${pieceWeight}`);
        {
          // Convert pieces to ounces first
          const valueInOz = value * pieceWeight;
          console.log(`[UnitConversion] DEBUG: ${value} pc × ${pieceWeight} oz/pc = ${valueInOz} oz`);
          // Then convert ounces to target unit
          const ozQuantity: Unit = math.unit(valueInOz, 'oz');
          const converted: Unit = ozQuantity.to(toUnit);
          const result = converted.toNumber(toUnit);
          console.log(`[UnitConversion] DEBUG: ${valueInOz} oz → ${result} ${toUnit}`);
          return result;
        }
      }
      // If no ingredient name or piece weight not found, cannot convert "pc"
      console.warn(`[UnitConversion] Cannot convert "pc" without ingredient-specific weight data for: ${ingredientName || 'unknown ingredient'}`);
      return null;
    }

    // Standard mathjs conversion
    const quantity: Unit = math.unit(value, fromUnit);
    const converted: Unit = quantity.to(toUnit);
    return converted.toNumber(toUnit);
  } catch (error) {
    console.error(`[UnitConversion] Failed to convert ${value} ${fromUnit} to ${toUnit}:`, error);
    return null;
  }
}

/**
 * Evaluate a unit expression string
 * Useful for complex calculations like "2 scallop_piece + 4 oz"
 * 
 * @param expression - Math expression with units (e.g., "2 scallop_piece to lb")
 * @returns Evaluated result or null if evaluation fails
 */
export function evaluateUnitExpression(expression: string): number | null {
  try {
    const result = math.evaluate(expression);
    
    // Handle Unit type results
    if (typeof result === 'object' && 'toNumber' in result) {
      return (result as Unit).toNumber();
    }
    
    // Handle numeric results
    if (typeof result === 'number') {
      return result;
    }
    
    console.warn(`[UnitConversion] Unexpected result type from expression: ${expression}`);
    return null;
  } catch (error) {
    console.error(`[UnitConversion] Failed to evaluate expression "${expression}":`, error);
    return null;
  }
}

/**
 * Calculate ingredient cost by converting recipe quantity to storage unit
 * 
 * @param quantity - Amount used in recipe
 * @param recipeUnit - Unit used in recipe (e.g., 'scallop_piece', 'oz')
 * @param storageUnit - Unit used for ingredient storage/purchasing (e.g., 'lb')
 * @param costPerStorageUnit - Cost per storage unit (e.g., $19.20/lb)
 * @returns Total ingredient cost or null if conversion fails
 */
export function calculateIngredientCost(
  quantity: number,
  recipeUnit: string,
  storageUnit: string,
  costPerStorageUnit: number
): number | null {
  // Convert recipe quantity to storage unit
  const convertedQuantity = convertUnit(quantity, recipeUnit, storageUnit);
  
  if (convertedQuantity === null) {
    console.warn(
      `[UnitConversion] Cannot calculate cost: failed to convert ${quantity} ${recipeUnit} to ${storageUnit}`
    );
    return null;
  }
  
  // Calculate cost
  const cost = convertedQuantity * costPerStorageUnit;
  
  console.log(
    `[UnitConversion] Cost calculation: ${quantity} ${recipeUnit} = ${convertedQuantity.toFixed(4)} ${storageUnit} × $${costPerStorageUnit}/${storageUnit} = $${cost.toFixed(2)}`
  );
  
  return cost;
}

/**
 * Check if two units are compatible for conversion
 * 
 * @param unit1 - First unit
 * @param unit2 - Second unit
 * @returns true if units can be converted between each other
 */
export function areUnitsCompatible(unit1: string, unit2: string): boolean {
  try {
    const qty = math.unit(1, unit1);
    qty.to(unit2);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the base unit type for a given unit (e.g., 'mass', 'volume', 'length')
 * 
 * @param unit - Unit to check
 * @returns Base unit type or null if unknown
 */
export function getUnitType(unit: string): string | null {
  try {
    const qty = math.unit(1, unit);
    const baseUnits = qty.toSI().units;
    
    if (baseUnits.length === 0) {
      return 'dimensionless';
    }
    
    // Determine type from base units
    const firstUnit = baseUnits[0];
    if (firstUnit.unit.name === 'kg') return 'mass';
    if (firstUnit.unit.name === 'm' && firstUnit.power === 3) return 'volume';
    if (firstUnit.unit.name === 'm') return 'length';
    
    return 'unknown';
  } catch {
    return null;
  }
}

// Initialize custom units on module load
initializeCustomIngredientUnits();
