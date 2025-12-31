-- Create test recipe with Test Shrimp (10 pieces)
-- Expected cost: 10 pieces × 0.5 oz/piece × (1 lb / 16 oz) × $12/lb = $3.75

-- First, get the Test Shrimp ingredient ID
SELECT id, name, unit, cost_per_unit FROM ingredients WHERE name = 'Test Shrimp';

-- Get the restaurantId (assuming it's 1)
SELECT id FROM restaurants LIMIT 1;

-- Insert test recipe
INSERT INTO recipes (restaurant_id, name, description, category, servings, selling_price, created_at, updated_at)
VALUES (1, 'Test Shrimp Recipe', 'Test recipe for mathjs conversion validation', 'Specialty Rolls', 1, 10.00, NOW(), NOW());

-- Get the recipe ID
SELECT id FROM recipes WHERE name = 'Test Shrimp Recipe';

-- Insert recipe ingredient (assuming Test Shrimp ingredient_id and recipe_id)
-- Unit: 'pc' (pieces), Quantity: 10
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, created_at, updated_at)
VALUES (
  (SELECT id FROM recipes WHERE name = 'Test Shrimp Recipe'),
  (SELECT id FROM ingredients WHERE name = 'Test Shrimp'),
  10.0000,
  'pc',
  NOW(),
  NOW()
);
