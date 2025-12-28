/**
 * CSV Parser for POS Data Import
 * Handles parsing, validation, and normalization of CSV files from various POS systems
 */

export interface CSVRow {
  [key: string]: string;
}

export interface ParsedCSV {
  headers: string[];
  rows: CSVRow[];
  rowCount: number;
}

export interface FieldMapping {
  date: string;
  totalSales: string;
  totalOrders?: string;
  customerCount?: string;
  lunchSales?: string;
  dinnerSales?: string;
  notes?: string;
}

export interface ValidationError {
  row: number;
  field: string;
  value: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Parse CSV content into structured data
 */
export function parseCSV(content: string): ParsedCSV {
  const trimmed = content.trim();
  
  if (!trimmed) {
    throw new Error('CSV file is empty');
  }

  const lines = trimmed.split('\n');
  
  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  // Parse headers
  const headers = parseCSVLine(lines[0]);
  
  // Parse rows
  const rows: CSVRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    const values = parseCSVLine(line);
    if (values.length === 0 || (values.length === 1 && !values[0])) continue; // Skip empty lines
    
    const row: CSVRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return {
    headers,
    rows,
    rowCount: rows.length,
  };
}

/**
 * Parse a single CSV line, handling quoted values and commas
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current.trim());

  return result;
}

/**
 * Validate CSV data against field mapping
 */
export function validateCSVData(
  rows: CSVRow[],
  mapping: FieldMapping
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Check required mappings
  if (!mapping.date) {
    errors.push({
      row: 0,
      field: 'date',
      value: '',
      message: 'Date field mapping is required',
    });
  }

  if (!mapping.totalSales) {
    errors.push({
      row: 0,
      field: 'totalSales',
      value: '',
      message: 'Total Sales field mapping is required',
    });
  }

  // If required mappings are missing, return early
  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }

  // Validate each row
  rows.forEach((row, index) => {
    const rowNumber = index + 2; // +2 because row 1 is headers, and index is 0-based

    // Validate date
    const dateValue = row[mapping.date];
    if (!dateValue) {
      errors.push({
        row: rowNumber,
        field: 'date',
        value: dateValue,
        message: 'Date is required',
      });
    } else if (!isValidDate(dateValue)) {
      errors.push({
        row: rowNumber,
        field: 'date',
        value: dateValue,
        message: 'Invalid date format (expected YYYY-MM-DD, MM/DD/YYYY, or similar)',
      });
    }

    // Validate totalSales
    const salesValue = row[mapping.totalSales];
    if (!salesValue) {
      errors.push({
        row: rowNumber,
        field: 'totalSales',
        value: salesValue,
        message: 'Total Sales is required',
      });
    } else if (!isValidNumber(salesValue)) {
      errors.push({
        row: rowNumber,
        field: 'totalSales',
        value: salesValue,
        message: 'Total Sales must be a valid number',
      });
    } else if (parseFloat(cleanNumber(salesValue)) < 0) {
      errors.push({
        row: rowNumber,
        field: 'totalSales',
        value: salesValue,
        message: 'Total Sales cannot be negative',
      });
    }

    // Validate optional numeric fields
    if (mapping.totalOrders) {
      const ordersValue = row[mapping.totalOrders];
      if (ordersValue && !isValidInteger(ordersValue)) {
        errors.push({
          row: rowNumber,
          field: 'totalOrders',
          value: ordersValue,
          message: 'Total Orders must be a valid integer',
        });
      }
    }

    if (mapping.lunchSales) {
      const lunchValue = row[mapping.lunchSales];
      if (lunchValue && !isValidNumber(lunchValue)) {
        warnings.push({
          row: rowNumber,
          field: 'lunchSales',
          value: lunchValue,
          message: 'Lunch Sales is not a valid number, will be skipped',
        });
      }
    }

    if (mapping.dinnerSales) {
      const dinnerValue = row[mapping.dinnerSales];
      if (dinnerValue && !isValidNumber(dinnerValue)) {
        warnings.push({
          row: rowNumber,
          field: 'dinnerSales',
          value: dinnerValue,
          message: 'Dinner Sales is not a valid number, will be skipped',
        });
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Normalize CSV row to sales data format
 */
export interface NormalizedSalesData {
  date: string; // YYYY-MM-DD format
  totalSales: number;
  totalOrders: number;
  lunchSales: number | null;
  dinnerSales: number | null;
  notes: string | null;
}

export function normalizeCSVRow(
  row: CSVRow,
  mapping: FieldMapping
): NormalizedSalesData {
  return {
    date: normalizeDate(row[mapping.date]),
    totalSales: parseFloat(cleanNumber(row[mapping.totalSales])),
    totalOrders: mapping.totalOrders && row[mapping.totalOrders]
      ? parseInt(cleanNumber(row[mapping.totalOrders]))
      : 0,
    lunchSales: mapping.lunchSales && row[mapping.lunchSales] && isValidNumber(row[mapping.lunchSales])
      ? parseFloat(cleanNumber(row[mapping.lunchSales]))
      : null,
    dinnerSales: mapping.dinnerSales && row[mapping.dinnerSales] && isValidNumber(row[mapping.dinnerSales])
      ? parseFloat(cleanNumber(row[mapping.dinnerSales]))
      : null,
    notes: mapping.notes && row[mapping.notes] ? row[mapping.notes] : null,
  };
}

/**
 * Helper: Check if string is a valid date
 */
function isValidDate(value: string): boolean {
  if (!value) return false;
  
  // Try parsing with Date constructor
  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * Helper: Normalize date to YYYY-MM-DD format (UTC)
 */
function normalizeDate(value: string): string {
  const date = new Date(value);
  // Use UTC to avoid timezone issues
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Helper: Check if string is a valid number
 */
function isValidNumber(value: string): boolean {
  if (!value) return false;
  const cleaned = cleanNumber(value);
  return !isNaN(parseFloat(cleaned));
}

/**
 * Helper: Check if string is a valid integer
 */
function isValidInteger(value: string): boolean {
  if (!value) return false;
  const cleaned = cleanNumber(value);
  return /^\d+$/.test(cleaned);
}

/**
 * Helper: Clean number string (remove currency symbols, commas, etc.)
 */
function cleanNumber(value: string): string {
  return value.replace(/[$,\s]/g, '');
}
