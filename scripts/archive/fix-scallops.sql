-- Fix Scallops ingredient to use pounds instead of ounces
-- Current: oz @ $1.20/oz = $19.20/lb
-- Target: lb @ $19.20/lb with conversion factor oz→pc

-- Step 1: Update Scallops ingredient to use 'lb' unit and adjust cost
UPDATE ingredients 
SET unit = 'lb', 
    costPerUnit = 19.20
WHERE name LIKE '%Scallops%';

-- Step 2: Add ingredient-specific conversion from oz to pieces
-- Assumption: 1 scallop piece = 1.5 oz (U10 size - 10 pieces per pound)
INSERT INTO ingredientConversions (restaurantId, ingredientId, fromUnit, toUnit, conversionFactor, notes)
SELECT 
    restaurantId,
    id,
    'pc',
    'oz',
    1.5,
    'U10 Hokkaido scallops: 1 piece = 1.5 oz'
FROM ingredients
WHERE name LIKE '%Scallops%'
ON DUPLICATE KEY UPDATE conversionFactor = 1.5, notes = 'U10 Hokkaido scallops: 1 piece = 1.5 oz';

-- Verification query
SELECT 
    i.id,
    i.name,
    i.unit,
    i.costPerUnit,
    ic.fromUnit,
    ic.toUnit,
    ic.conversionFactor
FROM ingredients i
LEFT JOIN ingredientConversions ic ON i.id = ic.ingredientId
WHERE i.name LIKE '%Scallops%';
