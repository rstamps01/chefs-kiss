SELECT 
  id,
  name,
  costPerUnit,
  unit,
  category
FROM ingredients
WHERE category IN ('Seafood', 'Fish', 'Meat', 'Protein')
   OR name LIKE '%Tuna%'
   OR name LIKE '%Salmon%'
   OR name LIKE '%Scallop%'
   OR name LIKE '%Yellowtail%'
   OR name LIKE '%Albacore%'
   OR name LIKE '%Shrimp%'
   OR name LIKE '%Crab%'
   OR name LIKE '%Eel%'
ORDER BY name;
