const { parseCSV } = require('./server/csv-helpers.ts');

const csvWithActions = `# INGREDIENTS DATA EXPORT
# This file can be edited and re-imported
# Lines starting with # are comments and will be ignored during import
#
# INSTRUCTIONS:
# 1. Rows 1-22 contain instructions and metadata
# 2. Row 23 contains column headers
# 3. Starting from row 24, you can edit ingredient data
#

name,category,unit,costPerUnit,pieceWeightOz,supplier,shelfLife,minStock,actions
REQUIRED,OPTIONAL,REQUIRED,OPTIONAL,OPTIONAL,OPTIONAL,OPTIONAL,OPTIONAL,OPTIONAL
STRING,STRING,STRING,DECIMAL,DECIMAL,STRING,INTEGER,DECIMAL,STRING
"Text, max 255 characters","Text, max 100 characters","Unit name (lb, oz, kg, g, gal, qt, pt, cup, tbsp, tsp, ml, L, each, pc)","Number with up to 4 decimal places (e.g., 5.50 or 0.2500)",Number with up to 4 decimal places (weight in oz per piece),"Text, max 255 characters",Whole number (days),Number with up to 2 decimal places,
Must be unique within your restaurant,Use existing categories or create new ones,Must match existing unit names exactly,"Positive number, represents cost per single unit","Only needed if unit is ""pc"" or ""each"" for weight conversions",,Positive integer representing days,Minimum stock level in the unit specified,

Sushi Rice,Ingredient,lb,5.0000,,Test Supplier Co.,7,10.00,
Nori Sheets,Ingredient,sheet,0.2000,,,180,10.00,`;

try {
  const parsed = parseCSV(csvWithActions);
  console.log('Parsed successfully!');
  console.log('Number of records:', parsed.length);
  console.log('First record keys:', Object.keys(parsed[0]));
  console.log('First record:', parsed[0]);
  console.log('Has actions column?', 'actions' in parsed[0]);
} catch (error) {
  console.error('Parse failed:', error.message);
}
