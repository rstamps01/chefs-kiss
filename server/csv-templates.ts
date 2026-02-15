/**
 * CSV Template Generation
 * 
 * Generates downloadable CSV templates with:
 * - Column metadata (mandatory/optional, format, type)
 * - Example rows for guidance
 * - Validation rules documentation
 */

interface ColumnMetadata {
  name: string;
  required: boolean;
  type: 'string' | 'number' | 'decimal' | 'integer' | 'boolean' | 'date';
  format: string;
  example: string;
  validation?: string;
}

/**
 * Generate CSV template with metadata header rows
 */
function generateTemplate(columns: ColumnMetadata[], includeExamples: boolean = true): string {
  const lines: string[] = [];

  // Row 1: Column names
  lines.push(columns.map(col => col.name).join(','));

  // Row 2: Required/Optional
  lines.push(columns.map(col => col.required ? 'REQUIRED' : 'OPTIONAL').join(','));

  // Row 3: Data types
  lines.push(columns.map(col => col.type.toUpperCase()).join(','));

  // Row 4: Format/validation
  lines.push(columns.map(col => `"${col.format}"`).join(','));

  // Row 5: Validation rules (if any)
  lines.push(columns.map(col => col.validation ? `"${col.validation}"` : '').join(','));

  // Row 6: Empty separator
  lines.push('');

  // Row 7+: Example rows
  if (includeExamples) {
    lines.push(columns.map(col => col.example).join(','));
  }

  return lines.join('\n');
}

/**
 * Ingredients template metadata
 */
export function generateIngredientsTemplate(): string {
  const columns: ColumnMetadata[] = [
    {
      name: 'id',
      required: false,
      type: 'integer',
      format: 'Positive integer (leave empty for new ingredients)',
      example: '',
      validation: 'If provided, updates existing ingredient; if empty, creates new ingredient'
    },
    {
      name: 'name',
      required: true,
      type: 'string',
      format: 'Text, max 255 characters',
      example: 'Sushi Rice',
      validation: 'Must be unique within your restaurant'
    },
    {
      name: 'category',
      required: false,
      type: 'string',
      format: 'Text, max 100 characters',
      example: 'Grains',
      validation: 'Use existing categories or create new ones'
    },
    {
      name: 'unit',
      required: true,
      type: 'string',
      format: 'Unit name (lb, oz, kg, g, gal, qt, pt, cup, tbsp, tsp, ml, L, each, pc)',
      example: 'lb',
      validation: 'Must match existing unit names exactly'
    },
    {
      name: 'costPerUnit',
      required: false,
      type: 'decimal',
      format: 'Number with up to 4 decimal places (e.g., 5.50 or 0.2500)',
      example: '2.50',
      validation: 'Positive number, represents cost per single unit'
    },
    {
      name: 'pieceWeightOz',
      required: false,
      type: 'decimal',
      format: 'Number with up to 4 decimal places (weight in oz per piece)',
      example: '1.0000',
      validation: 'Only needed if unit is "pc" or "each" for weight conversions'
    },
    {
      name: 'supplier',
      required: false,
      type: 'string',
      format: 'Text, max 255 characters',
      example: 'Sysco Foods',
      validation: ''
    },
    {
      name: 'shelfLife',
      required: false,
      type: 'integer',
      format: 'Whole number (days)',
      example: '30',
      validation: 'Positive integer representing days'
    },
    {
      name: 'minStock',
      required: false,
      type: 'decimal',
      format: 'Number with up to 2 decimal places',
      example: '10.00',
      validation: 'Minimum stock level in the unit specified'
    }
  ];

  return generateTemplate(columns);
}

/**
 * Recipes template metadata
 */
export function generateRecipesTemplate(): string {
  const columns: ColumnMetadata[] = [
    {
      name: 'id',
      required: false,
      type: 'integer',
      format: 'Positive integer (leave empty for new recipes)',
      example: '',
      validation: 'If provided, updates existing recipe; if empty, creates new recipe'
    },
    {
      name: 'name',
      required: true,
      type: 'string',
      format: 'Text, max 255 characters',
      example: 'California Roll',
      validation: 'Must be unique within your restaurant'
    },
    {
      name: 'description',
      required: false,
      type: 'string',
      format: 'Text, any length',
      example: 'Classic sushi roll with crab, avocado, and cucumber',
      validation: ''
    },
    {
      name: 'category',
      required: false,
      type: 'string',
      format: 'Text, max 100 characters',
      example: 'Sushi Rolls',
      validation: 'Use existing categories or create new ones'
    },
    {
      name: 'servings',
      required: false,
      type: 'integer',
      format: 'Whole number',
      example: '8',
      validation: 'Number of servings this recipe makes'
    },
    {
      name: 'prepTime',
      required: false,
      type: 'integer',
      format: 'Whole number (minutes)',
      example: '15',
      validation: 'Preparation time in minutes'
    },
    {
      name: 'cookTime',
      required: false,
      type: 'integer',
      format: 'Whole number (minutes)',
      example: '0',
      validation: 'Cooking time in minutes'
    },
    {
      name: 'costPerServing',
      required: false,
      type: 'decimal',
      format: 'Number with up to 2 decimal places',
      example: '1.25',
      validation: 'Cost per single serving (calculated automatically if ingredients are defined)'
    },
    {
      name: 'sellingPrice',
      required: false,
      type: 'decimal',
      format: 'Number with up to 2 decimal places',
      example: '12.99',
      validation: 'Menu price for this recipe'
    }
  ];

  return generateTemplate(columns);
}

/**
 * Recipe Ingredients template metadata
 */
export function generateRecipeIngredientsTemplate(): string {
  const columns: ColumnMetadata[] = [
    {
      name: 'id',
      required: false,
      type: 'integer',
      format: 'Positive integer (leave empty for new recipe ingredients)',
      example: '',
      validation: 'If provided, updates existing recipe ingredient; if empty, creates new'
    },
    {
      name: 'recipeId',
      required: true,
      type: 'integer',
      format: 'Whole number (must match existing recipe ID)',
      example: '60001',
      validation: 'Export recipes first to get recipe IDs'
    },
    {
      name: 'recipeName',
      required: false,
      type: 'string',
      format: 'Text (for reference only, not used in import)',
      example: 'California Roll',
      validation: 'Helps identify the recipe, but recipeId is used for matching'
    },
    {
      name: 'ingredientId',
      required: true,
      type: 'integer',
      format: 'Whole number (must match existing ingredient ID)',
      example: '50001',
      validation: 'Export ingredients first to get ingredient IDs'
    },
    {
      name: 'ingredientName',
      required: false,
      type: 'string',
      format: 'Text (for reference only, not used in import)',
      example: 'Sushi Rice',
      validation: 'Helps identify the ingredient, but ingredientId is used for matching'
    },
    {
      name: 'quantity',
      required: true,
      type: 'decimal',
      format: 'Number with up to 4 decimal places',
      example: '2.0000',
      validation: 'Amount of ingredient used in recipe'
    },
    {
      name: 'unit',
      required: true,
      type: 'string',
      format: 'Unit name (lb, oz, kg, g, cup, tbsp, tsp, each, pc, etc.)',
      example: 'cup',
      validation: 'Unit as used in the recipe (can differ from ingredient storage unit)'
    }
  ];

  return generateTemplate(columns);
}

/**
 * Generate template with instructions
 */
export function generateTemplateWithInstructions(
  templateType: 'ingredients' | 'recipes' | 'recipeIngredients'
): string {
  let template = '';
  let instructions = '';

  switch (templateType) {
    case 'ingredients':
      template = generateIngredientsTemplate();
      instructions = `# INGREDIENTS IMPORT TEMPLATE

## INSTRUCTIONS:
1. Rows 1-5 contain column metadata - DO NOT DELETE these rows
2. Row 6 is a separator - leave it empty
3. Starting from row 7, add your ingredient data
4. Delete the example row (row 7) before importing
5. Save as CSV format when done

## IMPORTANT NOTES:
- Name and unit are REQUIRED for all ingredients
- Unit must match existing unit names exactly (case-sensitive)
- CostPerUnit should be the cost for ONE unit (e.g., cost per 1 lb, not per case)
- PieceWeightOz is only needed for "pc" or "each" units to enable weight conversions
- Leave optional fields empty if not applicable

## COMMON UNITS:
Weight: lb, oz, kg, g
Volume: gal, qt, pt, cup, fl oz, tbsp, tsp, ml, L
Count: each, pc (piece)

`;
      break;

    case 'recipes':
      template = generateRecipesTemplate();
      instructions = `# RECIPES IMPORT TEMPLATE

## INSTRUCTIONS:
1. Rows 1-5 contain column metadata - DO NOT DELETE these rows
2. Row 6 is a separator - leave it empty
3. Starting from row 7, add your recipe data
4. Delete the example row (row 7) before importing
5. Save as CSV format when done

## IMPORTANT NOTES:
- Name is REQUIRED for all recipes
- SellingPrice is recommended for profitability analysis
- CostPerServing is calculated automatically if recipe has ingredients
- Times are in minutes
- Leave optional fields empty if not applicable

## AFTER IMPORTING RECIPES:
- Use "Export Recipe Ingredients" to get a template for adding ingredients to recipes
- Or add ingredients manually through the recipe detail page

`;
      break;

    case 'recipeIngredients':
      template = generateRecipeIngredientsTemplate();
      instructions = `# RECIPE INGREDIENTS IMPORT TEMPLATE

## INSTRUCTIONS:
1. Rows 1-5 contain column metadata - DO NOT DELETE these rows
2. Row 6 is a separator - leave it empty
3. Starting from row 7, add your recipe ingredient data
4. Delete the example row (row 7) before importing
5. Save as CSV format when done

## IMPORTANT NOTES:
- RecipeId, IngredientId, Quantity, and Unit are REQUIRED
- Export your recipes first to get recipe IDs
- Export your ingredients first to get ingredient IDs
- RecipeName and IngredientName are for reference only (not used in import)
- Unit is how the ingredient is measured IN THE RECIPE (can differ from storage unit)
- System will automatically convert units when calculating costs

## WORKFLOW:
1. Export recipes → note the recipe IDs
2. Export ingredients → note the ingredient IDs
3. Fill in this template with recipe-ingredient relationships
4. Import to link ingredients to recipes

`;
      break;
  }

  return instructions + '\n' + template;
}
