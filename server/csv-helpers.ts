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
      'REQUIRED', 'OPTIONAL', 'STRING', 'INTEGER', 'DECIMAL', 'READ-ONLY',
      'Text, max', 'Must be unique', 'Positive number', 'Positive integer',
      'Use existing', 'Only needed if', 'Minimum stock level',
      'Whole number (must match', 'Text (for reference only', 'Number with up to',
      'Export recipes first', 'Export ingredients first', 'Amount of ingredient',
      'Unit as used in the recipe', 'Helps identify'
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
 * Column metadata for ingredients
 */
interface IngredientColumnMetadata {
  name: string;
  required: string;
  type: string;
  format: string;
  validation: string;
}

const INGREDIENT_COLUMN_METADATA: Record<string, IngredientColumnMetadata> = {
  id: {
    name: 'id',
    required: 'OPTIONAL',
    type: 'INTEGER',
    format: 'Whole number (leave empty to create new ingredient)',
    validation: 'If provided, must match existing ingredient ID to update'
  },
  name: {
    name: 'name',
    required: 'REQUIRED',
    type: 'STRING',
    format: 'Text, max 255 characters',
    validation: 'Must be unique within your restaurant'
  },
  category: {
    name: 'category',
    required: 'OPTIONAL',
    type: 'STRING',
    format: 'Text, max 100 characters',
    validation: 'Use existing categories or create new ones'
  },
  unit: {
    name: 'unit',
    required: 'REQUIRED',
    type: 'STRING',
    format: 'Unit name (lb, oz, kg, g, gal, qt, pt, cup, tbsp, tsp, ml, L, each, pc)',
    validation: 'Must match existing unit names exactly'
  },
  costPerUnit: {
    name: 'costPerUnit',
    required: 'OPTIONAL',
    type: 'DECIMAL',
    format: 'Number with up to 4 decimal places (e.g., 5.50 or 0.2500)',
    validation: 'Positive number, represents cost per single unit'
  },
  pieceWeightOz: {
    name: 'pieceWeightOz',
    required: 'OPTIONAL',
    type: 'DECIMAL',
    format: 'Number with up to 4 decimal places (weight in oz per piece)',
    validation: 'Only needed if unit is "pc" or "each" for weight conversions'
  },
  supplier: {
    name: 'supplier',
    required: 'OPTIONAL',
    type: 'STRING',
    format: 'Text, max 255 characters',
    validation: ''
  },
  shelfLife: {
    name: 'shelfLife',
    required: 'OPTIONAL',
    type: 'INTEGER',
    format: 'Whole number (days)',
    validation: 'Positive integer representing days'
  },
  minStock: {
    name: 'minStock',
    required: 'OPTIONAL',
    type: 'DECIMAL',
    format: 'Number with up to 2 decimal places',
    validation: 'Minimum stock level in the unit specified'
  }
};

/**
 * Generate metadata rows for ingredient CSV export
 */
function generateIngredientMetadataRows(columns: string[]): string[] {
  const lines: string[] = [];
  
  // Add instructions header
  lines.push('# INGREDIENTS DATA EXPORT');
  lines.push('# This file can be edited and re-imported');
  lines.push('# Lines starting with # are comments and will be ignored during import');
  lines.push('#');
  lines.push('# INSTRUCTIONS:');
  lines.push('# 1. Rows 1-22 contain instructions and metadata - these will be automatically filtered during import');
  lines.push('# 2. Row 23 contains column headers');
  lines.push('# 3. Starting from row 24, you can edit ingredient data');
  lines.push('# 4. To UPDATE existing ingredients: Keep the id column value');
  lines.push('# 5. To CREATE new ingredients: Leave the id column empty or delete it');
  lines.push('# 6. Save as CSV format when done');
  lines.push('#');
  lines.push('# IMPORTANT NOTES:');
  lines.push('# - Name and unit are REQUIRED for all ingredients');
  lines.push('# - Unit must match existing unit names exactly (case-sensitive)');
  lines.push('# - CostPerUnit should be the cost for ONE unit (e.g., cost per 1 lb, not per case)');
  lines.push('# - PieceWeightOz is only needed for "pc" or "each" units to enable weight conversions');
  lines.push('# - Leave optional fields empty if not applicable');
  lines.push('#');
  lines.push('# COMMON UNITS: lb, oz, kg, g, gal, qt, pt, cup, fl oz, tbsp, tsp, ml, L, each, pc');
  lines.push('#');
  lines.push('');
  
  // Row 1: Column names
  lines.push(columns.map(col => escapeCSVField(col)).join(','));
  
  // Row 2: Required/Optional
  lines.push(columns.map(col => {
    const meta = INGREDIENT_COLUMN_METADATA[col];
    return escapeCSVField(meta?.required || 'OPTIONAL');
  }).join(','));
  
  // Row 3: Data types
  lines.push(columns.map(col => {
    const meta = INGREDIENT_COLUMN_METADATA[col];
    return escapeCSVField(meta?.type || 'STRING');
  }).join(','));
  
  // Row 4: Format/validation
  lines.push(columns.map(col => {
    const meta = INGREDIENT_COLUMN_METADATA[col];
    return escapeCSVField(meta?.format || '');
  }).join(','));
  
  // Row 5: Validation rules
  lines.push(columns.map(col => {
    const meta = INGREDIENT_COLUMN_METADATA[col];
    return escapeCSVField(meta?.validation || '');
  }).join(','));
  
  // Row 6: Empty separator
  lines.push('');
  
  return lines;
}

/**
 * Convert ingredients data to CSV format with metadata rows
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
  // Filter out UI-only columns like "actions"
  const columns = visibleColumns 
    ? visibleColumns.filter(col => allColumns.includes(col))
    : allColumns;
  
  // Generate metadata rows
  const metadataRows = generateIngredientMetadataRows(columns);
  
  // Filter ingredients to only include visible columns
  const filteredData = ingredients.map(ing => filterColumns(ing, columns));
  
  // Build data rows
  const dataRows = filteredData.map(row => {
    return columns.map(col => escapeCSVField(row[col])).join(',');
  });
  
  // Combine metadata and data
  return [...metadataRows, ...dataRows].join('\n');
}

/**
 * Column metadata for recipes
 */
interface RecipeColumnMetadata {
  name: string;
  required: string;
  type: string;
  format: string;
  validation: string;
}

const RECIPE_COLUMN_METADATA: Record<string, RecipeColumnMetadata> = {
  id: {
    name: 'id',
    required: 'OPTIONAL',
    type: 'INTEGER',
    format: 'Whole number (leave empty to create new recipe)',
    validation: 'If provided, must match existing recipe ID to update'
  },
  name: {
    name: 'name',
    required: 'REQUIRED',
    type: 'STRING',
    format: 'Text, max 255 characters',
    validation: 'Must be unique within your restaurant'
  },
  category: {
    name: 'category',
    required: 'OPTIONAL',
    type: 'STRING',
    format: 'Text, max 100 characters',
    validation: 'Use existing categories or create new ones'
  },
  description: {
    name: 'description',
    required: 'OPTIONAL',
    type: 'STRING',
    format: 'Text, any length',
    validation: ''
  },
  servings: {
    name: 'servings',
    required: 'OPTIONAL',
    type: 'INTEGER',
    format: 'Whole number',
    validation: 'Number of servings this recipe makes'
  },
  prepTime: {
    name: 'prepTime',
    required: 'OPTIONAL',
    type: 'INTEGER',
    format: 'Whole number (minutes)',
    validation: 'Preparation time in minutes'
  },
  cookTime: {
    name: 'cookTime',
    required: 'OPTIONAL',
    type: 'INTEGER',
    format: 'Whole number (minutes)',
    validation: 'Cooking time in minutes'
  },
  sellingPrice: {
    name: 'sellingPrice',
    required: 'OPTIONAL',
    type: 'DECIMAL',
    format: 'Number with up to 2 decimal places',
    validation: 'Menu price for this recipe'
  },
  ingredientsCount: {
    name: 'ingredientsCount',
    required: 'READ-ONLY',
    type: 'INTEGER',
    format: 'Whole number (calculated automatically)',
    validation: 'Number of ingredients in recipe (for reference only)'
  },
  totalCost: {
    name: 'totalCost',
    required: 'READ-ONLY',
    type: 'DECIMAL',
    format: 'Number with up to 2 decimal places (calculated automatically)',
    validation: 'Total ingredient cost (calculated from recipe ingredients)'
  },
  foodCostPercent: {
    name: 'foodCostPercent',
    required: 'READ-ONLY',
    type: 'DECIMAL',
    format: 'Number with up to 2 decimal places (calculated automatically)',
    validation: 'Food cost as percentage of selling price'
  },
  marginPercent: {
    name: 'marginPercent',
    required: 'READ-ONLY',
    type: 'DECIMAL',
    format: 'Number with up to 2 decimal places (calculated automatically)',
    validation: 'Profit margin as percentage'
  }
};

/**
 * Generate metadata rows for recipe CSV export
 */
function generateRecipeMetadataRows(columns: string[]): string[] {
  const lines: string[] = [];
  
  // Add instructions header
  lines.push('# RECIPES DATA EXPORT');
  lines.push('# This file can be edited and re-imported');
  lines.push('# Lines starting with # are comments and will be ignored during import');
  lines.push('#');
  lines.push('# INSTRUCTIONS:');
  lines.push('# 1. Rows 1-22 contain instructions and metadata - these will be automatically filtered during import');
  lines.push('# 2. Row 23 contains column headers');
  lines.push('# 3. Starting from row 24, you can edit recipe data');
  lines.push('# 4. To UPDATE existing recipes: Keep the id column value');
  lines.push('# 5. To CREATE new recipes: Leave the id column empty or delete it');
  lines.push('# 6. Save as CSV format when done');
  lines.push('#');
  lines.push('# IMPORTANT NOTES:');
  lines.push('# - Name is REQUIRED for all recipes');
  lines.push('# - Financial fields (totalCost, foodCostPercent, marginPercent) are READ-ONLY and calculated automatically');
  lines.push('# - To modify recipe ingredients, use "Export Recipe Ingredients" button instead');
  lines.push('# - SellingPrice is recommended for profitability analysis');
  lines.push('# - Times are in minutes');
  lines.push('#');
  lines.push('# After importing, use "Export Recipe Ingredients" to manage recipe ingredient relationships');
  lines.push('#');
  lines.push('');
  
  // Row 1: Column names
  lines.push(columns.map(col => escapeCSVField(col)).join(','));
  
  // Row 2: Required/Optional
  lines.push(columns.map(col => {
    const meta = RECIPE_COLUMN_METADATA[col];
    return escapeCSVField(meta?.required || 'OPTIONAL');
  }).join(','));
  
  // Row 3: Data types
  lines.push(columns.map(col => {
    const meta = RECIPE_COLUMN_METADATA[col];
    return escapeCSVField(meta?.type || 'STRING');
  }).join(','));
  
  // Row 4: Format/validation
  lines.push(columns.map(col => {
    const meta = RECIPE_COLUMN_METADATA[col];
    return escapeCSVField(meta?.format || '');
  }).join(','));
  
  // Row 5: Validation rules
  lines.push(columns.map(col => {
    const meta = RECIPE_COLUMN_METADATA[col];
    return escapeCSVField(meta?.validation || '');
  }).join(','));
  
  // Row 6: Empty separator
  lines.push('');
  
  return lines;
}

/**
 * Convert recipes data to CSV format with metadata rows
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
  
  // Generate metadata rows
  const metadataRows = generateRecipeMetadataRows(columns);
  
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
  
  // Build data rows
  const dataRows = filteredData.map(row => {
    return columns.map(col => escapeCSVField(row[col])).join(',');
  });
  
  // Combine metadata and data
  return [...metadataRows, ...dataRows].join('\n');
}

/**
 * Column metadata for recipe ingredients
 */
interface RecipeIngredientColumnMetadata {
  name: string;
  required: string;
  type: string;
  format: string;
  validation: string;
}

const RECIPE_INGREDIENT_COLUMN_METADATA: Record<string, RecipeIngredientColumnMetadata> = {
  recipeId: {
    name: 'recipeId',
    required: 'REQUIRED',
    type: 'INTEGER',
    format: 'Whole number (must match existing recipe ID)',
    validation: 'Export recipes first to get recipe IDs'
  },
  recipeName: {
    name: 'recipeName',
    required: 'OPTIONAL',
    type: 'STRING',
    format: 'Text (for reference only, not used in import)',
    validation: 'Helps identify the recipe, but recipeId is used for matching'
  },
  ingredientId: {
    name: 'ingredientId',
    required: 'REQUIRED',
    type: 'INTEGER',
    format: 'Whole number (must match existing ingredient ID)',
    validation: 'Export ingredients first to get ingredient IDs'
  },
  ingredientName: {
    name: 'ingredientName',
    required: 'OPTIONAL',
    type: 'STRING',
    format: 'Text (for reference only, not used in import)',
    validation: 'Helps identify the ingredient, but ingredientId is used for matching'
  },
  quantity: {
    name: 'quantity',
    required: 'REQUIRED',
    type: 'DECIMAL',
    format: 'Number with up to 4 decimal places',
    validation: 'Amount of ingredient used in recipe'
  },
  unit: {
    name: 'unit',
    required: 'REQUIRED',
    type: 'STRING',
    format: 'Unit name (lb, oz, kg, g, cup, tbsp, tsp, each, pc, etc.)',
    validation: 'Unit as used in the recipe (can differ from ingredient storage unit)'
  }
};

/**
 * Generate metadata rows for recipe ingredients CSV export
 */
function generateRecipeIngredientMetadataRows(columns: string[]): string[] {
  const lines: string[] = [];
  
  // Add instructions header
  lines.push('# RECIPE INGREDIENTS DATA EXPORT');
  lines.push('# This file can be edited and re-imported for bulk ingredient updates');
  lines.push('# Lines starting with # are comments and will be ignored during import');
  lines.push('#');
  lines.push('# INSTRUCTIONS:');
  lines.push('# 1. Rows 1-22 contain instructions and metadata - these will be automatically filtered during import');
  lines.push('# 2. Row 23 contains column headers');
  lines.push('# 3. Starting from row 24, you can edit recipe ingredient data');
  lines.push('# 4. You can modify quantity and unit values for bulk updates');
  lines.push('# 5. RecipeName and IngredientName are for reference only (not used in import)');
  lines.push('# 6. Save as CSV format when done');
  lines.push('#');
  lines.push('# IMPORTANT NOTES:');
  lines.push('# - RecipeId, IngredientId, Quantity, and Unit are REQUIRED');
  lines.push('# - RecipeId and IngredientId must match existing records');
  lines.push('# - Unit is how the ingredient is measured IN THE RECIPE (can differ from storage unit)');
  lines.push('# - System will automatically convert units when calculating costs');
  lines.push('#');
  lines.push('# COMMON USE CASE: Bulk unit conversion (e.g., change all "cup" to "oz" for specific ingredient)');
  lines.push('#');
  lines.push('');
  
  // Row 1: Column names
  lines.push(columns.map(col => escapeCSVField(col)).join(','));
  
  // Row 2: Required/Optional
  lines.push(columns.map(col => {
    const meta = RECIPE_INGREDIENT_COLUMN_METADATA[col];
    return escapeCSVField(meta?.required || 'OPTIONAL');
  }).join(','));
  
  // Row 3: Data types
  lines.push(columns.map(col => {
    const meta = RECIPE_INGREDIENT_COLUMN_METADATA[col];
    return escapeCSVField(meta?.type || 'STRING');
  }).join(','));
  
  // Row 4: Format/validation
  lines.push(columns.map(col => {
    const meta = RECIPE_INGREDIENT_COLUMN_METADATA[col];
    return escapeCSVField(meta?.format || '');
  }).join(','));
  
  // Row 5: Validation rules
  lines.push(columns.map(col => {
    const meta = RECIPE_INGREDIENT_COLUMN_METADATA[col];
    return escapeCSVField(meta?.validation || '');
  }).join(','));
  
  // Row 6: Empty separator
  lines.push('');
  
  return lines;
}

/**
 * Convert recipe ingredients data to CSV format with metadata rows (for bulk editing)
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
  
  // Generate metadata rows
  const metadataRows = generateRecipeIngredientMetadataRows(columns);
  
  // Build data rows
  const dataRows = recipeIngredients.map(row => {
    return columns.map(col => escapeCSVField(row[col])).join(',');
  });
  
  // Combine metadata and data
  return [...metadataRows, ...dataRows].join('\n');
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
