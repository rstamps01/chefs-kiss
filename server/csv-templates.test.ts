import { describe, it, expect } from 'vitest';
import { generateTemplateWithInstructions } from './csv-templates';

describe('CSV Templates', () => {
  describe('Ingredients Template', () => {
    it('should generate ingredients template with metadata rows', () => {
      const template = generateTemplateWithInstructions('ingredients');
      
      expect(template).toContain('# INGREDIENTS IMPORT TEMPLATE');
      expect(template).toContain('## INSTRUCTIONS:');
      expect(template).toContain('name,category,unit,costPerUnit');
      expect(template).toContain('REQUIRED,OPTIONAL,REQUIRED,OPTIONAL');
      expect(template).toContain('STRING,STRING,STRING,DECIMAL');
    });

    it('should include all required columns', () => {
      const template = generateTemplateWithInstructions('ingredients');
      
      // Check for all column names
      expect(template).toContain('name');
      expect(template).toContain('category');
      expect(template).toContain('unit');
      expect(template).toContain('costPerUnit');
      expect(template).toContain('pieceWeightOz');
      expect(template).toContain('supplier');
      expect(template).toContain('shelfLife');
      expect(template).toContain('minStock');
    });

    it('should mark name and unit as REQUIRED', () => {
      const template = generateTemplateWithInstructions('ingredients');
      const lines = template.split('\n');
      
      // Find the REQUIRED/OPTIONAL row
      const reqRow = lines.find(line => line.includes('REQUIRED') && line.includes('OPTIONAL'));
      expect(reqRow).toBeDefined();
      
      // name (first) and unit (third) should be REQUIRED
      const cols = reqRow!.split(',');
      expect(cols[0]).toBe('REQUIRED'); // name
      expect(cols[2]).toBe('REQUIRED'); // unit
    });

    it('should include example data row', () => {
      const template = generateTemplateWithInstructions('ingredients');
      
      expect(template).toContain('Sushi Rice');
      expect(template).toContain('Grains');
      expect(template).toContain('lb');
    });

    it('should include validation rules', () => {
      const template = generateTemplateWithInstructions('ingredients');
      
      expect(template).toContain('Must be unique');
      expect(template).toContain('Must match existing unit names');
    });

    it('should include usage instructions', () => {
      const template = generateTemplateWithInstructions('ingredients');
      
      expect(template).toContain('DO NOT DELETE these rows');
      expect(template).toContain('Save as CSV format');
      expect(template).toContain('COMMON UNITS:');
    });
  });

  describe('Recipes Template', () => {
    it('should generate recipes template with metadata rows', () => {
      const template = generateTemplateWithInstructions('recipes');
      
      expect(template).toContain('# RECIPES IMPORT TEMPLATE');
      expect(template).toContain('## INSTRUCTIONS:');
      expect(template).toContain('name,description,category');
      expect(template).toContain('REQUIRED,OPTIONAL');
      expect(template).toContain('STRING');
    });

    it('should include all recipe columns', () => {
      const template = generateTemplateWithInstructions('recipes');
      
      expect(template).toContain('name');
      expect(template).toContain('description');
      expect(template).toContain('category');
      expect(template).toContain('servings');
      expect(template).toContain('prepTime');
      expect(template).toContain('cookTime');
      expect(template).toContain('costPerServing');
      expect(template).toContain('sellingPrice');
    });

    it('should mark only name as REQUIRED', () => {
      const template = generateTemplateWithInstructions('recipes');
      const lines = template.split('\n');
      
      const reqRow = lines.find(line => line.includes('REQUIRED') && line.includes('OPTIONAL'));
      expect(reqRow).toBeDefined();
      
      const cols = reqRow!.split(',');
      expect(cols[0]).toBe('REQUIRED'); // name
      expect(cols[1]).toBe('OPTIONAL'); // description
    });

    it('should include example recipe data', () => {
      const template = generateTemplateWithInstructions('recipes');
      
      expect(template).toContain('California Roll');
      expect(template).toContain('Sushi Rolls');
    });

    it('should include workflow guidance', () => {
      const template = generateTemplateWithInstructions('recipes');
      
      expect(template).toContain('AFTER IMPORTING RECIPES:');
      expect(template).toContain('Export Recipe Ingredients');
    });
  });

  describe('Recipe Ingredients Template', () => {
    it('should generate recipe ingredients template with metadata rows', () => {
      const template = generateTemplateWithInstructions('recipeIngredients');
      
      expect(template).toContain('# RECIPE INGREDIENTS IMPORT TEMPLATE');
      expect(template).toContain('## INSTRUCTIONS:');
      expect(template).toContain('recipeId,recipeName,ingredientId');
      expect(template).toContain('REQUIRED,OPTIONAL,REQUIRED');
      expect(template).toContain('INTEGER,STRING,INTEGER');
    });

    it('should include all recipe ingredient columns', () => {
      const template = generateTemplateWithInstructions('recipeIngredients');
      
      expect(template).toContain('recipeId');
      expect(template).toContain('recipeName');
      expect(template).toContain('ingredientId');
      expect(template).toContain('ingredientName');
      expect(template).toContain('quantity');
      expect(template).toContain('unit');
    });

    it('should mark recipeId, ingredientId, quantity, and unit as REQUIRED', () => {
      const template = generateTemplateWithInstructions('recipeIngredients');
      const lines = template.split('\n');
      
      const reqRow = lines.find(line => line.includes('REQUIRED') && line.includes('OPTIONAL'));
      expect(reqRow).toBeDefined();
      
      const cols = reqRow!.split(',');
      expect(cols[0]).toBe('REQUIRED'); // recipeId
      expect(cols[1]).toBe('OPTIONAL'); // recipeName (for reference only)
      expect(cols[2]).toBe('REQUIRED'); // ingredientId
      expect(cols[3]).toBe('OPTIONAL'); // ingredientName (for reference only)
      expect(cols[4]).toBe('REQUIRED'); // quantity
      expect(cols[5]).toBe('REQUIRED'); // unit
    });

    it('should include example data with IDs', () => {
      const template = generateTemplateWithInstructions('recipeIngredients');
      
      expect(template).toContain('60001'); // example recipe ID
      expect(template).toContain('50001'); // example ingredient ID
      expect(template).toContain('California Roll');
      expect(template).toContain('Sushi Rice');
    });

    it('should include workflow instructions', () => {
      const template = generateTemplateWithInstructions('recipeIngredients');
      
      expect(template).toContain('## WORKFLOW:');
      expect(template).toContain('Export recipes');
      expect(template).toContain('Export ingredients');
      expect(template).toContain('note the recipe IDs');
      expect(template).toContain('note the ingredient IDs');
    });

    it('should explain reference-only fields', () => {
      const template = generateTemplateWithInstructions('recipeIngredients');
      
      expect(template).toContain('for reference only');
      expect(template).toContain('not used in import');
    });
  });

  describe('Template Structure', () => {
    it('should have consistent structure across all templates', () => {
      const ingredientsTemplate = generateTemplateWithInstructions('ingredients');
      const recipesTemplate = generateTemplateWithInstructions('recipes');
      const recipeIngredientsTemplate = generateTemplateWithInstructions('recipeIngredients');
      
      // All should have instructions header
      expect(ingredientsTemplate).toMatch(/^# .+ IMPORT TEMPLATE/);
      expect(recipesTemplate).toMatch(/^# .+ IMPORT TEMPLATE/);
      expect(recipeIngredientsTemplate).toMatch(/^# .+ IMPORT TEMPLATE/);
      
      // All should have ## INSTRUCTIONS: section
      expect(ingredientsTemplate).toContain('## INSTRUCTIONS:');
      expect(recipesTemplate).toContain('## INSTRUCTIONS:');
      expect(recipeIngredientsTemplate).toContain('## INSTRUCTIONS:');
      
      // All should have ## IMPORTANT NOTES: section
      expect(ingredientsTemplate).toContain('## IMPORTANT NOTES:');
      expect(recipesTemplate).toContain('## IMPORTANT NOTES:');
      expect(recipeIngredientsTemplate).toContain('## IMPORTANT NOTES:');
    });

    it('should have 5 metadata rows before data', () => {
      const template = generateTemplateWithInstructions('ingredients');
      const lines = template.split('\n');
      
      // Find where CSV data starts (after instructions)
      const csvStartIndex = lines.findIndex(line => line.startsWith('name,category'));
      expect(csvStartIndex).toBeGreaterThan(0);
      
      // After the column names row, should have 4 more metadata rows + 1 empty + example
      const dataLines = lines.slice(csvStartIndex);
      expect(dataLines[0]).toContain('name'); // Column names
      expect(dataLines[1]).toContain('REQUIRED'); // Required/Optional
      expect(dataLines[2]).toMatch(/STRING|INTEGER|DECIMAL/); // Data types
      expect(dataLines[3]).toContain('"'); // Formats (quoted)
      expect(dataLines[4]).toBeTruthy(); // Validation rules
      expect(dataLines[5]).toBe(''); // Empty separator
      expect(dataLines[6]).toContain('Sushi Rice'); // Example data
    });
  });
});
