import { readFileSync } from 'fs';
import { previewIngredientCSV } from './server/csv-preview-helpers.ts';

const csvContent = readFileSync('/home/ubuntu/upload/ingredients-2026-02-15.csv', 'utf-8');

console.log('Testing preview with restaurantId = 1...');

try {
  const result = await previewIngredientCSV(csvContent, 1);
  console.log('Success!');
  console.log('Total rows:', result.totalRows);
  console.log('Valid rows:', result.validRows);
  console.log('Error rows:', result.errorRows);
  console.log('Warning rows:', result.warningRows);
  console.log('Global errors:', result.globalErrors);
  
  if (result.rows.length > 0) {
    console.log('\nFirst row:');
    console.log(JSON.stringify(result.rows[0], null, 2));
  }
} catch (error) {
  console.error('Error:', error);
  console.error('Stack:', error.stack);
}
