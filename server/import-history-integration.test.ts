import { describe, it, expect } from 'vitest';
import { saveImportHistory, getImportHistory, rollbackImport } from './import-history';

describe('Import History Integration', () => {
  const mockRestaurantId = 1;
  const mockUserId = 'test-user';

  it('should save import history record', async () => {
    const historyId = await saveImportHistory({
      restaurantId: mockRestaurantId,
      userId: mockUserId,
      importType: 'ingredients',
      recordsCreated: 2,
      recordsUpdated: 0,
      createdIds: [1, 2],
      updatedData: [],
    });

    expect(historyId).toBeGreaterThan(0);
  });







  it('should retrieve import history records', async () => {
    const history = await getImportHistory({
      restaurantId: mockRestaurantId,
    });

    expect(Array.isArray(history)).toBe(true);
  });

  it('should filter import history by type', async () => {
    const history = await getImportHistory({
      restaurantId: mockRestaurantId,
      importType: 'ingredients',
    });

    expect(Array.isArray(history)).toBe(true);
    if (history.length > 0) {
      expect(history.every(h => h.importType === 'ingredients')).toBe(true);
    }
  });

  it('should handle pagination', async () => {
    const page1 = await getImportHistory({
      restaurantId: mockRestaurantId,
      limit: 2,
      offset: 0,
    });
    expect(page1.length).toBeLessThanOrEqual(2);

    const page2 = await getImportHistory({
      restaurantId: mockRestaurantId,
      limit: 2,
      offset: 2,
    });
    expect(Array.isArray(page2)).toBe(true);
  });


});
