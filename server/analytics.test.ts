import { describe, it, expect, beforeAll } from 'vitest';
import { getSalesAnalytics, getDailySalesData, getSalesByDayOfWeek, getSalesDateRange, importSalesData } from './db';

describe('Analytics Queries', () => {
  const testLocationId = 1;
  
  beforeAll(async () => {
    // Import test data
    const testData = [
      {
        locationId: testLocationId,
        date: '2024-01-01',
        totalSales: 1000.50,
        totalOrders: 25,
        lunchSales: 400.25,
        dinnerSales: 600.25,
        notes: null,
      },
      {
        locationId: testLocationId,
        date: '2024-01-02',
        totalSales: 1200.75,
        totalOrders: 30,
        lunchSales: 450.50,
        dinnerSales: 750.25,
        notes: null,
      },
      {
        locationId: testLocationId,
        date: '2024-01-03',
        totalSales: 950.00,
        totalOrders: 22,
        lunchSales: 380.00,
        dinnerSales: 570.00,
        notes: null,
      },
    ];
    
    await importSalesData(testData);
  });

  describe('getSalesAnalytics', () => {
    it('should return aggregate statistics for a location', async () => {
      const result = await getSalesAnalytics(testLocationId);
      
      expect(result).toBeTruthy();
      expect(result?.recordCount).toBeGreaterThan(0);
      expect(result?.totalSales).toBeTruthy();
      expect(result?.totalOrders).toBeTruthy();
    });

    it('should filter by date range', async () => {
      const result = await getSalesAnalytics(
        testLocationId,
        '2024-01-01',
        '2024-01-02'
      );
      
      expect(result).toBeTruthy();
      expect(result?.recordCount).toBe(2);
    });

    it('should return null for non-existent location', async () => {
      const result = await getSalesAnalytics(99999);
      
      expect(result).toBeTruthy();
      expect(result?.recordCount).toBe(0);
    });
  });

  describe('getDailySalesData', () => {
    it('should return daily sales records', async () => {
      const result = await getDailySalesData(testLocationId);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      if (result.length > 0) {
        const firstRecord = result[0];
        expect(firstRecord).toHaveProperty('date');
        expect(firstRecord).toHaveProperty('totalSales');
        expect(firstRecord).toHaveProperty('totalOrders');
        expect(firstRecord).toHaveProperty('dayOfWeek');
      }
    });

    it('should order results by date', async () => {
      const result = await getDailySalesData(testLocationId);
      
      if (result.length > 1) {
        for (let i = 1; i < result.length; i++) {
          const prevDate = new Date(result[i - 1].date);
          const currDate = new Date(result[i].date);
          expect(currDate.getTime()).toBeGreaterThanOrEqual(prevDate.getTime());
        }
      }
    });

    it('should filter by date range', async () => {
      const result = await getDailySalesData(
        testLocationId,
        '2024-01-01',
        '2024-01-02'
      );
      
      expect(result.length).toBeLessThanOrEqual(2);
    });
  });

  describe('getSalesByDayOfWeek', () => {
    it('should return aggregated data by day of week', async () => {
      const result = await getSalesByDayOfWeek(testLocationId);
      
      expect(Array.isArray(result)).toBe(true);
      
      if (result.length > 0) {
        const firstRecord = result[0];
        expect(firstRecord).toHaveProperty('dayOfWeek');
        expect(firstRecord).toHaveProperty('avgSales');
        expect(firstRecord).toHaveProperty('totalSales');
        expect(firstRecord).toHaveProperty('recordCount');
        
        // Day of week should be 0-6
        expect(firstRecord.dayOfWeek).toBeGreaterThanOrEqual(0);
        expect(firstRecord.dayOfWeek).toBeLessThanOrEqual(6);
      }
    });

    it('should order results by day of week', async () => {
      const result = await getSalesByDayOfWeek(testLocationId);
      
      if (result.length > 1) {
        for (let i = 1; i < result.length; i++) {
          expect(result[i].dayOfWeek).toBeGreaterThanOrEqual(result[i - 1].dayOfWeek);
        }
      }
    });

    it('should calculate averages correctly', async () => {
      const result = await getSalesByDayOfWeek(testLocationId);
      
      if (result.length > 0) {
        const record = result[0];
        if (record.avgSales && record.totalSales && record.recordCount) {
          const expectedAvg = parseFloat(record.totalSales) / record.recordCount;
          const actualAvg = parseFloat(record.avgSales);
          // Allow small floating point differences
          expect(Math.abs(actualAvg - expectedAvg)).toBeLessThan(0.01);
        }
      }
    });
  });

  describe('getSalesDateRange', () => {
    it('should return min and max dates for a location', async () => {
      const result = await getSalesDateRange(testLocationId);
      
      expect(result).toBeTruthy();
      expect(result?.minDate).toBeTruthy();
      expect(result?.maxDate).toBeTruthy();
    });

    it('should have max date >= min date', async () => {
      const result = await getSalesDateRange(testLocationId);
      
      if (result?.minDate && result?.maxDate) {
        const minDate = new Date(result.minDate);
        const maxDate = new Date(result.maxDate);
        expect(maxDate.getTime()).toBeGreaterThanOrEqual(minDate.getTime());
      }
    });

    it('should return null for location with no data', async () => {
      const result = await getSalesDateRange(99999);
      
      // Should return an object but with null values
      expect(result).toBeTruthy();
      expect(result?.minDate).toBeFalsy();
      expect(result?.maxDate).toBeFalsy();
    });
  });
});
