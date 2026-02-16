import { describe, it, expect } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

type AuthenticatedUser = NonNullable<TrpcContext['user']>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: 'sample-user',
    email: 'sample@example.com',
    name: 'Sample User',
    loginMethod: 'google',
    role: 'developer',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    req: {} as any,
    res: {
      clearCookie: () => {},
    } as any,
    user,
  };

  return ctx;
}

describe('Ingredient Category Validation', () => {
  const caller = appRouter.createCaller(createAuthContext());

  it('should reject creating ingredient with recipe category', async () => {
    await expect(
      caller.ingredients.create({
        name: 'Test Ingredient with Recipe Category',
        category: 'Sushi Rolls', // This is a recipe category
        unit: 'lb',
        costPerUnit: 5.00,
      })
    ).rejects.toThrow(/not a valid ingredient category/);
  });

  it('should accept creating ingredient with ingredient category', async () => {
    const result = await caller.ingredients.create({
      name: 'Test Ingredient with Ingredient Category ' + Date.now(),
      category: 'Fish & Seafood', // This is an ingredient category
      unit: 'lb',
      costPerUnit: 5.00,
    });

    expect(result.success).toBe(true);
    expect(result.ingredientId).toBeGreaterThan(0);
  });

  it('should accept creating ingredient without category', async () => {
    const result = await caller.ingredients.create({
      name: 'Test Ingredient without Category ' + Date.now(),
      unit: 'lb',
      costPerUnit: 5.00,
    });

    expect(result.success).toBe(true);
    expect(result.ingredientId).toBeGreaterThan(0);
  });

  it('should reject updating ingredient with recipe category', async () => {
    // First create an ingredient
    const createResult = await caller.ingredients.create({
      name: 'Test Ingredient for Update ' + Date.now(),
      category: 'Produce',
      unit: 'lb',
      costPerUnit: 3.00,
    });

    // Try to update with recipe category
    await expect(
      caller.ingredients.update({
        ingredientId: createResult.ingredientId,
        category: 'Appetizers', // This is a recipe category
      })
    ).rejects.toThrow(/not a valid ingredient category/);
  });

  it('should accept updating ingredient with ingredient category', async () => {
    // First create an ingredient
    const createResult = await caller.ingredients.create({
      name: 'Test Ingredient for Valid Update ' + Date.now(),
      category: 'Produce',
      unit: 'lb',
      costPerUnit: 3.00,
    });

    // Update with valid ingredient category
    const updateResult = await caller.ingredients.update({
      ingredientId: createResult.ingredientId,
      category: 'Fish & Seafood', // This is an ingredient category
    });

    expect(updateResult.success).toBe(true);
  });
});
