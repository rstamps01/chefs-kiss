import { mysqlTable, int, varchar, text, timestamp, mysqlEnum, json } from "drizzle-orm/mysql-core";

/**
 * Import History Table
 * 
 * Tracks all CSV imports with metadata for audit trail and rollback capability.
 * Stores snapshots of data before import to enable rollback functionality.
 */
export const importHistory = mysqlTable("import_history", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull(), // references restaurants.id
  userId: int("userId").notNull(), // references users.id (who performed the import)
  
  // Import metadata
  importType: mysqlEnum("importType", ["ingredients", "recipes", "recipeIngredients"]).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  
  // Import statistics
  recordsCreated: int("recordsCreated").default(0).notNull(),
  recordsUpdated: int("recordsUpdated").default(0).notNull(),
  totalRecords: int("totalRecords").default(0).notNull(),
  
  // Rollback data (JSON snapshot of affected records before import)
  // For creates: stores the IDs that were created (to delete on rollback)
  // For updates: stores the previous values (to restore on rollback)
  snapshotData: json("snapshotData").$type<{
    created?: number[]; // IDs of created records
    updated?: Array<{ // Previous values of updated records
      id: number;
      data: Record<string, any>;
    }>;
  }>(),
  
  // Status tracking
  status: mysqlEnum("status", ["completed", "rolled_back"]).default("completed").notNull(),
  rolledBackAt: timestamp("rolledBackAt"),
  rolledBackBy: int("rolledBackBy"), // references users.id
  
  // Optional metadata
  fileName: varchar("fileName", { length: 255 }),
  notes: text("notes"),
});

export type ImportHistory = typeof importHistory.$inferSelect;
export type InsertImportHistory = typeof importHistory.$inferInsert;
