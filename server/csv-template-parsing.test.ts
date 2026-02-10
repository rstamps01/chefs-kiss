import { describe, it, expect } from 'vitest';
import { parseCSV, parseIngredientCSV } from './csv-helpers';
import { readFileSync } from 'fs';

describe('CSV Template Parsing', () => {
  it('should parse ingredient CSV with metadata rows', () => {
    const csvContent = readFileSync('/home/ubuntu/upload/test-ingredients-01.csv', 'utf-8');
    const result = parseIngredientCSV(csvContent);
    
    if (!result.valid) {
      console.log('Validation errors:', result.errors);
      console.log('Parsed data count:', result.data.length);
    }
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.data.length).toBeGreaterThan(0);
    
    // Check first ingredient
    const firstIngredient = result.data[0];
    expect(firstIngredient.name).toBe('Sushi Rice (Edited)');
    expect(firstIngredient.unit).toBe('lb');
    expect(firstIngredient.costPerUnit).toBe('5');
  });
  
  it('should skip metadata rows (REQUIRED, OPTIONAL, etc.)', () => {
    const csvContent = readFileSync('/home/ubuntu/upload/test-ingredients-01.csv', 'utf-8');
    const parsed = parseCSV(csvContent);
    
    // Should not include metadata rows
    const hasMetadata = parsed.some(row => 
      Object.values(row).some(v => 
        String(v).includes('REQUIRED') || 
        String(v).includes('OPTIONAL') ||
        String(v).includes('STRING')
      )
    );
    
    expect(hasMetadata).toBe(false);
  });
  
  it('should handle CSV without id column (for creating new ingredients)', () => {
    const csvWithoutId = `name,category,unit,costPerUnit
Test Ingredient,Test Category,lb,5.50`;
    
    const result = parseIngredientCSV(csvWithoutId);
    
    expect(result.valid).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe('Test Ingredient');
  });
  
  it('should handle BOM character at start of file', () => {
    const csvWithBOM = '\uFEFFname,unit\nTest,lb';
    const result = parseIngredientCSV(csvWithBOM);
    
    expect(result.valid).toBe(true);
    expect(result.data).toHaveLength(1);
  });
  
  it('should validate ingredient data correctly', () => {
    const csvContent = readFileSync('/home/ubuntu/upload/test-ingredients-01.csv', 'utf-8');
    const result = parseIngredientCSV(csvContent);
    
    expect(result.valid).toBe(true);
    
    // Check that all required fields are present
    result.data.forEach(ingredient => {
      expect(ingredient.name).toBeTruthy();
      expect(ingredient.unit).toBeTruthy();
    });
  });
  
  it('should handle special characters in ingredient names', () => {
    // The test file has "Jalapeño" which might have encoding issues
    const csvContent = readFileSync('/home/ubuntu/upload/test-ingredients-01.csv', 'utf-8');
    const result = parseIngredientCSV(csvContent);
    
    expect(result.valid).toBe(true);
    
    // Find jalapeño ingredient
    const jalapenoIngredient = result.data.find(ing => 
      ing.name && ing.name.toLowerCase().includes('jalape')
    );
    
    expect(jalapenoIngredient).toBeTruthy();
  });
});
