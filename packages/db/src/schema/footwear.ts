import { pgTable, serial, varchar, integer, timestamp, text, decimal } from 'drizzle-orm/pg-core';

// Shoe Styles & Specifications
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  styleCode: varchar('style_code', { length: 100 }).notNull().unique(), // e.g. OXF-BRG-01
  name: varchar('name', { length: 255 }).notNull(),
  construction: varchar('construction', { length: 100 }).notNull(), // Goodyear Welted, Blake Stitched, Cemented
  upperMaterial: varchar('upper_material', { length: 150 }).notNull(), // Full-grain calf, Crust leather, Suede
  soleType: varchar('sole_type', { length: 100 }).notNull(), // Leather sole, Vibram lug, Rubber commando
  standardCost: decimal('standard_cost', { precision: 10, scale: 2 }).default('0.00'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Production Work Orders
export const workOrders = pgTable('work_orders', {
  id: serial('id').primaryKey(),
  orderNumber: varchar('order_number', { length: 100 }).notNull().unique(), // e.g. WO-2026-104
  productId: integer('product_id').references(() => products.id),
  pairsRequested: integer('pairs_requested').notNull(),
  stage: varchar('stage', { length: 50 }).notNull().default('Cutting'), // Cutting, Stitching, Lasting, Assembly, Finishing, QC
  status: varchar('status', { length: 50 }).notNull().default('Pending'), // Pending, In Progress, Completed, On Hold
  targetCompletionDate: timestamp('target_completion_date', { withTimezone: true }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Raw Materials & Components Inventory
export const inventoryItems = pgTable('inventory_items', {
  id: serial('id').primaryKey(),
  sku: varchar('sku', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(), // Leather, Sole, Insole, Lining, Hardware, Adhesives
  quantityOnHand: decimal('quantity_on_hand', { precision: 12, scale: 2 }).notNull().default('0.00'),
  unitOfMeasure: varchar('unit_of_measure', { length: 30 }).notNull(), // sq_ft, meters, pairs, liters
  reorderPoint: decimal('reorder_point', { precision: 12, scale: 2 }).default('50.00'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type WorkOrder = typeof workOrders.$inferSelect;
export type NewWorkOrder = typeof workOrders.$inferInsert;

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type NewInventoryItem = typeof inventoryItems.$inferInsert;
