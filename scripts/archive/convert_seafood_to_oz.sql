-- Convert Seafood Ingredients from LB to OZ Pricing
-- This script updates 12 seafood ingredients to use ounce-based pricing
-- Formula: cost_per_oz = cost_per_lb ÷ 16
-- Also updates unit from 3 (lb) to 2 (oz)

-- 1. Smoked Salmon: $20.00/lb → $1.25/oz
UPDATE ingredients 
SET costPerUnit = 1.25, unit = 2 
WHERE name = 'Smoked Salmon' AND unit = 3;

-- 2. Cooked Salmon: $15.00/lb → $0.9375/oz
UPDATE ingredients 
SET costPerUnit = 0.9375, unit = 2 
WHERE name = 'Cooked Salmon' AND unit = 3;

-- 3. Salmon Belly: $28.00/lb → $1.75/oz
UPDATE ingredients 
SET costPerUnit = 1.75, unit = 2 
WHERE name = 'Salmon Belly' AND unit = 3;

-- 4. Salmon (regular, not sashimi): $15.00/lb → $0.9375/oz
UPDATE ingredients 
SET costPerUnit = 0.9375, unit = 2 
WHERE name = 'Salmon' AND unit = 3 AND category = 'Fish & Seafood';

-- 5. Tuna (Ahi): $18.00/lb → $1.125/oz
UPDATE ingredients 
SET costPerUnit = 1.125, unit = 2 
WHERE name = 'Tuna (Ahi)' AND unit = 3;

-- 6. Snow Crab: $21.00/lb → $1.3125/oz
UPDATE ingredients 
SET costPerUnit = 1.3125, unit = 2 
WHERE name = 'Snow Crab' AND unit = 3;

-- 7. Crab Stick (Kani Kama): $25.00/lb → $1.5625/oz
UPDATE ingredients 
SET costPerUnit = 1.5625, unit = 2 
WHERE name = 'Crab Stick (Kani Kama)' AND unit = 3;

-- 8. Soft-Shell Crab: $30.00/lb → $1.875/oz
UPDATE ingredients 
SET costPerUnit = 1.875, unit = 2 
WHERE name = 'Soft-Shell Crab' AND unit = 3;

-- 9. Shrimp Tempura: $20.00/lb → $1.25/oz
UPDATE ingredients 
SET costPerUnit = 1.25, unit = 2 
WHERE name = 'Shrimp Tempura' AND unit = 3;

-- 10. Cooked Shrimp (Ebi): $13.00/lb → $0.8125/oz
UPDATE ingredients 
SET costPerUnit = 0.8125, unit = 2 
WHERE name = 'Cooked Shrimp (Ebi)' AND unit = 3;

-- 11. Shrimp (cooked): $16.00/lb → $1.00/oz
UPDATE ingredients 
SET costPerUnit = 1.00, unit = 2 
WHERE name = 'Shrimp (cooked)' AND unit = 3;

-- 12. Eel (Unagi): $29.00/lb → $1.8125/oz
UPDATE ingredients 
SET costPerUnit = 1.8125, unit = 2 
WHERE name = 'Eel (Unagi)' AND unit = 3;

-- Verification query: Show all updated seafood ingredients
SELECT 
  i.id,
  i.name,
  i.category,
  u.displayName as unit,
  i.costPerUnit,
  i.supplier
FROM ingredients i
LEFT JOIN ingredientUnits u ON i.unit = u.id
WHERE i.name IN (
  'Smoked Salmon',
  'Cooked Salmon',
  'Salmon Belly',
  'Salmon',
  'Tuna (Ahi)',
  'Snow Crab',
  'Crab Stick (Kani Kama)',
  'Soft-Shell Crab',
  'Shrimp Tempura',
  'Cooked Shrimp (Ebi)',
  'Shrimp (cooked)',
  'Eel (Unagi)'
)
AND i.category = 'Fish & Seafood'
ORDER BY i.name;
