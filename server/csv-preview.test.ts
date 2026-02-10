import { describe, it, expect } from "vitest";
import { previewIngredientCSV, previewRecipeCSV, previewRecipeIngredientsCSV } from "./csv-preview-helpers";

describe("CSV Preview Functionality", () => {
  describe("Ingredient CSV Preview", () => {
    it("should preview valid ingredient CSV", () => {
      const csv = `id,name,category,unit,costPerUnit,supplier
1,Tomato,Produce,lb,2.50,Fresh Farms
2,Chicken Breast,Protein,lb,5.99,Quality Meats`;
      
      const result = previewIngredientCSV(csv);
      
      expect(result.valid).toBe(true);
      expect(result.totalRows).toBe(2);
      expect(result.validRows).toBe(2);
      expect(result.errorRows).toBe(0);
      expect(result.warningRows).toBe(0);
      expect(result.globalErrors).toHaveLength(0);
    });
    
    it("should detect missing required columns", () => {
      const csv = `id,name
1,Tomato
2,Chicken`;
      
      const result = previewIngredientCSV(csv);
      
      expect(result.valid).toBe(false);
      expect(result.globalErrors).toHaveLength(1);
      expect(result.globalErrors[0]).toContain("Missing required columns");
      expect(result.globalErrors[0]).toContain("unit");
    });
    
    it("should detect row-level errors", () => {
      const csv = `id,name,unit,costPerUnit
invalid,Tomato,lb,2.50
2,,lb,5.99
3,Chicken,,3.00`;
      
      const result = previewIngredientCSV(csv);
      
      expect(result.valid).toBe(false);
      expect(result.errorRows).toBe(3);
      expect(result.rows[0].errors).toContain("Invalid or missing ID");
      expect(result.rows[1].errors).toContain("Missing ingredient name");
      expect(result.rows[2].errors).toContain("Missing unit");
    });
    
    it("should detect warnings for optional fields", () => {
      const csv = `id,name,unit
1,Tomato,lb
2,Chicken,lb`;
      
      const result = previewIngredientCSV(csv);
      
      expect(result.valid).toBe(true);
      expect(result.warningRows).toBe(2);
      expect(result.rows[0].warnings).toContain("No cost data - will not calculate recipe costs");
      expect(result.rows[0].warnings).toContain("No supplier information");
    });
    
    it("should validate numeric fields", () => {
      const csv = `id,name,unit,costPerUnit,pieceWeightOz,shelfLife,minStock
1,Tomato,lb,invalid,not_number,not_int,not_number`;
      
      const result = previewIngredientCSV(csv);
      
      expect(result.valid).toBe(false);
      expect(result.rows[0].errors).toContain("Cost per unit must be a number");
      expect(result.rows[0].errors).toContain("Piece weight must be a number");
      expect(result.rows[0].errors).toContain("Shelf life must be an integer");
      expect(result.rows[0].errors).toContain("Min stock must be a number");
    });
    
    it("should warn about negative costs", () => {
      const csv = `id,name,unit,costPerUnit
1,Tomato,lb,-2.50`;
      
      const result = previewIngredientCSV(csv);
      
      expect(result.valid).toBe(true);
      expect(result.warningRows).toBe(1);
      expect(result.rows[0].warnings).toContain("Cost per unit is negative");
    });
  });
  
  describe("Recipe CSV Preview", () => {
    it("should preview valid recipe CSV", () => {
      const csv = `id,name,category,servings,sellingPrice
1,Tomato Soup,Soup,4,12.99
2,Grilled Chicken,Entree,2,18.50`;
      
      const result = previewRecipeCSV(csv);
      
      expect(result.valid).toBe(true);
      expect(result.totalRows).toBe(2);
      expect(result.validRows).toBe(2);
      expect(result.errorRows).toBe(0);
    });
    
    it("should detect missing required columns", () => {
      const csv = `id,category
1,Soup
2,Entree`;
      
      const result = previewRecipeCSV(csv);
      
      expect(result.valid).toBe(false);
      expect(result.globalErrors[0]).toContain("Missing required columns");
      expect(result.globalErrors[0]).toContain("name");
    });
    
    it("should detect row-level errors", () => {
      const csv = `id,name,servings,prepTime,cookTime,sellingPrice
invalid,Soup,not_int,not_int,not_int,not_number
2,,4,30,20,12.99`;
      
      const result = previewRecipeCSV(csv);
      
      expect(result.valid).toBe(false);
      expect(result.errorRows).toBe(2);
      expect(result.rows[0].errors).toContain("Invalid or missing ID");
      expect(result.rows[0].errors).toContain("Servings must be an integer");
      expect(result.rows[0].errors).toContain("Prep time must be an integer");
      expect(result.rows[0].errors).toContain("Cook time must be an integer");
      expect(result.rows[0].errors).toContain("Selling price must be a number");
      expect(result.rows[1].errors).toContain("Missing recipe name");
    });
    
    it("should warn about missing optional fields", () => {
      const csv = `id,name
1,Tomato Soup
2,Grilled Chicken`;
      
      const result = previewRecipeCSV(csv);
      
      expect(result.valid).toBe(true);
      expect(result.warningRows).toBe(2);
      expect(result.rows[0].warnings).toContain("No selling price - cannot calculate margin");
      expect(result.rows[0].warnings).toContain("No category assigned");
    });
    
    it("should warn about negative prices", () => {
      const csv = `id,name,sellingPrice
1,Soup,-12.99`;
      
      const result = previewRecipeCSV(csv);
      
      expect(result.valid).toBe(true);
      expect(result.warningRows).toBe(1);
      expect(result.rows[0].warnings).toContain("Selling price is negative");
    });
  });
  
  describe("Recipe Ingredients CSV Preview", () => {
    it("should preview valid recipe ingredients CSV", () => {
      const csv = `recipeId,recipeName,ingredientId,ingredientName,quantity,unit
1,Tomato Soup,10,Tomato,2,lb
1,Tomato Soup,11,Onion,0.5,lb`;
      
      const result = previewRecipeIngredientsCSV(csv);
      
      expect(result.valid).toBe(true);
      expect(result.totalRows).toBe(2);
      expect(result.validRows).toBe(2);
      expect(result.errorRows).toBe(0);
    });
    
    it("should detect missing required columns", () => {
      const csv = `recipeId,ingredientId
1,10
1,11`;
      
      const result = previewRecipeIngredientsCSV(csv);
      
      expect(result.valid).toBe(false);
      expect(result.globalErrors[0]).toContain("Missing required columns");
      expect(result.globalErrors[0]).toContain("quantity");
      expect(result.globalErrors[0]).toContain("unit");
    });
    
    it("should detect row-level errors", () => {
      const csv = `recipeId,ingredientId,quantity,unit
invalid,10,2,lb
1,invalid,2,lb
1,11,invalid,lb
1,12,0,lb
1,13,2,`;
      
      const result = previewRecipeIngredientsCSV(csv);
      
      expect(result.valid).toBe(false);
      expect(result.errorRows).toBe(5);
      expect(result.rows[0].errors).toContain("Invalid or missing recipe ID");
      expect(result.rows[1].errors).toContain("Invalid or missing ingredient ID");
      expect(result.rows[2].errors).toContain("Invalid or missing quantity");
      expect(result.rows[3].errors).toContain("Quantity must be greater than zero");
      expect(result.rows[4].errors).toContain("Missing unit");
    });
    
    it("should warn about missing reference fields", () => {
      const csv = `recipeId,ingredientId,quantity,unit
1,10,2,lb
1,11,0.5,lb`;
      
      const result = previewRecipeIngredientsCSV(csv);
      
      expect(result.valid).toBe(true);
      expect(result.warningRows).toBe(2);
      expect(result.rows[0].warnings).toContain("No recipe name (reference only, not required)");
      expect(result.rows[0].warnings).toContain("No ingredient name (reference only, not required)");
    });
  });
  
  describe("Column Mapping", () => {
    it("should provide column mapping for ingredients", () => {
      const csv = `id,name,unit
1,Tomato,lb`;
      
      const result = previewIngredientCSV(csv);
      
      expect(result.columnMapping).toBeDefined();
      expect(result.columnMapping.length).toBeGreaterThan(0);
      
      const idMapping = result.columnMapping.find(m => m.csvColumn === 'id');
      expect(idMapping).toBeDefined();
      expect(idMapping?.required).toBe(true);
      
      const supplierMapping = result.columnMapping.find(m => m.csvColumn === 'supplier');
      expect(supplierMapping).toBeDefined();
      expect(supplierMapping?.required).toBe(false);
    });
    
    it("should provide column mapping for recipes", () => {
      const csv = `id,name
1,Soup`;
      
      const result = previewRecipeCSV(csv);
      
      expect(result.columnMapping).toBeDefined();
      const nameMapping = result.columnMapping.find(m => m.csvColumn === 'name');
      expect(nameMapping?.required).toBe(true);
      
      const categoryMapping = result.columnMapping.find(m => m.csvColumn === 'category');
      expect(categoryMapping?.required).toBe(false);
    });
  });
  
  describe("Summary Statistics", () => {
    it("should calculate correct summary statistics", () => {
      const csv = `id,name,unit,costPerUnit
1,Tomato,lb,2.50
2,Onion,lb,
3,Chicken,lb,5.99
invalid,Carrot,lb,1.50`;
      
      const result = previewIngredientCSV(csv);
      
      expect(result.totalRows).toBe(4);
      expect(result.validRows).toBe(0); // None are fully valid (all have warnings or errors)
      expect(result.warningRows).toBe(3); // Tomato, Onion, and Chicken all have warnings
      expect(result.errorRows).toBe(1); // Carrot has invalid ID
    });
  });
});
