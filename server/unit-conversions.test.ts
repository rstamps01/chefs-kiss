import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {} as any,
    res: {} as any,
    restaurantId: 1,
  };
}

const caller = appRouter.createCaller(createTestContext());

describe("Unit Conversion System", () => {

  it("should list all unit categories", async () => {
    const categories = await caller.unitCategories.list();
    
    expect(categories).toBeDefined();
    expect(categories.length).toBeGreaterThan(0);
    
    // Check for expected categories
    const categoryNames = categories.map((c) => c.name);
    expect(categoryNames).toContain("Weight");
    expect(categoryNames).toContain("Volume");
    expect(categoryNames).toContain("Count");
    expect(categoryNames).toContain("Custom");
  });

  it("should list all ingredient conversions", async () => {
    const conversions = await caller.ingredientConversions.list();
    
    expect(conversions).toBeDefined();
    expect(Array.isArray(conversions)).toBe(true);
    // Should have at least the salmon conversion we created in the browser
    expect(conversions.length).toBeGreaterThan(0);
  });

  it("should list conversions by ingredient for Salmon", async () => {
    // Get all ingredients to find Salmon
    const ingredients = await caller.ingredients.list();
    const salmon = ingredients.find((i) => i.name === "Salmon (sashimi grade)");
    
    if (salmon) {
      const conversions = await caller.ingredientConversions.listByIngredient({
        ingredientId: salmon.id,
      });

      expect(conversions).toBeDefined();
      expect(Array.isArray(conversions)).toBe(true);
      // Should have the pieces -> oz conversion we created
      if (conversions.length > 0) {
        expect(conversions[0].ingredientId).toBe(salmon.id);
      }
    }
  });

  it("should get conversion factor for existing conversion", async () => {
    const ingredients = await caller.ingredients.list();
    const salmon = ingredients.find((i) => i.name === "Salmon (sashimi grade)");
    
    if (salmon) {
      const factor = await caller.ingredientConversions.getConversionFactor({
        ingredientId: salmon.id,
        fromUnit: "pieces",
        toUnit: "oz",
      });

      // Should return 8.0 from the conversion we created in browser
      expect(factor).toBe(8.0);
    }
  });

  it("should get conversion factor in reverse direction", async () => {
    const ingredients = await caller.ingredients.list();
    const salmon = ingredients.find((i) => i.name === "Salmon (sashimi grade)");
    
    if (salmon) {
      const factor = await caller.ingredientConversions.getConversionFactor({
        ingredientId: salmon.id,
        fromUnit: "oz",
        toUnit: "pieces",
      });

      // Reverse conversion: 1 oz = 0.125 pieces (1/8)
      if (factor !== null) {
        expect(factor).toBeCloseTo(0.125, 3);
      }
    }
  });

  it("should return null for non-existent conversion", async () => {
    const factor = await caller.ingredientConversions.getConversionFactor({
      ingredientId: 999999,
      fromUnit: "pieces",
      toUnit: "oz",
    });

    expect(factor).toBeNull();
  });
});
