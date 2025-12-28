import { describe, it, expect } from 'vitest';
import { parseCSV, validateCSVData, normalizeCSVRow } from './csv-parser';

describe('CSV Parser', () => {
  describe('parseCSV', () => {
    it('should parse simple CSV content', () => {
      const csvContent = `Date,Sales,Orders
2024-01-01,1000.50,25
2024-01-02,1200.75,30`;

      const result = parseCSV(csvContent);

      expect(result.headers).toEqual(['Date', 'Sales', 'Orders']);
      expect(result.rowCount).toBe(2);
      expect(result.rows[0]).toEqual({
        Date: '2024-01-01',
        Sales: '1000.50',
        Orders: '25',
      });
    });

    it('should handle quoted values with commas', () => {
      const csvContent = `Date,Sales,Notes
2024-01-01,1000.50,"Busy day, great sales"
2024-01-02,1200.75,"Normal"`;

      const result = parseCSV(csvContent);

      expect(result.rows[0].Notes).toBe('Busy day, great sales');
      expect(result.rows[1].Notes).toBe('Normal');
    });

    it('should handle escaped quotes', () => {
      const csvContent = `Date,Sales,Notes
2024-01-01,1000.50,"Customer said ""excellent"""`;

      const result = parseCSV(csvContent);

      expect(result.rows[0].Notes).toBe('Customer said "excellent"');
    });

    it('should skip empty lines', () => {
      const csvContent = `Date,Sales,Orders
2024-01-01,1000.50,25

2024-01-02,1200.75,30`;

      const result = parseCSV(csvContent);

      expect(result.rowCount).toBe(2);
    });

    it('should throw error for empty CSV', () => {
      expect(() => parseCSV('')).toThrow('CSV file is empty');
    });
  });

  describe('validateCSVData', () => {
    it('should validate valid data', () => {
      const rows = [
        { Date: '2024-01-01', Sales: '1000.50', Orders: '25' },
        { Date: '2024-01-02', Sales: '1200.75', Orders: '30' },
      ];
      const mapping = {
        date: 'Date',
        totalSales: 'Sales',
        totalOrders: 'Orders',
      };

      const result = validateCSVData(rows, mapping);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const rows = [
        { Date: '2024-01-01', Sales: '', Orders: '25' },
      ];
      const mapping = {
        date: 'Date',
        totalSales: 'Sales',
      };

      const result = validateCSVData(rows, mapping);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('totalSales');
    });

    it('should detect invalid date format', () => {
      const rows = [
        { Date: 'not-a-date', Sales: '1000.50', Orders: '25' },
      ];
      const mapping = {
        date: 'Date',
        totalSales: 'Sales',
      };

      const result = validateCSVData(rows, mapping);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'date')).toBe(true);
    });

    it('should detect invalid numeric values', () => {
      const rows = [
        { Date: '2024-01-01', Sales: 'abc', Orders: '25' },
      ];
      const mapping = {
        date: 'Date',
        totalSales: 'Sales',
      };

      const result = validateCSVData(rows, mapping);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'totalSales')).toBe(true);
    });

    it('should detect negative sales values', () => {
      const rows = [
        { Date: '2024-01-01', Sales: '-100.50', Orders: '25' },
      ];
      const mapping = {
        date: 'Date',
        totalSales: 'Sales',
      };

      const result = validateCSVData(rows, mapping);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('negative'))).toBe(true);
    });

    it('should generate warnings for invalid optional fields', () => {
      const rows = [
        { Date: '2024-01-01', Sales: '1000.50', Lunch: 'invalid' },
      ];
      const mapping = {
        date: 'Date',
        totalSales: 'Sales',
        lunchSales: 'Lunch',
      };

      const result = validateCSVData(rows, mapping);

      expect(result.valid).toBe(true); // Still valid, just warnings
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].field).toBe('lunchSales');
    });

    it('should require date mapping', () => {
      const rows = [];
      const mapping = {
        date: '',
        totalSales: 'Sales',
      };

      const result = validateCSVData(rows, mapping);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'date')).toBe(true);
    });

    it('should require totalSales mapping', () => {
      const rows = [];
      const mapping = {
        date: 'Date',
        totalSales: '',
      };

      const result = validateCSVData(rows, mapping);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'totalSales')).toBe(true);
    });
  });

  describe('normalizeCSVRow', () => {
    it('should normalize valid row', () => {
      const row = {
        Date: '2024-01-01',
        Sales: '1000.50',
        Orders: '25',
        Lunch: '400.25',
        Dinner: '600.25',
        Notes: 'Test note',
      };
      const mapping = {
        date: 'Date',
        totalSales: 'Sales',
        totalOrders: 'Orders',
        lunchSales: 'Lunch',
        dinnerSales: 'Dinner',
        notes: 'Notes',
      };

      const result = normalizeCSVRow(row, mapping);

      expect(result.date).toBe('2024-01-01');
      expect(result.totalSales).toBe(1000.50);
      expect(result.totalOrders).toBe(25);
      expect(result.lunchSales).toBe(400.25);
      expect(result.dinnerSales).toBe(600.25);
      expect(result.notes).toBe('Test note');
    });

    it('should handle missing optional fields', () => {
      const row = {
        Date: '2024-01-01',
        Sales: '1000.50',
      };
      const mapping = {
        date: 'Date',
        totalSales: 'Sales',
      };

      const result = normalizeCSVRow(row, mapping);

      expect(result.date).toBe('2024-01-01');
      expect(result.totalSales).toBe(1000.50);
      expect(result.totalOrders).toBe(0);
      expect(result.lunchSales).toBeNull();
      expect(result.dinnerSales).toBeNull();
      expect(result.notes).toBeNull();
    });

    it('should clean currency symbols from numbers', () => {
      const row = {
        Date: '2024-01-01',
        Sales: '$1,000.50',
        Orders: '25',
      };
      const mapping = {
        date: 'Date',
        totalSales: 'Sales',
        totalOrders: 'Orders',
      };

      const result = normalizeCSVRow(row, mapping);

      expect(result.totalSales).toBe(1000.50);
    });

    it('should normalize various date formats', () => {
      const testCases = [
        { input: '2024-01-15', expected: '2024-01-15' },
        { input: '01/15/2024', expected: '2024-01-15' },
        { input: 'January 15, 2024', expected: '2024-01-15' },
      ];

      testCases.forEach(({ input, expected }) => {
        const row = { Date: input, Sales: '1000.50' };
        const mapping = { date: 'Date', totalSales: 'Sales' };
        const result = normalizeCSVRow(row, mapping);
        expect(result.date).toBe(expected);
      });
    });

    it('should handle invalid optional numeric values gracefully', () => {
      const row = {
        Date: '2024-01-01',
        Sales: '1000.50',
        Lunch: 'invalid',
      };
      const mapping = {
        date: 'Date',
        totalSales: 'Sales',
        lunchSales: 'Lunch',
      };

      const result = normalizeCSVRow(row, mapping);

      expect(result.lunchSales).toBeNull();
    });
  });
});
