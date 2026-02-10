/**
 * Import History Functions
 * 
 * Functions for tracking CSV imports and enabling rollback functionality.
 */

import { getDb } from './db';
import { importHistory, ingredients, recipes, recipeIngredients } from '../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';

export type ImportType = 'ingredients' | 'recipes' | 'recipeIngredients';

/**
 * Save import history after a successful import
 */
export async function saveImportHistory(params: {
  restaurantId: number;
  userId: string;
  importType: ImportType;
  recordsCreated: number;
  recordsUpdated: number;
  createdIds?: number[];
  updatedData?: Array<{ id: number; data: Record<string, any> }>;
  fileName?: string;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const snapshotData = {
    created: params.createdIds || [],
    updated: params.updatedData || [],
  };

  const [result] = await db.insert(importHistory).values({
    restaurantId: params.restaurantId,
    userId: String(params.userId),
    importType: params.importType,
    recordsCreated: params.recordsCreated,
    recordsUpdated: params.recordsUpdated,
    totalRecords: params.recordsCreated + params.recordsUpdated,
    snapshotData,
    fileName: params.fileName,
    notes: params.notes,
    status: 'completed',
  });

  return Number(result.insertId);
}

/**
 * Get import history for a restaurant with pagination
 */
export async function getImportHistory(params: {
  restaurantId: number;
  limit?: number;
  offset?: number;
  importType?: ImportType;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { restaurantId, limit = 50, offset = 0, importType } = params;

  let query = db
    .select()
    .from(importHistory)
    .where(eq(importHistory.restaurantId, restaurantId))
    .orderBy(desc(importHistory.timestamp))
    .limit(limit)
    .offset(offset);

  if (importType) {
    query = db
      .select()
      .from(importHistory)
      .where(
        and(
          eq(importHistory.restaurantId, restaurantId),
          eq(importHistory.importType, importType)
        )
      )
      .orderBy(desc(importHistory.timestamp))
      .limit(limit)
      .offset(offset);
  }

  return await query;
}

/**
 * Get a specific import history record by ID
 */
export async function getImportHistoryById(id: number, restaurantId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [record] = await db
    .select()
    .from(importHistory)
    .where(
      and(
        eq(importHistory.id, id),
        eq(importHistory.restaurantId, restaurantId)
      )
    )
    .limit(1);

  return record;
}

/**
 * Rollback an import by restoring the previous state
 * - Deletes created records
 * - Restores updated records to their previous values
 */
export async function rollbackImport(params: {
  importHistoryId: number;
  restaurantId: number;
  userId: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get the import history record
  const record = await getImportHistoryById(params.importHistoryId, params.restaurantId);
  
  if (!record) {
    throw new Error("Import history record not found");
  }

  if (record.status === 'rolled_back') {
    throw new Error("This import has already been rolled back");
  }

  const snapshot = record.snapshotData as {
    created?: number[];
    updated?: Array<{ id: number; data: Record<string, any> }>;
  };

  // Determine which table to operate on
  let table;
  switch (record.importType) {
    case 'ingredients':
      table = ingredients;
      break;
    case 'recipes':
      table = recipes;
      break;
    case 'recipeIngredients':
      table = recipeIngredients;
      break;
    default:
      throw new Error(`Unknown import type: ${record.importType}`);
  }

  // Rollback creates (delete the created records)
  if (snapshot.created && snapshot.created.length > 0) {
    for (const id of snapshot.created) {
      await db.delete(table).where(eq(table.id, id));
    }
  }

  // Rollback updates (restore previous values)
  if (snapshot.updated && snapshot.updated.length > 0) {
    for (const item of snapshot.updated) {
      await db
        .update(table)
        .set(item.data)
        .where(eq(table.id, item.id));
    }
  }

  // Mark the import as rolled back
  await db
    .update(importHistory)
    .set({
      status: 'rolled_back',
      rolledBackAt: new Date(),
      rolledBackBy: params.userId,
    })
    .where(eq(importHistory.id, params.importHistoryId));

  return {
    success: true,
    deletedCount: snapshot.created?.length || 0,
    restoredCount: snapshot.updated?.length || 0,
  };
}

/**
 * Get snapshot data before updating records (for rollback capability)
 */
export async function getSnapshotBeforeUpdate(
  importType: ImportType,
  restaurantId: number,
  ids: number[]
): Promise<Array<{ id: number; data: Record<string, any> }>> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (ids.length === 0) return [];

  let table;
  switch (importType) {
    case 'ingredients':
      table = ingredients;
      break;
    case 'recipes':
      table = recipes;
      break;
    case 'recipeIngredients':
      table = recipeIngredients;
      break;
    default:
      throw new Error(`Unknown import type: ${importType}`);
  }

  // Build the query based on table type
  let records: any[];
  
  if (importType === 'recipeIngredients') {
    // recipeIngredients doesn't have restaurantId, so we just select by IDs
    records = await db
      .select()
      .from(table);
  } else {
    // ingredients and recipes have restaurantId
    records = await db
      .select()
      .from(table)
      .where(eq((table as any).restaurantId, restaurantId));
  }

  // Filter to only the IDs we're updating
  const filtered = records.filter((r: any) => ids.includes(r.id));

  return filtered.map((r: any) => ({
    id: r.id,
    data: { ...r },
  }));
}
