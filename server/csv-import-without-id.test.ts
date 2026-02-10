import { describe, it, expect } from 'vitest';
import { previewIngredientCSV } from './csv-preview-helpers';
import { readFileSync } from 'fs';

describe('CSV Import Without ID Column', () => {
  it('should accept ingredient CSV without id column', () => {
    const csvContent = readFileSync('/home/ubuntu/upload/ingredients-2026-02-10(3).csv', 'utf-8');
    const result = previewIngredientCSV(csvContent);
    
    console.log('Preview result:', JSON.stringify(result, null, 2));
    
    expect(result.globalErrors).toHaveLength(0);
    expect(result.totalRows).toBeGreaterThan(0);
  });

  it('should validate ingredient data without id', () => {
    const csvContent = `name,category,unit,costPerUnit,pieceWeightOz,supplier,shelfLife,minStock
Tomato,Produce,lb,2.50,0.5,Local Farm,7,10
Lettuce,Produce,head,1.25,,Local Farm,5,15`;
    
    const result = previewIngredientCSV(csvContent);
    
    console.log('Validation result:', JSON.stringify(result, null, 2));
    
    expect(result.globalErrors).toHaveLength(0);
    expect(result.valid).toBe(true);
    expect(result.totalRows).toBe(2);
    expect(result.validRows).toBe(2);
    expect(result.errorRows).toBe(0);
  });

  it('should validate ingredient with id when provided', () => {
    const csvContent = `id,name,category,unit,costPerUnit
42,Tomato,Produce,lb,2.50
43,Lettuce,Produce,head,1.25`;
    
    const result = previewIngredientCSV(csvContent);
    
    console.log('With ID result:', JSON.stringify(result, null, 2));
    
    expect(result.globalErrors).toHaveLength(0);
    expect(result.valid).toBe(true);
    expect(result.totalRows).toBe(2);
    expect(result.warningRows).toBe(2); // Rows have warnings about missing supplier
    expect(result.errorRows).toBe(0);
  });

  it('should reject invalid id when provided', () => {
    const csvContent = `id,name,category,unit,costPerUnit
abc,Tomato,Produce,lb,2.50`;
    
    const result = previewIngredientCSV(csvContent);
    
    expect(result.totalRows).toBe(1);
    expect(result.errorRows).toBe(1);
    expect(result.rows[0].errors).toContain('ID must be a valid number');
  });
});
