/**
 * CSV Export/Import Helpers
 * 
 * Provides utilities for exporting and importing data in CSV format
 * with support for column visibility filtering and bulk editing workflows.
 */

import { parse } from "csv-parse/sync";

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV(data: any[], columns?: string[]): string {
  if (data.length === 0) {
    return "";
  }

  // Use provided columns or extract from first object
  const headers = columns || Object.keys(data[0]);
  
  // Build CSV header row
  const headerRow = headers.map(escapeCSVField).join(",");
  
  // Build data rows
  const dataRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      return escapeCSVField(value);
    }).join(",");
  });
  
  return [headerRow, ...dataRows].join("\n");
}

/**
 * Escape CSV field value (handle commas, quotes, newlines)
 */
function escapeCSVField(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }
  
  const stringValue = String(value);
  
  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Parse CSV string to array of objects
 */
export function parseCSV(csvContent: string): any[] {
  try {
    // Remove BOM if present
    let cleanedContent = csvContent.replace(/^\uFEFF/, '');
    
    // Split into lines and find the actual header row
    const lines = cleanedContent.split('\n');
    let headerIndex = -1;
    
    // Look for the header row - it should contain common column names
    // and not start with # or contain only metadata markers
    const commonHeaders = ['id', 'name', 'category', 'unit', 'recipeId', 'ingredientId', 'quantity'];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip comment lines, empty lines, and metadata rows
      if (!line || line.startsWith('#') || line.startsWith('//')) {
        continue;
      }
      
      // Check if this line contains actual column headers
      const lowerLine = line.toLowerCase();
      if (commonHeaders.some(header => lowerLine.includes(header))) {
        headerIndex = i;
        break;
      }
    }
    
    // If no header found, assume first non-empty, non-comment line is header
    if (headerIndex === -1) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && !line.startsWith('#') && !line.startsWith('//')) {
          headerIndex = i;
          break;
        }
      }
    }
    
    // Reconstruct CSV starting from header row
    const cleanedLines = lines.slice(headerIndex);
    cleanedContent = cleanedLines.join('\n');
    
    const records = parse(cleanedContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_quotes: true,
      relax_column_count: true,
    });
    
    // Filter out rows that are metadata (REQUIRED, OPTIONAL, STRING, etc.)
    const metadataKeywords = [
      'REQUIRED', 'OPTIONAL', 'STRING', 'INTEGER', 'DECIMAL', 
      'Text, max', 'Must be unique', 'Positive number', 'Positive integer',
      'Use existing', 'Only needed if', 'Minimum stock level'
    ];
    const filteredRecords = records.filter((record: any) => {
      // Check if any field contains metadata keywords
      const values = Object.values(record).map(v => String(v || ''));
      const hasMetadata = values.some(v => metadataKeywords.some(keyword => v.includes(keyword)));
      
      // Also filter out completely empty rows
      const allEmpty = values.every(v => !v || v.trim() === '');
      
      return !hasMetadata && !allEmpty;
    });
    
    return filteredRecords;
  } catch (error) {
    throw new Error(`CSV parsing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Validate CSV has required columns
 */
export function validateCSVColumns(data: any[], requiredColumns: string[]): { valid: boolean; missing: string[] } {
  if (data.length === 0) {
    return { valid: false, missing: requiredColumns };
  }
  
  const actualColumns = Object.keys(data[0]);
  const missing = requiredColumns.filter(col => !actualColumns.includes(col));
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Filter object properties based on column list
 */
export function filterColumns(obj: any, columns: string[]): any {
  const filtered: any = {};
  for (const col of columns) {
    if (col in obj) {
      filtered[col] = obj[col];
    }
  }
  return filtered;
}

/**
 * Convert ingredients data to CSV format
 */
export function ingredientsToCSV(ingredients: any[], visibleColumns?: string[]): string {
  // Define all possible columns in logical order
  const allColumns = [
    "id",
    "name",
    "category",
    "unit",
    "costPerUnit",
    "pieceWeightOz",
    "supplier",
    "shelfLife",
    "minStock",
  ];
  
  // Use visible columns if provided, otherwise use all
  const columns = visibleColumns || allColumns;
  
  // Filter ingredients to only include visible columns
  const filteredData = ingredients.map(ing => filterColumns(ing, columns));
  
  return arrayToCSV(filteredData, columns);
}

/**
 * Convert recipes data to CSV format
 */
export function recipesToCSV(recipes: any[], visibleColumns?: string[]): string {
  // Define all possible columns in logical order
  const allColumns = [
    "id",
    "name",
    "category",
    "description",
    "servings",
    "prepTime",
    "cookTime",
    "sellingPrice",
    "ingredientsCount",
    "totalCost",
    "foodCostPercent",
    "marginPercent",
  ];
  
  // Critical fields that should always be included in export
  const criticalFields = ['id', 'totalCost'];
  
  // Use visible columns if provided, otherwise use all (excluding 'actions')
  let columns = visibleColumns || allColumns;
  
  // Map frontend column IDs to backend field names
  const columnMapping: Record<string, string> = {
    'price': 'sellingPrice',
    'foodCost': 'foodCostPercent',
    'margin': 'marginPercent',
    'ingredients': 'ingredientsCount',
  };
  
  columns = columns.map(col => columnMapping[col] || col);
  
  // Remove UI-only columns that shouldn't be in CSV
  columns = columns.filter(col => col !== 'actions');
  
  // Always include critical financial fields even if not visible in UI
  for (const field of criticalFields) {
    if (!columns.includes(field)) {
      // Insert critical fields at the beginning for better visibility
      columns.unshift(field);
    }
  }
  
  // Transform recipes to flatten complex fields
  const transformedRecipes = recipes.map(recipe => ({
    id: recipe.id,
    name: recipe.name,
    category: recipe.category,
    description: recipe.description,
    servings: recipe.servings,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    sellingPrice: recipe.sellingPrice,
    ingredientsCount: Array.isArray(recipe.ingredients) ? recipe.ingredients.length : 0,
    totalCost: recipe.totalCost,
    foodCostPercent: recipe.foodCostPercent,
    marginPercent: recipe.marginPercent,
  }));
  
  // Filter to only include visible columns
  const filteredData = transformedRecipes.map(recipe => filterColumns(recipe, columns));
  
  return arrayToCSV(filteredData, columns);
}

/**
 * Convert recipe ingredients data to CSV format (for bulk editing)
 */
export function recipeIngredientsToCSV(recipeIngredients: any[]): string {
  const columns = [
    "recipeId",
    "recipeName",
    "ingredientId",
    "ingredientName",
    "quantity",
    "unit",
  ];
  
  return arrayToCSV(recipeIngredients, columns);
}

/**
 * Validate and parse ingredient CSV for import
 */
export function parseIngredientCSV(csvContent: string): {
  valid: boolean;
  data: any[];
  errors: string[];
} {
  const errors: string[] = [];
  
  try {
    const data = parseCSV(csvContent);
    
    // Validate required columns (id is optional - if missing, will create new ingredients)
    const requiredColumns = ["name", "unit"];
    const validation = validateCSVColumns(data, requiredColumns);
    
    if (!validation.valid) {
      errors.push(`Missing required columns: ${validation.missing.join(", ")}`);
      return { valid: false, data: [], errors };
    }
    
    // Validate each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2; // +2 because CSV is 1-indexed and has header row
      
      // id is optional - if present, must be valid integer
      if (row.id && isNaN(parseInt(row.id))) {
        errors.push(`Row ${rowNum}: Invalid id (must be a number)`);
      }
      
      if (!row.name || row.name.trim() === "") {
        errors.push(`Row ${rowNum}: Missing name`);
      }
      
      if (!row.unit || row.unit.trim() === "") {
        errors.push(`Row ${rowNum}: Missing unit`);
      }
      
      if (row.costPerUnit && isNaN(parseFloat(row.costPerUnit))) {
        errors.push(`Row ${rowNum}: Invalid costPerUnit (must be a number)`);
      }
      
      if (row.pieceWeightOz && isNaN(parseFloat(row.pieceWeightOz))) {
        errors.push(`Row ${rowNum}: Invalid pieceWeightOz (must be a number)`);
      }
      
      if (row.shelfLife && isNaN(parseInt(row.shelfLife))) {
        errors.push(`Row ${rowNum}: Invalid shelfLife (must be an integer)`);
      }
      
      if (row.minStock && isNaN(parseFloat(row.minStock))) {
        errors.push(`Row ${rowNum}: Invalid minStock (must be a number)`);
      }
    }
    
    return {
      valid: errors.length === 0,
      data,
      errors,
    };
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
    return { valid: false, data: [], errors };
  }
}

/**
 * Validate and parse recipe CSV for import
 */
export function parseRecipeCSV(csvContent: string): {
  valid: boolean;
  data: any[];
  errors: string[];
} {
  const errors: string[] = [];
  
  try {
    const data = parseCSV(csvContent);
    
    // Validate required columns
    const requiredColumns = ["id", "name"];
    const validation = validateCSVColumns(data, requiredColumns);
    
    if (!validation.valid) {
      errors.push(`Missing required columns: ${validation.missing.join(", ")}`);
      return { valid: false, data: [], errors };
    }
    
    // Validate each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2;
      
      // id is optional - if present, must be valid integer
      if (row.id && isNaN(parseInt(row.id))) {
        errors.push(`Row ${rowNum}: Invalid id (must be a number)`);
      }
      
      if (!row.name || row.name.trim() === "") {
        errors.push(`Row ${rowNum}: Missing name`);
      }
      
      if (row.servings && isNaN(parseInt(row.servings))) {
        errors.push(`Row ${rowNum}: Invalid servings (must be an integer)`);
      }
      
      if (row.prepTime && isNaN(parseInt(row.prepTime))) {
        errors.push(`Row ${rowNum}: Invalid prepTime (must be an integer)`);
      }
      
      if (row.cookTime && isNaN(parseInt(row.cookTime))) {
        errors.push(`Row ${rowNum}: Invalid cookTime (must be an integer)`);
      }
      
      if (row.sellingPrice && isNaN(parseFloat(row.sellingPrice))) {
        errors.push(`Row ${rowNum}: Invalid sellingPrice (must be a number)`);
      }
    }
    
    return {
      valid: errors.length === 0,
      data,
      errors,
    };
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
    return { valid: false, data: [], errors };
  }
}

/**
 * Validate and parse recipe ingredients CSV for import
 */
export function parseRecipeIngredientsCSV(csvContent: string): {
  valid: boolean;
  data: any[];
  errors: string[];
} {
  const errors: string[] = [];
  
  try {
    const data = parseCSV(csvContent);
    
    // Validate required columns
    const requiredColumns = ["recipeId", "ingredientId", "quantity", "unit"];
    const validation = validateCSVColumns(data, requiredColumns);
    
    if (!validation.valid) {
      errors.push(`Missing required columns: ${validation.missing.join(", ")}`);
      return { valid: false, data: [], errors };
    }
    
    // Validate each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2;
      
      if (!row.recipeId || isNaN(parseInt(row.recipeId))) {
        errors.push(`Row ${rowNum}: Invalid or missing recipeId`);
      }
      
      if (!row.ingredientId || isNaN(parseInt(row.ingredientId))) {
        errors.push(`Row ${rowNum}: Invalid or missing ingredientId`);
      }
      
      if (!row.quantity || isNaN(parseFloat(row.quantity))) {
        errors.push(`Row ${rowNum}: Invalid or missing quantity (must be a number)`);
      }
      
      if (!row.unit || row.unit.trim() === "") {
        errors.push(`Row ${rowNum}: Missing unit`);
      }
    }
    
    return {
      valid: errors.length === 0,
      data,
      errors,
    };
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
    return { valid: false, data: [], errors };
  }
}
