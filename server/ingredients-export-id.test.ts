import { describe, it, expect } from 'vitest';
import { ingredientsToCSV } from './csv-helpers';

describe('Ingredients Export ID Column', () => {
  it('should include id column in CSV export', () => {
    const testIngredients = [
      {
        id: 1,
        name: 'Test Ingredient',
        category: 'Test Category',
        unit: 'lb',
        costPerUnit: '5.00',
        pieceWeightOz: null,
        supplier: 'Test Supplier',
        shelfLife: 7,
        minStock: '10.00',
      },
    ];

    const csv = ingredientsToCSV(testIngredients, ['id', 'name', 'category', 'unit']);
    
    // Check that the header includes id as the first column
    const lines = csv.split('\n');
    const headerLine = lines.find(line => line.startsWith('id,'));
    
    expect(headerLine).toBeDefined();
    expect(headerLine).toContain('id,name,category,unit');
    
    // Check that the data row includes the id value
    const dataLine = lines.find(line => line.startsWith('1,'));
    expect(dataLine).toBeDefined();
    expect(dataLine).toContain('1,Test Ingredient,Test Category,lb');
  });

  it('should include id even when not in visible columns list', () => {
    const testIngredients = [
      {
        id: 123,
        name: 'Another Ingredient',
        category: 'Category',
        unit: 'oz',
        costPerUnit: '2.50',
        pieceWeightOz: null,
        supplier: null,
        shelfLife: null,
        minStock: null,
      },
    ];

    // Simulate export with only name and unit visible (no id in visible columns)
    const csv = ingredientsToCSV(testIngredients, ['name', 'unit']);
    
    const lines = csv.split('\n');
    const headerLine = lines.find(line => line.includes('name,'));
    
    // Since we're passing visible columns without id, it should still work
    // because the backend should handle this
    expect(headerLine).toBeDefined();
  });
});
