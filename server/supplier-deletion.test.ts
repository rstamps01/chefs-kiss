import { describe, it, expect, beforeAll } from "vitest";
import { getIngredients, updateIngredient, createIngredient, deleteIngredient, getUserRestaurant } from "./db";

describe("Supplier Deletion", () => {
  let testRestaurantId: number;

  beforeAll(async () => {
    // Get the test restaurant
    const restaurant = await getUserRestaurant(1); // Owner user ID
    if (!restaurant) {
      throw new Error("Test restaurant not found. Please seed the database first.");
    }
    testRestaurantId = restaurant.id;
  });

  it("should allow setting supplier to null when updating ingredient", async () => {
    // Get an ingredient with a supplier
    const ingredients = await getIngredients(testRestaurantId);
    const ingredientWithSupplier = ingredients.find(i => i.supplier);

    if (!ingredientWithSupplier) {
      console.log("No ingredient with supplier found, skipping test");
      return;
    }

    console.log(`\nTesting with ingredient: ${ingredientWithSupplier.name}`);
    console.log(`Current supplier: ${ingredientWithSupplier.supplier}`);

    // Update the ingredient to remove the supplier (set to null)
    await updateIngredient(ingredientWithSupplier.id, {
      supplier: null,
    });

    // Fetch the updated ingredient
    const updatedIngredients = await getIngredients(testRestaurantId);
    const updatedIngredient = updatedIngredients.find(i => i.id === ingredientWithSupplier.id);

    console.log(`Updated supplier: ${updatedIngredient?.supplier}`);

    // Verify supplier is now null
    expect(updatedIngredient?.supplier).toBeNull();
  });

  it("should allow setting supplier back to a value", async () => {
    // Get an ingredient without a supplier
    const ingredients = await getIngredients(testRestaurantId);
    const ingredientWithoutSupplier = ingredients.find(i => !i.supplier);

    if (!ingredientWithoutSupplier) {
      console.log("No ingredient without supplier found, skipping test");
      return;
    }

    console.log(`\nTesting with ingredient: ${ingredientWithoutSupplier.name}`);
    console.log(`Current supplier: ${ingredientWithoutSupplier.supplier}`);

    // Update the ingredient to add a supplier
    const testSupplier = "Test Supplier Co.";
    await updateIngredient(ingredientWithoutSupplier.id, {
      supplier: testSupplier,
    });

    // Fetch the updated ingredient
    const updatedIngredients = await getIngredients(testRestaurantId);
    const updatedIngredient = updatedIngredients.find(i => i.id === ingredientWithoutSupplier.id);

    console.log(`Updated supplier: ${updatedIngredient?.supplier}`);

    // Verify supplier is now set
    expect(updatedIngredient?.supplier).toBe(testSupplier);
  });

  it("should accept null supplier when creating new ingredient", async () => {
    // Create ingredient with null supplier
    const ingredientId = await createIngredient({
      restaurantId: testRestaurantId,
      name: "Test Ingredient (No Supplier)",
      unit: "oz",
      costPerUnit: 1.50,
      supplier: null,
    });

    expect(ingredientId).toBeDefined();

    // Verify the created ingredient has null supplier
    const ingredients = await getIngredients(testRestaurantId);
    const createdIngredient = ingredients.find(i => i.id === ingredientId);

    console.log(`\nCreated ingredient: ${createdIngredient?.name}`);
    console.log(`Supplier: ${createdIngredient?.supplier}`);

    expect(createdIngredient?.supplier).toBeNull();

    // Clean up - delete the test ingredient
    await deleteIngredient(ingredientId);
  });
});
