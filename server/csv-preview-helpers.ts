/**
 * CSV Preview Helpers
 * 
 * Enhanced validation functions that return row-by-row validation results
 * for preview display before importing.
 */

import { parseCSV, validateCSVColumns } from './csv-helpers';
import { getDb } from './db';
import { ingredients } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';

export type RowValidationStatus = 'valid' | 'warning' | 'error';

export interface RowValidation {
  rowIndex: number;
  rowNumber: number; // Display number (1-indexed, includes header)
  status: RowValidationStatus;
  operation?: 'create' | 'update'; // Operation type based on id presence
  errors: string[];
  warnings: string[];
  data: any;
}

export interface CSVPreviewResult {
  valid: boolean;
  totalRows: number;
  validRows: number;
  errorRows: number;
  warningRows: number;
  rows: RowValidation[];
  globalErrors: string[]; // Errors not tied to specific rows (e.g., missing columns)
  columnMapping: { csvColumn: string; dbField: string; required: boolean }[];
}

/**
 * Preview ingredient CSV with row-by-row validation
 * @param csvContent - The CSV content to preview
 * @param restaurantId - The restaurant ID for duplicate name detection
 */
export async function previewIngredientCSV(csvContent: string, restaurantId?: number): Promise<CSVPreviewResult> {
  const globalErrors: string[] = [];
  const rows: RowValidation[] = [];
  
  try {
    const data = parseCSV(csvContent);
    
    // Define column mapping
    const columnMapping = [
      { csvColumn: 'id', dbField: 'id', required: false },
      { csvColumn: 'name', dbField: 'name', required: true },
      { csvColumn: 'category', dbField: 'category', required: false },
      { csvColumn: 'unit', dbField: 'unit', required: true },
      { csvColumn: 'costPerUnit', dbField: 'costPerUnit', required: false },
      { csvColumn: 'pieceWeightOz', dbField: 'pieceWeightOz', required: false },
      { csvColumn: 'supplier', dbField: 'supplier', required: false },
      { csvColumn: 'shelfLife', dbField: 'shelfLife', required: false },
      { csvColumn: 'minStock', dbField: 'minStock', required: false },
    ];
    
    // Validate required columns
    const requiredColumns = columnMapping.filter(c => c.required).map(c => c.csvColumn);
    const validation = validateCSVColumns(data, requiredColumns);
    
    if (!validation.valid) {
      globalErrors.push(`Missing required columns: ${validation.missing.join(", ")}`);
      return {
        valid: false,
        totalRows: 0,
        validRows: 0,
        errorRows: 0,
        warningRows: 0,
        rows: [],
        globalErrors,
        columnMapping,
      };
    }
    
    // Validate each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2; // +2 because CSV is 1-indexed and has header row
      const rowErrors: string[] = [];
      const rowWarnings: string[] = [];
      
      // Required field validations
      // id is optional - if provided, must be valid integer
      if (row.id && isNaN(parseInt(row.id))) {
        rowErrors.push('ID must be a valid number');
      }
      
      if (!row.name || row.name.trim() === "") {
        rowErrors.push('Missing ingredient name');
      }
      
      if (!row.unit || row.unit.trim() === "") {
        rowErrors.push('Missing unit');
      }
      
      // Optional field validations
      if (row.costPerUnit) {
        if (isNaN(parseFloat(row.costPerUnit))) {
          rowErrors.push('Cost per unit must be a number');
        } else if (parseFloat(row.costPerUnit) < 0) {
          rowWarnings.push('Cost per unit is negative');
        }
      } else {
        rowWarnings.push('No cost data - will not calculate recipe costs');
      }
      
      if (row.pieceWeightOz && isNaN(parseFloat(row.pieceWeightOz))) {
        rowErrors.push('Piece weight must be a number');
      }
      
      if (row.shelfLife && isNaN(parseInt(row.shelfLife))) {
        rowErrors.push('Shelf life must be an integer');
      }
      
      if (row.minStock && isNaN(parseFloat(row.minStock))) {
        rowErrors.push('Min stock must be a number');
      }
      
      if (!row.supplier || row.supplier.trim() === "") {
        rowWarnings.push('No supplier information');
      }
      
      // Determine operation type (create or update)
      const hasId = row.id && row.id.trim() !== '';
      const operation: 'create' | 'update' = hasId ? 'update' : 'create';
      
      // Check for duplicate names (only for create operations)
      if (operation === 'create' && restaurantId && row.name && row.name.trim() !== '') {
        const db = await getDb();
        if (db) {
          const existing = await db
            .select()
            .from(ingredients)
            .where(
              and(
                eq(ingredients.restaurantId, restaurantId),
                eq(ingredients.name, row.name.trim())
              )
            )
            .limit(1);
          
          if (existing.length > 0) {
            rowWarnings.push(`Duplicate name: "${row.name}" already exists (ID: ${existing[0].id}). This will create a duplicate ingredient.`);
          }
        }
      }
      
      // Determine status
      let status: RowValidationStatus = 'valid';
      if (rowErrors.length > 0) {
        status = 'error';
      } else if (rowWarnings.length > 0) {
        status = 'warning';
      }
      
      rows.push({
        rowIndex: i,
        rowNumber: rowNum,
        status,
        operation,
        errors: rowErrors,
        warnings: rowWarnings,
        data: row,
      });
    }
    
    // Calculate summary statistics
    const validRows = rows.filter(r => r.status === 'valid').length;
    const errorRows = rows.filter(r => r.status === 'error').length;
    const warningRows = rows.filter(r => r.status === 'warning').length;
    
    return {
      valid: errorRows === 0,
      totalRows: rows.length,
      validRows,
      errorRows,
      warningRows,
      rows,
      globalErrors,
      columnMapping,
    };
  } catch (error) {
    globalErrors.push(error instanceof Error ? error.message : String(error));
    return {
      valid: false,
      totalRows: 0,
      validRows: 0,
      errorRows: 0,
      warningRows: 0,
      rows: [],
      globalErrors,
      columnMapping: [],
    };
  }
}

/**
 * Preview recipe CSV with row-by-row validation
 */
export function previewRecipeCSV(csvContent: string): CSVPreviewResult {
  const globalErrors: string[] = [];
  const rows: RowValidation[] = [];
  
  try {
    const data = parseCSV(csvContent);
    
    // Define column mapping
    const columnMapping = [
      { csvColumn: 'id', dbField: 'id', required: true },
      { csvColumn: 'name', dbField: 'name', required: true },
      { csvColumn: 'description', dbField: 'description', required: false },
      { csvColumn: 'category', dbField: 'category', required: false },
      { csvColumn: 'servings', dbField: 'servings', required: false },
      { csvColumn: 'prepTime', dbField: 'prepTime', required: false },
      { csvColumn: 'cookTime', dbField: 'cookTime', required: false },
      { csvColumn: 'costPerServing', dbField: 'costPerServing', required: false },
      { csvColumn: 'sellingPrice', dbField: 'sellingPrice', required: false },
    ];
    
    // Validate required columns
    const requiredColumns = columnMapping.filter(c => c.required).map(c => c.csvColumn);
    const validation = validateCSVColumns(data, requiredColumns);
    
    if (!validation.valid) {
      globalErrors.push(`Missing required columns: ${validation.missing.join(", ")}`);
      return {
        valid: false,
        totalRows: 0,
        validRows: 0,
        errorRows: 0,
        warningRows: 0,
        rows: [],
        globalErrors,
        columnMapping,
      };
    }
    
    // Validate each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2;
      const rowErrors: string[] = [];
      const rowWarnings: string[] = [];
      
      // Required field validations
      // id is optional - if provided, must be valid integer
      if (row.id && isNaN(parseInt(row.id))) {
        rowErrors.push('ID must be a valid number');
      }
      
      if (!row.name || row.name.trim() === "") {
        rowErrors.push('Missing recipe name');
      }
      
      // Optional field validations
      if (row.servings && isNaN(parseInt(row.servings))) {
        rowErrors.push('Servings must be an integer');
      }
      
      if (row.prepTime && isNaN(parseInt(row.prepTime))) {
        rowErrors.push('Prep time must be an integer');
      }
      
      if (row.cookTime && isNaN(parseInt(row.cookTime))) {
        rowErrors.push('Cook time must be an integer');
      }
      
      if (row.costPerServing && isNaN(parseFloat(row.costPerServing))) {
        rowErrors.push('Cost per serving must be a number');
      }
      
      if (row.sellingPrice) {
        if (isNaN(parseFloat(row.sellingPrice))) {
          rowErrors.push('Selling price must be a number');
        } else if (parseFloat(row.sellingPrice) < 0) {
          rowWarnings.push('Selling price is negative');
        }
      } else {
        rowWarnings.push('No selling price - cannot calculate margin');
      }
      
      if (!row.category || row.category.trim() === "") {
        rowWarnings.push('No category assigned');
      }
      
      // Determine operation type (create or update)
      const hasId = row.id && row.id.trim() !== '';
      const operation: 'create' | 'update' = hasId ? 'update' : 'create';
      
      // Determine status
      let status: RowValidationStatus = 'valid';
      if (rowErrors.length > 0) {
        status = 'error';
      } else if (rowWarnings.length > 0) {
        status = 'warning';
      }
      
      rows.push({
        rowIndex: i,
        rowNumber: rowNum,
        status,
        operation,
        errors: rowErrors,
        warnings: rowWarnings,
        data: row,
      });
    }
    
    // Calculate summary statistics
    const validRows = rows.filter(r => r.status === 'valid').length;
    const errorRows = rows.filter(r => r.status === 'error').length;
    const warningRows = rows.filter(r => r.status === 'warning').length;
    
    return {
      valid: errorRows === 0,
      totalRows: rows.length,
      validRows,
      errorRows,
      warningRows,
      rows,
      globalErrors,
      columnMapping,
    };
  } catch (error) {
    globalErrors.push(error instanceof Error ? error.message : String(error));
    return {
      valid: false,
      totalRows: 0,
      validRows: 0,
      errorRows: 0,
      warningRows: 0,
      rows: [],
      globalErrors,
      columnMapping: [],
    };
  }
}

/**
 * Preview recipe ingredients CSV with row-by-row validation
 */
export function previewRecipeIngredientsCSV(csvContent: string): CSVPreviewResult {
  const globalErrors: string[] = [];
  const rows: RowValidation[] = [];
  
  try {
    const data = parseCSV(csvContent);
    
    // Define column mapping
    const columnMapping = [
      { csvColumn: 'recipeId', dbField: 'recipeId', required: true },
      { csvColumn: 'recipeName', dbField: 'recipeName (reference only)', required: false },
      { csvColumn: 'ingredientId', dbField: 'ingredientId', required: true },
      { csvColumn: 'ingredientName', dbField: 'ingredientName (reference only)', required: false },
      { csvColumn: 'quantity', dbField: 'quantity', required: true },
      { csvColumn: 'unit', dbField: 'unit', required: true },
    ];
    
    // Validate required columns
    const requiredColumns = columnMapping.filter(c => c.required).map(c => c.csvColumn);
    const validation = validateCSVColumns(data, requiredColumns);
    
    if (!validation.valid) {
      globalErrors.push(`Missing required columns: ${validation.missing.join(", ")}`);
      return {
        valid: false,
        totalRows: 0,
        validRows: 0,
        errorRows: 0,
        warningRows: 0,
        rows: [],
        globalErrors,
        columnMapping,
      };
    }
    
    // Validate each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2;
      const rowErrors: string[] = [];
      const rowWarnings: string[] = [];
      
      // Required field validations
      if (!row.recipeId || isNaN(parseInt(row.recipeId))) {
        rowErrors.push('Invalid or missing recipe ID');
      }
      
      if (!row.ingredientId || isNaN(parseInt(row.ingredientId))) {
        rowErrors.push('Invalid or missing ingredient ID');
      }
      
      if (!row.quantity || isNaN(parseFloat(row.quantity))) {
        rowErrors.push('Invalid or missing quantity');
      } else if (parseFloat(row.quantity) <= 0) {
        rowErrors.push('Quantity must be greater than zero');
      }
      
      if (!row.unit || row.unit.trim() === "") {
        rowErrors.push('Missing unit');
      }
      
      // Warnings for reference fields
      if (!row.recipeName || row.recipeName.trim() === "") {
        rowWarnings.push('No recipe name (reference only, not required)');
      }
      
      if (!row.ingredientName || row.ingredientName.trim() === "") {
        rowWarnings.push('No ingredient name (reference only, not required)');
      }
      
      // Determine operation type (create or update)
      const hasId = row.id && row.id.trim() !== '';
      const operation: 'create' | 'update' = hasId ? 'update' : 'create';
      
      // Determine status
      let status: RowValidationStatus = 'valid';
      if (rowErrors.length > 0) {
        status = 'error';
      } else if (rowWarnings.length > 0) {
        status = 'warning';
      }
      
      rows.push({
        rowIndex: i,
        rowNumber: rowNum,
        status,
        operation,
        errors: rowErrors,
        warnings: rowWarnings,
        data: row,
      });
    }
    
    // Calculate summary statistics
    const validRows = rows.filter(r => r.status === 'valid').length;
    const errorRows = rows.filter(r => r.status === 'error').length;
    const warningRows = rows.filter(r => r.status === 'warning').length;
    
    return {
      valid: errorRows === 0,
      totalRows: rows.length,
      validRows,
      errorRows,
      warningRows,
      rows,
      globalErrors,
      columnMapping,
    };
  } catch (error) {
    globalErrors.push(error instanceof Error ? error.message : String(error));
    return {
      valid: false,
      totalRows: 0,
      validRows: 0,
      errorRows: 0,
      warningRows: 0,
      rows: [],
      globalErrors,
      columnMapping: [],
    };
  }
}
