/**
 * CSV Preview Helpers
 * 
 * Enhanced validation functions that return row-by-row validation results
 * for preview display before importing.
 */

import { parseCSV, validateCSVColumns } from './csv-helpers';
import { getDb } from './db';
import { ingredients } from '../drizzle/schema';
import { eq, and, inArray } from 'drizzle-orm';

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
    
    // Build a map of ingredient names to detect within-CSV duplicates
    const nameOccurrences = new Map<string, number[]>(); // name -> array of row indices
    data.forEach((row, index) => {
      if (row.name && row.name.trim() !== '') {
        const normalizedName = row.name.trim().toLowerCase();
        if (!nameOccurrences.has(normalizedName)) {
          nameOccurrences.set(normalizedName, []);
        }
        nameOccurrences.get(normalizedName)!.push(index);
      }
    });
    
    // Batch query for database duplicates (only for create operations)
    const existingIngredients = new Map<string, number>(); // name -> id
    if (restaurantId) {
      try {
        const db = await getDb();
        if (db) {
          // Get all ingredient names from create operations
          const createNames = data
            .filter(row => !row.id || row.id.trim() === '')
            .map(row => row.name?.trim())
            .filter(name => name && name !== '');
          
          if (createNames.length > 0) {
            // Batch query for all names at once
            const existing = await db
              .select()
              .from(ingredients)
              .where(
                and(
                  eq(ingredients.restaurantId, restaurantId),
                  inArray(ingredients.name, createNames)
                )
              );
            
            // Build lookup map
            existing.forEach(ing => {
              existingIngredients.set(ing.name, ing.id);
            });
          }
        }
      } catch (error) {
        console.error('Error batch checking for duplicate ingredients:', error);
        // Continue without duplicate check if database query fails
      }
    }
    
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
      if (operation === 'create' && row.name && row.name.trim() !== '') {
        const existingId = existingIngredients.get(row.name.trim());
        if (existingId) {
          rowWarnings.push(`Database duplicate: "${row.name}" already exists (ID: ${existingId}). This will create a duplicate ingredient.`);
        }
      }
      
      // Check for within-CSV duplicates
      if (row.name && row.name.trim() !== '') {
        const normalizedName = row.name.trim().toLowerCase();
        const occurrences = nameOccurrences.get(normalizedName) || [];
        if (occurrences.length > 1) {
          // This name appears multiple times in the CSV
          const otherRows = occurrences
            .filter(idx => idx !== i)
            .map(idx => idx + 2) // +2 for 1-indexed and header row
            .join(', ');
          rowWarnings.push(`CSV duplicate: "${row.name}" appears multiple times in this file (rows: ${rowNum}, ${otherRows}). This will create ${occurrences.length} ingredients with the same name.`);
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
