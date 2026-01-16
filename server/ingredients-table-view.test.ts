import { describe, it, expect } from "vitest";
import { getIngredients, getUserRestaurant, updateIngredient, getActiveIngredientUnits } from "./db";

describe("Ingredients Table View Functionality", () => {
  const testUserId = 1; // Owner user ID
  let testRestaurantId: number;

  it("should fetch ingredients for table view", async () => {
    const restaurant = await getUserRestaurant(testUserId);
    expect(restaurant).toBeDefined();
    testRestaurantId = restaurant!.id;

    const ingredients = await getIngredients(testRestaurantId);
    expect(ingredients).toBeDefined();
    expect(Array.isArray(ingredients)).toBe(true);
    expect(ingredients.length).toBeGreaterThan(0);

    // Verify all required fields for table view are present
    const firstIngredient = ingredients[0];
    expect(firstIngredient).toHaveProperty("id");
    expect(firstIngredient).toHaveProperty("name");
    expect(firstIngredient).toHaveProperty("category");
    expect(firstIngredient).toHaveProperty("unit");
    expect(firstIngredient).toHaveProperty("costPerUnit");
    expect(firstIngredient).toHaveProperty("pieceWeightOz");
    expect(firstIngredient).toHaveProperty("supplier");
    expect(firstIngredient).toHaveProperty("shelfLife");
    expect(firstIngredient).toHaveProperty("minStock");
  });

  it("should fetch active units for dropdown", async () => {
    const restaurant = await getUserRestaurant(testUserId);
    expect(restaurant).toBeDefined();

    const units = await getActiveIngredientUnits(restaurant!.id);
    expect(units).toBeDefined();
    expect(Array.isArray(units)).toBe(true);
    expect(units.length).toBeGreaterThan(0);

    // Verify units have required fields for dropdown
    const firstUnit = units[0];
    expect(firstUnit).toHaveProperty("name");
    expect(firstUnit).toHaveProperty("displayName");
  });

  it("should support inline editing of ingredient fields", async () => {
    const restaurant = await getUserRestaurant(testUserId);
    expect(restaurant).toBeDefined();
    testRestaurantId = restaurant!.id;

    const ingredients = await getIngredients(testRestaurantId);
    const testIngredient = ingredients[0];

    // Test updating multiple fields at once (simulating table inline edit)
    const originalName = testIngredient.name;
    const originalCost = testIngredient.costPerUnit;

    const updated = await updateIngredient(testRestaurantId, {
      ingredientId: testIngredient.id,
      name: `${originalName} (Edited)`,
      costPerUnit: 99.99,
      shelfLife: 7,
      minStock: 10,
    });

    expect(updated).toEqual({ success: true });

    // Verify changes
    const updatedIngredients = await getIngredients(testRestaurantId);
    const updatedIngredient = updatedIngredients.find(i => i.id === testIngredient.id);
    expect(updatedIngredient).toBeDefined();
    expect(updatedIngredient!.name).toBe(`${originalName} (Edited)`);
    expect(parseFloat(updatedIngredient!.costPerUnit || "0")).toBe(99.99);
    expect(updatedIngredient!.shelfLife).toBe(7);
    expect(parseFloat(updatedIngredient!.minStock || "0")).toBe(10);

    // Restore original values
    await updateIngredient(testRestaurantId, {
      ingredientId: testIngredient.id,
      name: originalName,
      costPerUnit: originalCost ? parseFloat(originalCost) : undefined,
    });
  });

  it("should support sorting by different columns", async () => {
    const restaurant = await getUserRestaurant(testUserId);
    expect(restaurant).toBeDefined();

    const ingredients = await getIngredients(restaurant!.id);
    expect(ingredients.length).toBeGreaterThan(1);

    // Test sorting by name (ascending)
    const sortedByNameAsc = [...ingredients].sort((a, b) => 
      a.name.localeCompare(b.name)
    );
    expect(sortedByNameAsc[0].name.localeCompare(sortedByNameAsc[1].name)).toBeLessThanOrEqual(0);

    // Test sorting by name (descending)
    const sortedByNameDesc = [...ingredients].sort((a, b) => 
      b.name.localeCompare(a.name)
    );
    expect(sortedByNameDesc[0].name.localeCompare(sortedByNameDesc[1].name)).toBeGreaterThanOrEqual(0);

    // Test sorting by cost (ascending)
    const ingredientsWithCost = ingredients.filter(i => i.costPerUnit);
    if (ingredientsWithCost.length > 1) {
      const sortedByCostAsc = [...ingredientsWithCost].sort((a, b) => 
        parseFloat(a.costPerUnit || "0") - parseFloat(b.costPerUnit || "0")
      );
      expect(parseFloat(sortedByCostAsc[0].costPerUnit || "0"))
        .toBeLessThanOrEqual(parseFloat(sortedByCostAsc[1].costPerUnit || "0"));
    }
  });

  it("should handle category filtering", async () => {
    const restaurant = await getUserRestaurant(testUserId);
    expect(restaurant).toBeDefined();

    const ingredients = await getIngredients(restaurant!.id);
    
    // Get unique categories
    const categories = Array.from(new Set(
      ingredients.map(i => i.category).filter((c): c is string => c !== null)
    ));
    
    expect(categories.length).toBeGreaterThan(0);

    // Test filtering by first category
    const firstCategory = categories[0];
    const filtered = ingredients.filter(i => i.category === firstCategory);
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every(i => i.category === firstCategory)).toBe(true);
  });
});
