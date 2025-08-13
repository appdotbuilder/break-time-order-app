import { serial, text, pgTable, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define enum for break time items
export const breakTimeItemEnum = pgEnum('break_time_item', ['Tea', 'Coffee', 'Milk', 'Boost', 'Horlicks']);

// Orders table - represents completed orders
export const ordersTable = pgTable('orders', {
  id: serial('id').primaryKey(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  total_items: integer('total_items').notNull().default(0), // Total count of all items in order
});

// Order items table - represents individual items within an order
export const orderItemsTable = pgTable('order_items', {
  id: serial('id').primaryKey(),
  order_id: integer('order_id').notNull().references(() => ordersTable.id, { onDelete: 'cascade' }),
  item_name: breakTimeItemEnum('item_name').notNull(),
  quantity: integer('quantity').notNull(), // Must be positive, validated in schema
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Define relations between orders and order items
export const ordersRelations = relations(ordersTable, ({ many }) => ({
  items: many(orderItemsTable),
}));

export const orderItemsRelations = relations(orderItemsTable, ({ one }) => ({
  order: one(ordersTable, {
    fields: [orderItemsTable.order_id],
    references: [ordersTable.id],
  }),
}));

// TypeScript types for the table schemas
export type Order = typeof ordersTable.$inferSelect; // For SELECT operations
export type NewOrder = typeof ordersTable.$inferInsert; // For INSERT operations

export type OrderItem = typeof orderItemsTable.$inferSelect; // For SELECT operations  
export type NewOrderItem = typeof orderItemsTable.$inferInsert; // For INSERT operations

// Export all tables and relations for proper query building
export const tables = { 
  orders: ordersTable, 
  orderItems: orderItemsTable 
};