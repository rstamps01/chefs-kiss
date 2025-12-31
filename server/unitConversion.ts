import { create, all, Unit, MathJsInstance } from 'mathjs';

// Create mathjs instance with all functions
const math: MathJsInstance = create(all);

// Track initialized custom units to avoid duplicates
const initializedUnits = new Set<string>();

// Store ingredient-specific piece weights (oz per piece)
const ingredientPieceWeights: Record<string, number> = {
  'Scallops (Hokkaido Hotate)': 1.5,  // 1 scallop piece = 1.5 oz
  'Shrimp': 0.5,                       // 1 shrimp piece = 0.5 oz
  'Salmon': 6.0,                       // 1 salmon portion = 6 oz
  'Tuna (Yellowfin)': 6.0,            // 1 tuna portion = 6 oz
  'Yellowtail': 6.0,                   // 1 yellowtail portion = 6 oz
  'Albacore': 6.0,                     // 1 albacore portion = 6 oz
  'Crab Stick (Kani Kama)': 0.5,      // 1 crab stick = 0.5 oz
  'Test Shrimp': 0.5,                  // 1 test shrimp piece = 0.5 oz (for testing)
};

/**
 * Get the weight in ounces for one piece of an ingredient
 * @param ingredientName - Name of the ingredient
 * @returns Weight in ounces per piece, or null if not defined
 */
export function getIngredientPieceWeight(ingredientName: string): number | null {
  return ingredientPieceWeights[ingredientName] ?? null;
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
 * Special handling for ingredient-specific piece conversions
 * 
 * @param value - Numeric value to convert
 * @param fromUnit - Source unit (e.g., 'pc', 'oz', 'cup')
 * @param toUnit - Target unit (e.g., 'lb', 'kg', 'ml')
 * @param ingredientName - Optional ingredient name for piece-to-weight conversions
 * @returns Converted value or null if conversion fails
 */
export function convertUnit(
  value: number,
  fromUnit: string,
  toUnit: string,
  ingredientName?: string
): number | null {
  try {
    // Handle same-unit case (no conversion needed)
    if (fromUnit === toUnit) {
      return value;
    }

    // Handle unsupported units that should be treated as "each" (no conversion)
    const unsupportedUnits = ['each', 'ea', 'piece', 'pieces'];
    if (unsupportedUnits.includes(fromUnit.toLowerCase()) || unsupportedUnits.includes(toUnit.toLowerCase())) {
      // If both are unsupported or same conceptually, return as-is
      if (unsupportedUnits.includes(fromUnit.toLowerCase()) && unsupportedUnits.includes(toUnit.toLowerCase())) {
        return value;
      }
      // Cannot convert between "each" and weight/volume units without ingredient-specific data
      return null;
    }

    // Special handling for "pc" (pieces) conversions
    if (fromUnit.toLowerCase() === 'pc') {
      console.log(`[UnitConversion] DEBUG: Converting ${value} pc for ingredient: "${ingredientName || 'unknown'}"`);
      if (ingredientName) {
        const pieceWeight = getIngredientPieceWeight(ingredientName);
        console.log(`[UnitConversion] DEBUG: Piece weight lookup result: ${pieceWeight}`);
        if (pieceWeight !== null) {
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
