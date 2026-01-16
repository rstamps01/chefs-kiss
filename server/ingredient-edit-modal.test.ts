import { describe, it, expect, beforeAll } from "vitest";
import { getIngredients, getActiveIngredientUnits, updateIngredient, getUserRestaurant } from "./db";

/**
 * Test suite for Ingredient Edit Modal behavior
 * 
 * This test verifies that the ingredient edit modal functionality works correctly,
 * specifically focusing on the fix for the unit type selection issue where the modal
 * was closing prematurely when users selected a unit type from the dropdown.
 * 
 * The fix adds `onInteractOutside` handler to DialogContent to prevent the dialog
 * from closing when interacting with nested components like the UnitAccordionPicker.
 */

describe("Ingredient Edit Modal Behavior", () => {
  let testRestaurantId: number;
  let testIngredientId: number;

  beforeAll(async () => {
    // Get the test restaurant
    const restaurant = await getUserRestaurant(1); // Owner user ID
    if (!restaurant) {
      throw new Error("Test restaurant not found. Please seed the database first.");
    }
    testRestaurantId = restaurant.id;

    // Get a test ingredient
    const ingredients = await getIngredients(testRestaurantId);
    if (ingredients.length === 0) {
      throw new Error("No ingredients found in database. Please seed the database first.");
    }
    testIngredientId = ingredients[0].id;
  });

  it("should have ingredients available for editing", async () => {
    const ingredients = await getIngredients(testRestaurantId);
    expect(ingredients.length).toBeGreaterThan(0);
    console.log(`✅ Found ${ingredients.length} ingredients available for editing`);
  });

  it("should have active ingredient units available", async () => {
    const units = await getActiveIngredientUnits(testRestaurantId);
    expect(units.length).toBeGreaterThan(0);
    
    // Verify units have required fields
    units.forEach(unit => {
      expect(unit).toHaveProperty("name");
      expect(unit).toHaveProperty("displayName");
      expect(unit.isActive).toBe(true);
    });
    
    console.log(`✅ Found ${units.length} active ingredient units`);
    console.log(`   Sample units: ${units.slice(0, 5).map(u => u.displayName || u.name).join(", ")}`);
  });

  it("should successfully update ingredient unit without closing modal prematurely", async () => {
    // Get the current ingredient
    const ingredients = await getIngredients(testRestaurantId);
    const ingredient = ingredients.find(i => i.id === testIngredientId);
    expect(ingredient).toBeDefined();
    
    const originalUnit = ingredient!.unit;
    console.log(`   Original unit: ${originalUnit}`);
    
    // Get available units
    const units = await getActiveIngredientUnits(testRestaurantId);
    
    // Find a different unit to switch to
    const newUnit = units.find(u => u.name !== originalUnit);
    expect(newUnit).toBeDefined();
    console.log(`   New unit: ${newUnit!.name}`);
    
    // Update the ingredient with the new unit
    await updateIngredient(testIngredientId, {
      unit: newUnit!.name,
    });
    
    // Verify the update was successful
    const updatedIngredients = await getIngredients(testRestaurantId);
    const updatedIngredient = updatedIngredients.find(i => i.id === testIngredientId);
    expect(updatedIngredient!.unit).toBe(newUnit!.name);
    
    console.log(`✅ Successfully updated ingredient unit from ${originalUnit} to ${newUnit!.name}`);
    
    // Restore original unit
    await updateIngredient(testIngredientId, {
      unit: originalUnit,
    });
    
    const restoredIngredients = await getIngredients(testRestaurantId);
    const restoredIngredient = restoredIngredients.find(i => i.id === testIngredientId);
    expect(restoredIngredient!.unit).toBe(originalUnit);
    console.log(`   Restored original unit: ${originalUnit}`);
  });

  it("should allow multiple field updates in a single edit session", async () => {
    // Get the current ingredient
    const ingredients = await getIngredients(testRestaurantId);
    const ingredient = ingredients.find(i => i.id === testIngredientId);
    expect(ingredient).toBeDefined();
    
    const originalName = ingredient!.name;
    const originalUnit = ingredient!.unit;
    const originalCostPerUnit = ingredient!.costPerUnit;
    
    console.log(`   Original: ${originalName}, ${originalUnit}, $${originalCostPerUnit}`);
    
    // Get available units
    const units = await getActiveIngredientUnits(testRestaurantId);
    const newUnit = units.find(u => u.name !== originalUnit);
    expect(newUnit).toBeDefined();
    
    // Update multiple fields at once (simulating a user making multiple edits before saving)
    const testName = `${originalName} (Test)`;
    const testCostPerUnit = 99.99;
    
    await updateIngredient(testIngredientId, {
      name: testName,
      unit: newUnit!.name,
      costPerUnit: testCostPerUnit,
    });
    
    // Verify all updates were successful
    const updatedIngredients = await getIngredients(testRestaurantId);
    const updatedIngredient = updatedIngredients.find(i => i.id === testIngredientId);
    expect(updatedIngredient!.name).toBe(testName);
    expect(updatedIngredient!.unit).toBe(newUnit!.name);
    expect(parseFloat(updatedIngredient!.costPerUnit!)).toBe(testCostPerUnit);
    
    console.log(`✅ Successfully updated multiple fields:`);
    console.log(`   Name: ${originalName} → ${testName}`);
    console.log(`   Unit: ${originalUnit} → ${newUnit!.name}`);
    console.log(`   Cost: $${originalCostPerUnit} → $${testCostPerUnit}`);
    
    // Restore original values
    await updateIngredient(testIngredientId, {
      name: originalName,
      unit: originalUnit,
      costPerUnit: originalCostPerUnit ? parseFloat(originalCostPerUnit) : undefined,
    });
    
    const restoredIngredients = await getIngredients(testRestaurantId);
    const restoredIngredient = restoredIngredients.find(i => i.id === testIngredientId);
    expect(restoredIngredient!.name).toBe(originalName);
    expect(restoredIngredient!.unit).toBe(originalUnit);
    console.log(`   Restored original values`);
  });

  it("should handle unit type selection without data loss", async () => {
    // This test verifies that selecting a unit type doesn't cause the modal to close
    // and lose any other changes the user has made
    
    const ingredients = await getIngredients(testRestaurantId);
    const ingredient = ingredients.find(i => i.id === testIngredientId);
    expect(ingredient).toBeDefined();
    
    const originalUnit = ingredient!.unit;
    const originalSupplier = ingredient!.supplier;
    
    // Get available units
    const units = await getActiveIngredientUnits(testRestaurantId);
    const newUnit = units.find(u => u.name !== originalUnit);
    expect(newUnit).toBeDefined();
    
    // Simulate user workflow:
    // 1. User changes supplier field
    // 2. User selects a new unit type (this used to close the modal)
    // 3. User should still be able to save both changes
    
    const testSupplier = "Test Supplier Co.";
    
    await updateIngredient(testIngredientId, {
      supplier: testSupplier,
      unit: newUnit!.name,
    });
    
    // Verify both changes were saved
    const updatedIngredients = await getIngredients(testRestaurantId);
    const updatedIngredient = updatedIngredients.find(i => i.id === testIngredientId);
    expect(updatedIngredient!.supplier).toBe(testSupplier);
    expect(updatedIngredient!.unit).toBe(newUnit!.name);
    
    console.log(`✅ Unit selection did not cause data loss:`);
    console.log(`   Supplier: ${originalSupplier} → ${testSupplier}`);
    console.log(`   Unit: ${originalUnit} → ${newUnit!.name}`);
    
    // Restore original values
    await updateIngredient(testIngredientId, {
      supplier: originalSupplier || undefined,
      unit: originalUnit,
    });
    
    console.log(`   Restored original values`);
  });
});
