-- Convert Scallops and Test Shrimp from lb-based to oz-based pricing
-- This eliminates the need for lb↔oz conversion in mathjs

-- Step 1: Find the oz unit ID
SELECT @oz_unit_id := id FROM ingredientUnits WHERE name = 'oz' LIMIT 1;

-- Step 2: Update Scallops (Hokkaido Hotate)
-- From: $19.20/lb (unit ID 3) → To: $1.20/oz (unit ID for oz)
-- Calculation: $19.20 ÷ 16 oz/lb = $1.20/oz
UPDATE ingredients 
SET unit = @oz_unit_id, costPerUnit = 1.20
WHERE name LIKE '%Scallops%';

-- Step 3: Update Test Shrimp
-- From: $12/lb (unit ID 3) → To: $0.75/oz (unit ID for oz)
-- Calculation: $12 ÷ 16 oz/lb = $0.75/oz
UPDATE ingredients 
SET unit = @oz_unit_id, costPerUnit = 0.75
WHERE name = 'Test Shrimp';

-- Verify updates
SELECT id, name, costPerUnit, unit FROM ingredients WHERE name LIKE '%Scallops%' OR name = 'Test Shrimp';
