/**
 * Tests for within-CSV duplicate detection
 * 
 * Verifies that:
 * 1. Duplicate names within the same CSV file are detected
 * 2. Warnings are generated for CSV duplicates
 * 3. CSV duplicates are distinguished from database duplicates
 * 4. Row numbers are correctly reported for all occurrences
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { previewIngredientCSV } from './csv-preview-helpers';
import { createIngredient, getUserRestaurant } from './db';

describe('Within-CSV Duplicate Detection', () => {
  it('should detect duplicate names within the same CSV file', async () => {
    const csvContent = `id,name,category,unit,costPerUnit
,Olive Oil,Oils,gal,25.00
,Garlic,Produce,lb,3.50
,Olive Oil,Oils,gal,27.00`;

    const result = await previewIngredientCSV(csvContent);

    expect(result.totalRows).toBe(3);
    
    // Both "Olive Oil" rows should have CSV duplicate warnings
    const oliveOilRows = result.rows.filter(r => r.data.name === 'Olive Oil');
    expect(oliveOilRows.length).toBe(2);
    
    oliveOilRows.forEach(row => {
      expect(row.warnings.some(w => w.includes('CSV duplicate'))).toBe(true);
      expect(row.warnings.some(w => w.includes('Olive Oil'))).toBe(true);
      expect(row.warnings.some(w => w.includes('appears multiple times'))).toBe(true);
    });
    
    // Garlic should not have any duplicate warnings
    const garlicRow = result.rows.find(r => r.data.name === 'Garlic');
    expect(garlicRow).toBeDefined();
    expect(garlicRow!.warnings.some(w => w.includes('duplicate'))).toBe(false);
  });

  it('should report correct row numbers for all occurrences', async () => {
    const csvContent = `id,name,category,unit,costPerUnit
,Tomato,Produce,lb,2.00
,Basil,Herbs,oz,8.00
,Tomato,Produce,lb,2.50
,Garlic,Produce,lb,3.00
,Tomato,Produce,lb,2.25`;

    const result = await previewIngredientCSV(csvContent);

    expect(result.totalRows).toBe(5);
    
    // All three "Tomato" rows should have warnings
    const tomatoRows = result.rows.filter(r => r.data.name === 'Tomato');
    expect(tomatoRows.length).toBe(3);
    
    // Check that each row mentions the other rows
    tomatoRows.forEach(row => {
      const warning = row.warnings.find(w => w.includes('CSV duplicate'));
      expect(warning).toBeDefined();
      expect(warning).toContain('Tomato');
      expect(warning).toContain('appears multiple times');
      // Should mention it will create 3 ingredients
      expect(warning).toContain('create 3 ingredients');
    });
  });

  it('should handle case-insensitive duplicate detection', async () => {
    const csvContent = `id,name,category,unit,costPerUnit
,Olive Oil,Oils,gal,25.00
,olive oil,Oils,gal,26.00
,OLIVE OIL,Oils,gal,27.00`;

    const result = await previewIngredientCSV(csvContent);

    expect(result.totalRows).toBe(3);
    
    // All three rows should be detected as duplicates (case-insensitive)
    result.rows.forEach(row => {
      expect(row.warnings.some(w => w.includes('CSV duplicate'))).toBe(true);
      expect(row.warnings.some(w => w.includes('appears multiple times'))).toBe(true);
    });
  });

  it('should handle whitespace variations in names', async () => {
    const csvContent = `id,name,category,unit,costPerUnit
,Olive Oil,Oils,gal,25.00
,  Olive Oil  ,Oils,gal,26.00
,Olive Oil ,Oils,gal,27.00`;

    const result = await previewIngredientCSV(csvContent);

    expect(result.totalRows).toBe(3);
    
    // All three should be detected as duplicates (after trimming)
    result.rows.forEach(row => {
      expect(row.warnings.some(w => w.includes('CSV duplicate'))).toBe(true);
    });
  });

  it('should not flag unique names as duplicates', async () => {
    const csvContent = `id,name,category,unit,costPerUnit
,Olive Oil,Oils,gal,25.00
,Garlic,Produce,lb,3.50
,Basil,Herbs,oz,8.00
,Tomato,Produce,lb,2.00`;

    const result = await previewIngredientCSV(csvContent);

    expect(result.totalRows).toBe(4);
    
    // No rows should have CSV duplicate warnings
    result.rows.forEach(row => {
      expect(row.warnings.some(w => w.includes('CSV duplicate'))).toBe(false);
    });
  });
});

describe('Database vs CSV Duplicate Distinction', () => {
  let restaurantId: number;

  beforeAll(async () => {
    const restaurant = await getUserRestaurant(1);
    if (restaurant) {
      restaurantId = restaurant.id;
      
      // Create a test ingredient in the database
      await createIngredient({
        restaurantId: restaurant.id,
        name: 'Database Ingredient',
        category: 'Test',
        unit: 'lb',
        costPerUnit: '5.00',
      });
    }
  });

  it('should distinguish between database and CSV duplicates', async () => {
    const csvContent = `id,name,category,unit,costPerUnit
,Database Ingredient,Test,lb,6.00
,CSV Duplicate,Test,oz,3.00
,CSV Duplicate,Test,oz,4.00`;

    const result = await previewIngredientCSV(csvContent, restaurantId);

    expect(result.totalRows).toBe(3);
    
    // First row should have database duplicate warning
    const dbDuplicateRow = result.rows[0];
    expect(dbDuplicateRow.warnings.some(w => w.includes('Database duplicate'))).toBe(true);
    expect(dbDuplicateRow.warnings.some(w => w.includes('CSV duplicate'))).toBe(false);
    
    // Second and third rows should have CSV duplicate warnings
    const csvDuplicateRows = result.rows.slice(1);
    csvDuplicateRows.forEach(row => {
      expect(row.warnings.some(w => w.includes('CSV duplicate'))).toBe(true);
      expect(row.warnings.some(w => w.includes('Database duplicate'))).toBe(false);
    });
  });

  it('should show both database and CSV duplicate warnings when applicable', async () => {
    const csvContent = `id,name,category,unit,costPerUnit
,Database Ingredient,Test,lb,6.00
,Database Ingredient,Test,lb,7.00`;

    const result = await previewIngredientCSV(csvContent, restaurantId);

    expect(result.totalRows).toBe(2);
    
    // Both rows should have both types of warnings
    result.rows.forEach(row => {
      expect(row.warnings.some(w => w.includes('Database duplicate'))).toBe(true);
      expect(row.warnings.some(w => w.includes('CSV duplicate'))).toBe(true);
    });
  });

  it('should not check database duplicates for update operations', async () => {
    const csvContent = `id,name,category,unit,costPerUnit
1,Database Ingredient,Test,lb,6.00
2,Database Ingredient,Test,lb,7.00`;

    const result = await previewIngredientCSV(csvContent, restaurantId);

    expect(result.totalRows).toBe(2);
    
    // Both rows are updates (have IDs), so no database duplicate check
    result.rows.forEach(row => {
      expect(row.operation).toBe('update');
      expect(row.warnings.some(w => w.includes('Database duplicate'))).toBe(false);
    });
    
    // But they should still have CSV duplicate warnings
    result.rows.forEach(row => {
      expect(row.warnings.some(w => w.includes('CSV duplicate'))).toBe(true);
    });
  });
});

describe('Edge Cases', () => {
  it('should handle empty names gracefully', async () => {
    const csvContent = `id,name,category,unit,costPerUnit
,,Test,lb,5.00
,Olive Oil,Oils,gal,25.00
,,Test,oz,3.00`;

    const result = await previewIngredientCSV(csvContent);

    expect(result.totalRows).toBe(3);
    
    // Empty names should have errors, not duplicate warnings
    const emptyNameRows = result.rows.filter((r, i) => i === 0 || i === 2);
    emptyNameRows.forEach(row => {
      expect(row.status).toBe('error');
      expect(row.errors.some(e => e.includes('Missing ingredient name'))).toBe(true);
      expect(row.warnings.some(w => w.includes('duplicate'))).toBe(false);
    });
  });

  it('should handle very large CSV files efficiently', async () => {
    // Create a CSV with 100 rows, including some duplicates
    const rows = ['id,name,category,unit,costPerUnit'];
    for (let i = 1; i <= 100; i++) {
      const name = i % 10 === 0 ? 'Duplicate Item' : `Item ${i}`;
      rows.push(`,${name},Test,lb,${i}.00`);
    }
    const csvContent = rows.join('\n');

    const start = Date.now();
    const result = await previewIngredientCSV(csvContent);
    const duration = Date.now() - start;

    expect(result.totalRows).toBe(100);
    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    
    // Check that duplicates were detected
    const duplicateRows = result.rows.filter(r => r.data.name === 'Duplicate Item');
    expect(duplicateRows.length).toBe(10);
    duplicateRows.forEach(row => {
      expect(row.warnings.some(w => w.includes('CSV duplicate'))).toBe(true);
    });
  });

  it('should handle multiple sets of duplicates', async () => {
    const csvContent = `id,name,category,unit,costPerUnit
,Olive Oil,Oils,gal,25.00
,Garlic,Produce,lb,3.50
,Olive Oil,Oils,gal,27.00
,Basil,Herbs,oz,8.00
,Garlic,Produce,lb,3.75
,Tomato,Produce,lb,2.00`;

    const result = await previewIngredientCSV(csvContent);

    expect(result.totalRows).toBe(6);
    
    // Olive Oil should have duplicates
    const oliveOilRows = result.rows.filter(r => r.data.name === 'Olive Oil');
    expect(oliveOilRows.length).toBe(2);
    oliveOilRows.forEach(row => {
      expect(row.warnings.some(w => w.includes('CSV duplicate'))).toBe(true);
    });
    
    // Garlic should have duplicates
    const garlicRows = result.rows.filter(r => r.data.name === 'Garlic');
    expect(garlicRows.length).toBe(2);
    garlicRows.forEach(row => {
      expect(row.warnings.some(w => w.includes('CSV duplicate'))).toBe(true);
    });
    
    // Basil and Tomato should not have duplicates
    const uniqueRows = result.rows.filter(r => r.data.name === 'Basil' || r.data.name === 'Tomato');
    expect(uniqueRows.length).toBe(2);
    uniqueRows.forEach(row => {
      expect(row.warnings.some(w => w.includes('duplicate'))).toBe(false);
    });
  });
});
