/**
 * Test: CSV Export Actions Column Filtering
 * 
 * Ensures that the "actions" column (added by frontend table UI) is properly
 * filtered out during CSV export to prevent import errors.
 */

import { describe, it, expect } from 'vitest';
import { ingredientsToCSV, parseCSV } from './csv-helpers';

describe('CSV Export - Actions Column Filtering', () => {
  const sampleIngredients = [
    {
      id: 1,
      name: 'Sushi Rice',
      category: 'Grains',
      unit: 'lb',
      costPerUnit: 2.50,
      pieceWeightOz: null,
      supplier: 'Asian Foods Co',
      shelfLife: 365,
      minStock: 50,
    },
    {
      id: 2,
      name: 'Nori Sheets',
      category: 'Seaweed',
      unit: 'pc',
      costPerUnit: 0.50,
      pieceWeightOz: 0.1,
      supplier: 'Asian Foods Co',
      shelfLife: 180,
      minStock: 100,
    },
  ];

  it('should filter out "actions" column when included in visibleColumns', () => {
    // Simulate frontend passing visibleColumns with "actions" column
    const visibleColumns = [
      'id',
      'name',
      'category',
      'unit',
      'costPerUnit',
      'pieceWeightOz',
      'supplier',
      'shelfLife',
      'minStock',
      'actions', // UI-only column
    ];

    const csv = ingredientsToCSV(sampleIngredients, visibleColumns);

    // Parse the CSV to check headers
    const parsed = parseCSV(csv);

    // Verify "actions" column is NOT in the parsed data
    expect(parsed.length).toBeGreaterThan(0);
    expect(parsed[0]).not.toHaveProperty('actions');

    // Verify expected columns are present
    expect(parsed[0]).toHaveProperty('id');
    expect(parsed[0]).toHaveProperty('name');
    expect(parsed[0]).toHaveProperty('unit');
  });

  it('should export all valid columns when visibleColumns is not provided', () => {
    const csv = ingredientsToCSV(sampleIngredients);

    const parsed = parseCSV(csv);

    // Verify all expected columns are present
    expect(parsed.length).toBe(2);
    expect(parsed[0]).toHaveProperty('id');
    expect(parsed[0]).toHaveProperty('name');
    expect(parsed[0]).toHaveProperty('category');
    expect(parsed[0]).toHaveProperty('unit');
    expect(parsed[0]).toHaveProperty('costPerUnit');
    expect(parsed[0]).toHaveProperty('pieceWeightOz');
    expect(parsed[0]).toHaveProperty('supplier');
    expect(parsed[0]).toHaveProperty('shelfLife');
    expect(parsed[0]).toHaveProperty('minStock');

    // Verify "actions" is not present
    expect(parsed[0]).not.toHaveProperty('actions');
  });

  it('should handle multiple UI-only columns in visibleColumns', () => {
    const visibleColumns = [
      'id',
      'name',
      'unit',
      'actions', // UI-only
      'select', // Another UI-only column
      'expand', // Another UI-only column
    ];

    const csv = ingredientsToCSV(sampleIngredients, visibleColumns);

    const parsed = parseCSV(csv);

    // Verify only valid columns are exported
    expect(parsed[0]).toHaveProperty('id');
    expect(parsed[0]).toHaveProperty('name');
    expect(parsed[0]).toHaveProperty('unit');

    // Verify UI-only columns are filtered out
    expect(parsed[0]).not.toHaveProperty('actions');
    expect(parsed[0]).not.toHaveProperty('select');
    expect(parsed[0]).not.toHaveProperty('expand');
  });

  it('should handle empty visibleColumns array', () => {
    const visibleColumns: string[] = [];

    const csv = ingredientsToCSV(sampleIngredients, visibleColumns);

    const parsed = parseCSV(csv);

    // When visibleColumns is empty array, no columns are exported (empty result)
    // This is expected behavior - empty array means "export nothing"
    expect(parsed.length).toBe(0);
  });

  it('should preserve column order when filtering', () => {
    const visibleColumns = [
      'name',
      'unit',
      'actions', // Should be filtered out
      'costPerUnit',
    ];

    const csv = ingredientsToCSV(sampleIngredients, visibleColumns);

    // Check that the header row has the correct order (without actions)
    const lines = csv.split('\n');
    const headerLine = lines.find(line => 
      line.includes('name') && 
      line.includes('unit') && 
      line.includes('costPerUnit') &&
      !line.startsWith('#')
    );

    expect(headerLine).toBeDefined();
    expect(headerLine).not.toContain('actions');

    // Verify the columns are in the expected order
    const parsed = parseCSV(csv);
    const keys = Object.keys(parsed[0]);
    expect(keys).toEqual(['name', 'unit', 'costPerUnit']);
  });
});
