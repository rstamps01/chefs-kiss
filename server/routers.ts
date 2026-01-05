import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getUserRestaurant, getRecipesWithIngredients, getIngredients, getRestaurantLocations, createRecipe, addRecipeIngredients, updateRecipe, updateRecipeIngredients, deleteRecipe, createIngredient, updateIngredient, deleteIngredient, getRecipesUsingIngredient, importSalesData, checkExistingSalesData, getSalesAnalytics, getDailySalesData, getSalesByDayOfWeek, getSalesDateRange, getRecipeCategories, getActiveRecipeCategories, getIngredientCategories, createRecipeCategory, updateRecipeCategory, deleteRecipeCategory, getIngredientUnits, getActiveIngredientUnits, createIngredientUnit, updateIngredientUnit, deleteIngredientUnit, getUnitCategories, getIngredientConversions, getIngredientConversionsByIngredient, createIngredientConversion, updateIngredientConversion, deleteIngredientConversion, getConversionFactor } from "./db";
import { generateForecast } from "./forecasting";
import { generatePrepPlan } from "./prep-planning";
import { generateMultiDayPrepPlan } from "./multi-day-prep-planning";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Recipe and ingredient management
  recipes: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const restaurant = await getUserRestaurant(ctx.user.id);
      if (!restaurant) {
        return [];
      }
      return await getRecipesWithIngredients(restaurant.id);
    }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        category: z.string().min(1),
        servings: z.number().int().positive(),
        prepTime: z.number().int().optional(),
        cookTime: z.number().int().optional(),
        sellingPrice: z.number().positive(),
        description: z.string().optional(),
        ingredients: z.array(z.object({
          ingredientId: z.number().int().positive(),
          quantity: z.number().positive(),
          unit: z.string().min(1),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        const restaurant = await getUserRestaurant(ctx.user.id);
        if (!restaurant) {
          throw new Error("Restaurant not found");
        }
        
        // Create the recipe
        const recipeId = await createRecipe({
          restaurantId: restaurant.id,
          name: input.name,
          category: input.category,
          servings: input.servings,
          prepTime: input.prepTime,
          cookTime: input.cookTime,
          sellingPrice: input.sellingPrice,
          description: input.description,
        });
        
        // Add ingredients if provided
        if (input.ingredients.length > 0) {
          await addRecipeIngredients({
            recipeId,
            ingredients: input.ingredients,
          });
        }
        
        return { success: true, recipeId };
      }),
    update: protectedProcedure
      .input(z.object({
        recipeId: z.number().int().positive(),
        name: z.string().min(1).optional(),
        category: z.string().min(1).optional(),
        servings: z.number().int().positive().optional(),
        prepTime: z.number().int().optional(),
        cookTime: z.number().int().optional(),
        sellingPrice: z.number().positive().optional(),
        description: z.string().optional(),
        ingredients: z.array(z.object({
          ingredientId: z.number().int().positive(),
          quantity: z.number().positive(),
          unit: z.string().min(1),
        })).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { recipeId, ingredients, ...recipeUpdates } = input;
        
        // Update recipe details
        if (Object.keys(recipeUpdates).length > 0) {
          await updateRecipe(recipeId, {
            ...recipeUpdates,
            sellingPrice: recipeUpdates.sellingPrice?.toString(),
          });
        }
        
        // Update ingredients if provided
        if (ingredients) {
          await updateRecipeIngredients(recipeId, ingredients);
        }
        
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({
        recipeId: z.number().int().positive(),
      }))
      .mutation(async ({ ctx, input }) => {
        await deleteRecipe(input.recipeId);
        return { success: true };
      }),
    calculateIngredientCost: protectedProcedure
      .input(z.object({
        ingredientId: z.number().int().positive(),
        quantity: z.number().positive(),
        unit: z.string().min(1),
      }))
      .query(async ({ ctx, input }) => {
        const restaurant = await getUserRestaurant(ctx.user.id);
        if (!restaurant) {
          throw new Error("Restaurant not found");
        }
        
        // Get ingredient details
        const ingredients = await getIngredients(restaurant.id);
        const ingredient = ingredients.find(ing => ing.id === input.ingredientId);
        
        if (!ingredient) {
          throw new Error("Ingredient not found");
        }
        
        // Calculate cost with unit conversion
        const { convertUnit } = await import("./unitConversion");
        
        if (!ingredient.costPerUnit) {
          return { cost: null, error: "Ingredient has no cost defined" };
        }
        
        if (!ingredient.unit) {
          return { cost: null, error: "Ingredient has no unit defined" };
        }
        
        const costPerUnit = parseFloat(ingredient.costPerUnit);
        const pieceWeightOz = ingredient.pieceWeightOz ? parseFloat(ingredient.pieceWeightOz) : undefined;
        
        // Convert recipe unit to ingredient storage unit
        const convertedQuantity = convertUnit(
          input.quantity,
          input.unit,
          ingredient.unit,
          pieceWeightOz,
          ingredient.name as string | undefined
        );
        
        if (convertedQuantity === null) {
          // If conversion fails, return null cost
          return { cost: null, error: "Unit conversion failed" };
        }
        
        const cost = convertedQuantity * costPerUnit;
        return { cost: cost.toFixed(2), error: null };
      }),
  }),
  
  ingredients: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const restaurant = await getUserRestaurant(ctx.user.id);
      if (!restaurant) {
        return [];
      }
      return await getIngredients(restaurant.id);
    }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        category: z.string().optional(),
        unit: z.string().min(1),
        costPerUnit: z.number().positive().optional(),
        supplier: z.string().optional(),
        shelfLife: z.number().int().positive().optional(),
        minStock: z.number().positive().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const restaurant = await getUserRestaurant(ctx.user.id);
        if (!restaurant) {
          throw new Error("Restaurant not found");
        }
        
        const ingredientId = await createIngredient({
          restaurantId: restaurant.id,
          ...input,
        });
        
        return { success: true, ingredientId };
      }),
    update: protectedProcedure
      .input(z.object({
        ingredientId: z.number().int().positive(),
        name: z.string().min(1).optional(),
        category: z.string().optional(),
        unit: z.string().min(1).optional(),
        costPerUnit: z.number().positive().optional(),
        supplier: z.string().optional(),
        shelfLife: z.number().int().positive().optional(),
        minStock: z.number().positive().optional(),
        pieceWeightOz: z.number().positive().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { ingredientId, ...updates } = input;
        await updateIngredient(ingredientId, updates);
        return { success: true };
      }),
    getRecipeUsage: protectedProcedure
      .input(z.object({
        ingredientId: z.number().int().positive(),
      }))
      .query(async ({ input }) => {
        return await getRecipesUsingIngredient(input.ingredientId);
      }),
    delete: protectedProcedure
      .input(z.object({
        ingredientId: z.number().int().positive(),
      }))
      .mutation(async ({ ctx, input }) => {
        await deleteIngredient(input.ingredientId);
        return { success: true };
      }),
  }),
  
  restaurant: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await getUserRestaurant(ctx.user.id);
    }),
    locations: protectedProcedure.query(async ({ ctx }) => {
      const restaurant = await getUserRestaurant(ctx.user.id);
      if (!restaurant) {
        return [];
      }
      return await getRestaurantLocations(restaurant.id);
    }),
  }),

  // CSV Import for POS data
  csvImport: router({
    parseAndValidate: protectedProcedure
      .input(z.object({
        csvContent: z.string(),
        mapping: z.object({
          date: z.string(),
          totalSales: z.string(),
          totalOrders: z.string().optional(),
          customerCount: z.string().optional(),
          lunchSales: z.string().optional(),
          dinnerSales: z.string().optional(),
          notes: z.string().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        const { parseCSV, validateCSVData, normalizeCSVRow } = await import("./csv-parser");
        
        // Parse CSV
        const parsed = parseCSV(input.csvContent);
        
        // Validate data
        const validation = validateCSVData(parsed.rows, input.mapping);
        
        // Normalize rows for preview
        const normalizedRows = parsed.rows.slice(0, 10).map(row => 
          normalizeCSVRow(row, input.mapping)
        );
        
        return {
          headers: parsed.headers,
          rowCount: parsed.rowCount,
          validation,
          preview: normalizedRows,
        };
      }),
    
    checkExisting: protectedProcedure
      .input(z.object({
        locationId: z.number(),
        dates: z.array(z.string()),
      }))
      .query(async ({ input }) => {
        const existingDates = await checkExistingSalesData(input.locationId, input.dates);
        return {
          existingDates,
          conflictCount: existingDates.length,
        };
      }),
    
    import: protectedProcedure
      .input(z.object({
        locationId: z.number(),
        csvContent: z.string(),
        mapping: z.object({
          date: z.string(),
          totalSales: z.string(),
          totalOrders: z.string().optional(),
          customerCount: z.string().optional(),
          lunchSales: z.string().optional(),
          dinnerSales: z.string().optional(),
          notes: z.string().optional(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        const { parseCSV, validateCSVData, normalizeCSVRow } = await import("./csv-parser");
        
        // Verify user owns this location
        const restaurant = await getUserRestaurant(ctx.user.id);
        if (!restaurant) {
          throw new Error("Restaurant not found");
        }
        
        const locations = await getRestaurantLocations(restaurant.id);
        const location = locations.find(loc => loc.id === input.locationId);
        if (!location) {
          throw new Error("Location not found or access denied");
        }
        
        // Parse and validate CSV
        const parsed = parseCSV(input.csvContent);
        const validation = validateCSVData(parsed.rows, input.mapping);
        
        if (!validation.valid) {
          throw new Error(`CSV validation failed: ${validation.errors.length} errors found`);
        }
        
        // Normalize all rows
        const normalizedData = parsed.rows.map(row => ({
          locationId: input.locationId,
          ...normalizeCSVRow(row, input.mapping),
        }));
        
        // Import to database
        const result = await importSalesData(normalizedData);
        
        return {
          success: true,
          imported: result.inserted,
          warnings: validation.warnings,
        };
      }),
  }),

  // Analytics endpoints
  analytics: router({
    summary: protectedProcedure
      .input(z.object({
        locationId: z.number(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        // Verify user owns this location
        const restaurant = await getUserRestaurant(ctx.user.id);
        if (!restaurant) {
          throw new Error("Restaurant not found");
        }
        
        const locations = await getRestaurantLocations(restaurant.id);
        const location = locations.find(loc => loc.id === input.locationId);
        if (!location) {
          throw new Error("Location not found or access denied");
        }
        
        return await getSalesAnalytics(input.locationId, input.startDate, input.endDate);
      }),
    
    dailySales: protectedProcedure
      .input(z.object({
        locationId: z.number(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        // Verify user owns this location
        const restaurant = await getUserRestaurant(ctx.user.id);
        if (!restaurant) {
          throw new Error("Restaurant not found");
        }
        
        const locations = await getRestaurantLocations(restaurant.id);
        const location = locations.find(loc => loc.id === input.locationId);
        if (!location) {
          throw new Error("Location not found or access denied");
        }
        
        return await getDailySalesData(input.locationId, input.startDate, input.endDate);
      }),
    
    salesByDayOfWeek: protectedProcedure
      .input(z.object({
        locationId: z.number(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        // Verify user owns this location
        const restaurant = await getUserRestaurant(ctx.user.id);
        if (!restaurant) {
          throw new Error("Restaurant not found");
        }
        
        const locations = await getRestaurantLocations(restaurant.id);
        const location = locations.find(loc => loc.id === input.locationId);
        if (!location) {
          throw new Error("Location not found or access denied");
        }
        
        return await getSalesByDayOfWeek(input.locationId, input.startDate, input.endDate);
      }),
    
    dateRange: protectedProcedure
      .input(z.object({
        locationId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        // Verify user owns this location
        const restaurant = await getUserRestaurant(ctx.user.id);
        if (!restaurant) {
          throw new Error("Restaurant not found");
        }
        
        const locations = await getRestaurantLocations(restaurant.id);
        const location = locations.find(loc => loc.id === input.locationId);
        if (!location) {
          throw new Error("Location not found or access denied");
        }
        
        return await getSalesDateRange(input.locationId);
      }),
  }),

  // Forecasting endpoints
  forecasting: router({
    generate: protectedProcedure
      .input(z.object({
        locationId: z.number(),
        daysAhead: z.number().int().min(1).max(30).default(14),
      }))
      .query(async ({ ctx, input }) => {
        // Verify user owns this location
        const restaurant = await getUserRestaurant(ctx.user.id);
        if (!restaurant) {
          throw new Error("Restaurant not found");
        }
        
        const locations = await getRestaurantLocations(restaurant.id);
        const location = locations.find(loc => loc.id === input.locationId);
        if (!location) {
          throw new Error("Location not found or access denied");
        }
        
        return await generateForecast(input.locationId, input.daysAhead);
      }),
  }),

  // Recipe Categories endpoints
  recipeCategories: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const restaurant = await getUserRestaurant(ctx.user.id);
      if (!restaurant) {
        return [];
      }
      return await getRecipeCategories(restaurant.id);
    }),
    listActive: protectedProcedure.query(async ({ ctx }) => {
      const restaurant = await getUserRestaurant(ctx.user.id);
      if (!restaurant) {
        return [];
      }
      return await getActiveRecipeCategories(restaurant.id);
    }),
    listIngredientCategories: protectedProcedure.query(async ({ ctx }) => {
      const restaurant = await getUserRestaurant(ctx.user.id);
      if (!restaurant) {
        return [];
      }
      return await getIngredientCategories(restaurant.id);
    }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        isActive: z.boolean().optional(),
        displayOrder: z.number().int().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const restaurant = await getUserRestaurant(ctx.user.id);
        if (!restaurant) {
          throw new Error("Restaurant not found");
        }
        
        return await createRecipeCategory({
          restaurantId: restaurant.id,
          ...input,
        });
      }),
    update: protectedProcedure
      .input(z.object({
        categoryId: z.number(),
        name: z.string().min(1).optional(),
        isActive: z.boolean().optional(),
        displayOrder: z.number().int().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { categoryId, ...data } = input;
        return await updateRecipeCategory(categoryId, data);
      }),
    delete: protectedProcedure
      .input(z.object({
        categoryId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await deleteRecipeCategory(input.categoryId);
      }),
  }),

  // Ingredient Units endpoints
  ingredientUnits: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const restaurant = await getUserRestaurant(ctx.user.id);
      if (!restaurant) {
        return [];
      }
      return await getIngredientUnits(restaurant.id);
    }),
    listActive: protectedProcedure.query(async ({ ctx }) => {
      const restaurant = await getUserRestaurant(ctx.user.id);
      if (!restaurant) {
        return [];
      }
      return await getActiveIngredientUnits(restaurant.id);
    }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        displayName: z.string().min(1),
        isActive: z.boolean().optional(),
        displayOrder: z.number().int().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const restaurant = await getUserRestaurant(ctx.user.id);
        if (!restaurant) {
          throw new Error("Restaurant not found");
        }
        
        return await createIngredientUnit({
          restaurantId: restaurant.id,
          ...input,
        });
      }),
    update: protectedProcedure
      .input(z.object({
        unitId: z.number(),
        name: z.string().min(1).optional(),
        displayName: z.string().min(1).optional(),
        isActive: z.boolean().optional(),
        displayOrder: z.number().int().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { unitId, ...data } = input;
        return await updateIngredientUnit(unitId, data);
      }),
    delete: protectedProcedure
      .input(z.object({
        unitId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await deleteIngredientUnit(input.unitId);
      }),
  }),

  // Prep Planning endpoints
  prepPlanning: router({
    generate: protectedProcedure
      .input(z.object({
        locationId: z.number(),
        targetDate: z.string(),
        safetyBufferPercent: z.number().min(0).max(50).default(10),
      }))
      .query(async ({ ctx, input }) => {
        // Verify user owns this location
        const restaurant = await getUserRestaurant(ctx.user.id);
        if (!restaurant) {
          throw new Error("Restaurant not found");
        }
        
        const locations = await getRestaurantLocations(restaurant.id);
        const location = locations.find(loc => loc.id === input.locationId);
        if (!location) {
          throw new Error("Location not found or access denied");
        }
        
        return await generatePrepPlan(input.locationId, input.targetDate, input.safetyBufferPercent);
      }),
    
    multiDay: protectedProcedure
      .input(z.object({
        locationId: z.number(),
        startDate: z.string(),
        days: z.number().int().min(1).max(30),
        safetyBufferPercent: z.number().min(0).max(50).default(10),
      }))
      .query(async ({ ctx, input }) => {
        // Verify user owns this location
        const restaurant = await getUserRestaurant(ctx.user.id);
        if (!restaurant) {
          throw new Error("Restaurant not found");
        }
        
        const locations = await getRestaurantLocations(restaurant.id);
        const location = locations.find(loc => loc.id === input.locationId);
        if (!location) {
          throw new Error("Location not found or access denied");
        }
        
        return await generateMultiDayPrepPlan(input.locationId, input.startDate, input.days, input.safetyBufferPercent);
      }),
  }),

  // Unit Categories endpoints
  unitCategories: router({
    list: protectedProcedure.query(async () => {
      return await getUnitCategories();
    }),
  }),

  // Ingredient Conversions endpoints
  ingredientConversions: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const restaurant = await getUserRestaurant(ctx.user.id);
      if (!restaurant) {
        return [];
      }
      return await getIngredientConversions(restaurant.id);
    }),
    listByIngredient: protectedProcedure
      .input(z.object({ ingredientId: z.number().int().positive() }))
      .query(async ({ input }) => {
        return await getIngredientConversionsByIngredient(input.ingredientId);
      }),
    create: protectedProcedure
      .input(z.object({
        ingredientId: z.number().int().positive(),
        fromUnit: z.string().min(1),
        toUnit: z.string().min(1),
        conversionFactor: z.string().min(1),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const restaurant = await getUserRestaurant(ctx.user.id);
        if (!restaurant) {
          throw new Error("Restaurant not found");
        }
        return await createIngredientConversion({
          restaurantId: restaurant.id,
          ...input,
        });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number().int().positive(),
        fromUnit: z.string().min(1).optional(),
        toUnit: z.string().min(1).optional(),
        conversionFactor: z.string().min(1).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await updateIngredientConversion(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        return await deleteIngredientConversion(input.id);
      }),
    getConversionFactor: protectedProcedure
      .input(z.object({
        ingredientId: z.number().int().positive(),
        fromUnit: z.string().min(1),
        toUnit: z.string().min(1),
      }))
      .query(async ({ input }) => {
        return await getConversionFactor(input.ingredientId, input.fromUnit, input.toUnit);
      }),
  }),

  // Unit Conversion Testing endpoints
  conversionTesting: router({
    testConversion: protectedProcedure
      .input(z.object({
        value: z.number(),
        fromUnit: z.string().min(1),
        toUnit: z.string().min(1),
        ingredientId: z.number().int().positive().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { convertUnit, areUnitsCompatible, getUnitType } = await import('./unitConversion');
        const { getIngredients } = await import('./db');
        
        const restaurant = await getUserRestaurant(ctx.user.id);
        if (!restaurant) {
          throw new Error("Restaurant not found");
        }

        // Get ingredient details if provided
        let ingredient = null;
        let pieceWeightOz: number | null = null;
        let ingredientName: string | undefined = undefined;
        
        if (input.ingredientId) {
          const ingredients = await getIngredients(restaurant.id);
          ingredient = ingredients.find(i => i.id === input.ingredientId);
          if (ingredient) {
            // Convert pieceWeightOz from string to number if present
            pieceWeightOz = ingredient.pieceWeightOz ? parseFloat(ingredient.pieceWeightOz as any) : null;
            ingredientName = ingredient.name;
          }
        }

        // Attempt conversion
        const result = convertUnit(
          input.value,
          input.fromUnit,
          input.toUnit,
          pieceWeightOz,
          ingredientName
        );

        // Get unit types
        const fromUnitType = getUnitType(input.fromUnit);
        const toUnitType = getUnitType(input.toUnit);
        const compatible = areUnitsCompatible(input.fromUnit, input.toUnit);

        return {
          success: result !== null,
          result,
          fromUnit: input.fromUnit,
          toUnit: input.toUnit,
          fromUnitType,
          toUnitType,
          compatible,
          ingredientName,
          pieceWeightOz,
        };
      }),
    
    getSupportedUnits: protectedProcedure.query(async ({ ctx }) => {
      const restaurant = await getUserRestaurant(ctx.user.id);
      if (!restaurant) {
        return [];
      }
      return await getActiveIngredientUnits(restaurant.id);
    }),
    
    getIngredientsForTesting: protectedProcedure.query(async ({ ctx }) => {
      const restaurant = await getUserRestaurant(ctx.user.id);
      if (!restaurant) {
        return [];
      }
      const ingredients = await getIngredients(restaurant.id);
      return ingredients.map(i => ({
        id: i.id,
        name: i.name,
        unit: i.unit,
        pieceWeightOz: i.pieceWeightOz,
      }));
    }),
  }),
});

export type AppRouter = typeof appRouter;
