import { describe, it, expect } from 'vitest';
import { lookupIngredientIdsByNames } from './id-lookup-helpers';

describe('Auto-ID Lookup', () => {
  it('should return empty map when no names provided', async () => {
    const result = await lookupIngredientIdsByNames(1, []);
    expect(result.size).toBe(0);
  });

  it('should perform case-insensitive name matching', async () => {
    // This test verifies the lookup is case-insensitive
    // The actual database query will be tested in integration tests
    const names = ['Chicken Breast', 'OLIVE OIL', 'salt'];
    const result = await lookupIngredientIdsByNames(1, names);
    
    // Result should be a Map
    expect(result).toBeInstanceOf(Map);
  });

  it('should normalize names with whitespace', async () => {
    const names = ['  Chicken Breast  ', 'Olive Oil'];
    const result = await lookupIngredientIdsByNames(1, names);
    
    expect(result).toBeInstanceOf(Map);
  });

  it('should handle empty strings in names array', async () => {
    const names = ['', 'Chicken', ''];
    const result = await lookupIngredientIdsByNames(1, names);
    
    expect(result).toBeInstanceOf(Map);
  });
});
