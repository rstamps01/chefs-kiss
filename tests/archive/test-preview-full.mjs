import { readFileSync } from 'fs';
import { previewIngredientCSV } from './server/csv-preview-helpers.ts';

const csvContent = readFileSync('/home/ubuntu/upload/ingredients-2026-02-15.csv', 'utf-8');

console.log('Testing preview with restaurantId = 1...\n');

try {
  const result = await previewIngredientCSV(csvContent, 1);
  console.log('Total rows:', result.totalRows);
  console.log('Valid rows:', result.validRows);
  console.log('Error rows:', result.errorRows);
  console.log('Warning rows:', result.warningRows);
  console.log('Global errors:', result.globalErrors);
  
  // Find rows with errors
  const errorRows = result.rows.filter(r => r.status === 'error');
  console.log('\n=== Error Rows ===');
  errorRows.forEach(row => {
    console.log(`Row ${row.rowNumber}:`, row.errors);
    console.log('Data:', JSON.stringify(row.data, null, 2));
  });
  
  // Check response size
  const jsonStr = JSON.stringify(result);
  console.log('\n=== Response Size ===');
  console.log('JSON length:', jsonStr.length, 'bytes');
  console.log('JSON length:', (jsonStr.length / 1024).toFixed(2), 'KB');
  
  if (jsonStr.length > 1000000) {
    console.log('WARNING: Response is very large (>1MB), might cause issues');
  }
} catch (error) {
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
}
