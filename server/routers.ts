import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getUserRestaurant, getRecipesWithIngredients, getIngredients, getRestaurantLocations, createRecipe, addRecipeIngredients } from "./db";
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
  }),
  
  ingredients: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const restaurant = await getUserRestaurant(ctx.user.id);
      if (!restaurant) {
        return [];
      }
      return await getIngredients(restaurant.id);
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
});

export type AppRouter = typeof appRouter;
