import { convertUnit, getIngredientPieceWeight } from './server/unitConversion.js';

console.log('=== Testing Scallops Conversion ===\n');

// Test 1: Check if ingredient piece weight is defined
const ingredientName = 'Scallops (Hokkaido Hotate)';
const pieceWeight = getIngredientPieceWeight(ingredientName);
console.log(`1. Ingredient piece weight for "${ingredientName}":`, pieceWeight, 'oz');

// Test 2: Try converting 2 pieces to pounds WITH ingredient name
const result1 = convertUnit(2, 'pc', 'lb', ingredientName);
console.log(`\n2. Convert 2 pc to lb (with ingredient name):`, result1);

// Test 3: Try converting 2 pieces to pounds WITHOUT ingredient name
const result2 = convertUnit(2, 'pc', 'lb');
console.log(`\n3. Convert 2 pc to lb (without ingredient name):`, result2);

// Test 4: Try converting 3 oz to lb (standard conversion)
const result3 = convertUnit(3, 'oz', 'lb');
console.log(`\n4. Convert 3 oz to lb (standard):`, result3);

// Test 5: Calculate expected cost
if (result1 !== null) {
  const costPerLb = 19.20;
  const totalCost = result1 * costPerLb;
  console.log(`\n5. Expected cost: ${result1.toFixed(4)} lb × $${costPerLb}/lb = $${totalCost.toFixed(2)}`);
} else {
  console.log('\n5. Cannot calculate cost - conversion failed');
}

console.log('\n=== Test Complete ===');
