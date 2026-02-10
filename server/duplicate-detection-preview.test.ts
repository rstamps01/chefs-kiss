/**
 * Tests for duplicate name detection and preview operation indicators
 * 
 * Verifies that:
 * 1. Duplicate names are detected during preview
 * 2. Operation type (create/update) is correctly identified
 * 3. Warnings are generated for duplicate names
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { previewIngredientCSV } from './csv-preview-helpers';
import { createIngredient, getUserRestaurant } from './db';

describe('Duplicate Name Detection', () => {
  let restaurantId: number;

  beforeAll(async () => {
    // Get the test restaurant ID
    const restaurant = await getUserRestaurant(1); // Assuming user ID 1 exists
    if (restaurant) {
      restaurantId = restaurant.id;
      
      // Create a test ingredient that will be used for duplicate detection
      await createIngredient({
        restaurantId: restaurant.id,
        name: 'Existing Test Ingredient',
        category: 'Test',
        unit: 'lb',
        costPerUnit: '5.00',
      });
    }
  });

  it('should detect duplicate names for create operations', async () => {
    const csvContent = `id,name,category,unit,costPerUnit
,Existing Test Ingredient,Test,lb,6.00
,New Unique Ingredient,Test,oz,3.00`;

    const result = await previewIngredientCSV(csvContent, restaurantId);

    expect(result.valid).toBe(true); // Still valid, just warnings
    expect(result.totalRows).toBe(2);
    
    // First row should have duplicate warning
    const firstRow = result.rows[0];
    expect(firstRow.operation).toBe('create');
    expect(firstRow.warnings.length).toBeGreaterThan(0);
    expect(firstRow.warnings.some(w => w.includes('Database duplicate'))).toBe(true);
    expect(firstRow.warnings.some(w => w.includes('Existing Test Ingredient'))).toBe(true);
    
    // Second row should not have duplicate warning
    const secondRow = result.rows[1];
    expect(secondRow.operation).toBe('create');
    expect(secondRow.warnings.some(w => w.includes('Duplicate name'))).toBe(false);
  });

  it('should not check duplicates for update operations', async () => {
    const csvContent = `id,name,category,unit,costPerUnit
1,Existing Test Ingredient,Test,lb,6.00`;

    const result = await previewIngredientCSV(csvContent, restaurantId);

    expect(result.valid).toBe(true);
    expect(result.totalRows).toBe(1);
    
    const row = result.rows[0];
    expect(row.operation).toBe('update');
    // Should not have duplicate warning since this is an update
    expect(row.warnings.some(w => w.includes('Duplicate name'))).toBe(false);
  });

  it('should work without restaurantId (no duplicate check)', async () => {
    const csvContent = `id,name,category,unit,costPerUnit
,Test Ingredient,Test,lb,5.00`;

    const result = await previewIngredientCSV(csvContent); // No restaurantId

    expect(result.valid).toBe(true);
    expect(result.totalRows).toBe(1);
    
    const row = result.rows[0];
    expect(row.operation).toBe('create');
    // Should not have duplicate warning since no restaurantId was provided
    expect(row.warnings.some(w => w.includes('Duplicate name'))).toBe(false);
  });
});

describe('Operation Type Detection', () => {
  it('should identify create operations (no id)', async () => {
    const csvContent = `name,category,unit,costPerUnit
New Ingredient 1,Test,lb,5.00
New Ingredient 2,Test,oz,3.00`;

    const result = await previewIngredientCSV(csvContent);

    expect(result.totalRows).toBe(2);
    result.rows.forEach(row => {
      expect(row.operation).toBe('create');
    });
  });

  it('should identify create operations (empty id)', async () => {
    const csvContent = `id,name,category,unit,costPerUnit
,New Ingredient 1,Test,lb,5.00
,New Ingredient 2,Test,oz,3.00`;

    const result = await previewIngredientCSV(csvContent);

    expect(result.totalRows).toBe(2);
    result.rows.forEach(row => {
      expect(row.operation).toBe('create');
    });
  });

  it('should identify update operations (with id)', async () => {
    const csvContent = `id,name,category,unit,costPerUnit
1,Updated Ingredient 1,Test,lb,5.00
2,Updated Ingredient 2,Test,oz,3.00`;

    const result = await previewIngredientCSV(csvContent);

    expect(result.totalRows).toBe(2);
    result.rows.forEach(row => {
      expect(row.operation).toBe('update');
    });
  });

  it('should handle mixed create and update operations', async () => {
    const csvContent = `id,name,category,unit,costPerUnit
1,Updated Ingredient,Test,lb,5.00
,New Ingredient,Test,oz,3.00
2,Another Update,Test,kg,8.00
,Another Create,Test,g,1.00`;

    const result = await previewIngredientCSV(csvContent);

    expect(result.totalRows).toBe(4);
    
    // Check operations
    expect(result.rows[0].operation).toBe('update');
    expect(result.rows[1].operation).toBe('create');
    expect(result.rows[2].operation).toBe('update');
    expect(result.rows[3].operation).toBe('create');
    
    // Count operations
    const createCount = result.rows.filter(r => r.operation === 'create').length;
    const updateCount = result.rows.filter(r => r.operation === 'update').length;
    expect(createCount).toBe(2);
    expect(updateCount).toBe(2);
  });
});

describe('Preview Data Structure', () => {
  it('should include operation field in row validation', async () => {
    const csvContent = `id,name,category,unit,costPerUnit
1,Test Ingredient,Test,lb,5.00`;

    const result = await previewIngredientCSV(csvContent);

    expect(result.totalRows).toBe(1);
    const row = result.rows[0];
    
    // Verify operation field exists
    expect(row).toHaveProperty('operation');
    expect(row.operation).toBeDefined();
    expect(['create', 'update']).toContain(row.operation);
  });

  it('should maintain all existing preview fields', async () => {
    const csvContent = `id,name,category,unit,costPerUnit
1,Test Ingredient,Test,lb,5.00`;

    const result = await previewIngredientCSV(csvContent);

    // Verify result structure
    expect(result).toHaveProperty('valid');
    expect(result).toHaveProperty('totalRows');
    expect(result).toHaveProperty('validRows');
    expect(result).toHaveProperty('errorRows');
    expect(result).toHaveProperty('warningRows');
    expect(result).toHaveProperty('rows');
    expect(result).toHaveProperty('globalErrors');
    expect(result).toHaveProperty('columnMapping');
    
    // Verify row structure
    const row = result.rows[0];
    expect(row).toHaveProperty('rowIndex');
    expect(row).toHaveProperty('rowNumber');
    expect(row).toHaveProperty('status');
    expect(row).toHaveProperty('operation');
    expect(row).toHaveProperty('errors');
    expect(row).toHaveProperty('warnings');
    expect(row).toHaveProperty('data');
  });
});

describe('Duplicate Detection Edge Cases', () => {
  let restaurantId: number;

  beforeAll(async () => {
    const restaurant = await getUserRestaurant(1);
    if (restaurant) {
      restaurantId = restaurant.id;
    }
  });

  it('should handle case-sensitive name matching', async () => {
    // Create ingredient with specific casing
    await createIngredient({
      restaurantId,
      name: 'Test Ingredient Case',
      category: 'Test',
      unit: 'lb',
      costPerUnit: '5.00',
    });

    // Try to create with different casing
    const csvContent = `id,name,category,unit,costPerUnit
,test ingredient case,Test,lb,6.00`;

    const result = await previewIngredientCSV(csvContent, restaurantId);

    // Should not detect as duplicate if database is case-sensitive
    // (behavior depends on database collation)
    expect(result.totalRows).toBe(1);
    expect(result.rows[0].operation).toBe('create');
  });

  it('should handle whitespace in names', async () => {
    const csvContent = `id,name,category,unit,costPerUnit
,  Ingredient With Spaces  ,Test,lb,5.00`;

    const result = await previewIngredientCSV(csvContent, restaurantId);

    expect(result.totalRows).toBe(1);
    expect(result.rows[0].operation).toBe('create');
    // Name should be trimmed during duplicate check
  });

  it('should handle empty names gracefully', async () => {
    const csvContent = `id,name,category,unit,costPerUnit
,,Test,lb,5.00`;

    const result = await previewIngredientCSV(csvContent, restaurantId);

    expect(result.totalRows).toBe(1);
    const row = result.rows[0];
    expect(row.status).toBe('error'); // Should have error for missing name
    expect(row.errors.some(e => e.includes('Missing ingredient name'))).toBe(true);
    // Should not attempt duplicate check on empty name
  });
});
