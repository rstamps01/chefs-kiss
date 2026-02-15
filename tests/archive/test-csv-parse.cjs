const fs = require('fs');
const { parse } = require('csv-parse/sync');

const csvContent = fs.readFileSync('/home/ubuntu/upload/ingredients-2026-02-15.csv', 'utf-8');

// Remove BOM if present
let cleanedContent = csvContent.replace(/^\uFEFF/, '');

// Split into lines and find the actual header row
const lines = cleanedContent.split('\n');
let headerIndex = -1;

// Look for the header row
const commonHeaders = ['id', 'name', 'category', 'unit', 'recipeId', 'ingredientId', 'quantity'];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  // Skip comment lines, empty lines, and metadata rows
  if (!line || line.startsWith('#') || line.startsWith('//')) {
    continue;
  }
  
  // Check if this line contains actual column headers
  const lowerLine = line.toLowerCase();
  if (commonHeaders.some(header => lowerLine.includes(header))) {
    headerIndex = i;
    console.log(`Found header at line ${i}: ${line.substring(0, 100)}`);
    break;
  }
}

if (headerIndex === -1) {
  console.log('No header found with common headers, looking for first non-comment line...');
  for (let i = 0; i < Math.min(30, lines.length); i++) {
    const line = lines[i].trim();
    console.log(`Line ${i}: ${line.substring(0, 80)}`);
    if (line && !line.startsWith('#') && !line.startsWith('//')) {
      headerIndex = i;
      console.log(`Using line ${i} as header`);
      break;
    }
  }
}

// Reconstruct CSV starting from header row
const cleanedLines = lines.slice(headerIndex);
cleanedContent = cleanedLines.join('\n');

console.log('\n=== First 5 lines after header detection ===');
cleanedLines.slice(0, 5).forEach((line, i) => {
  console.log(`${i}: ${line.substring(0, 120)}`);
});

try {
  const records = parse(cleanedContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true,
    relax_column_count: true,
  });
  
  console.log(`\n=== Parsed ${records.length} records ===`);
  console.log('First record keys:', Object.keys(records[0]));
  console.log('First record:', records[0]);
} catch (error) {
  console.error('Parse error:', error.message);
}
