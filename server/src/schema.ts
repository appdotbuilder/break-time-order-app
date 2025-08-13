import { z } from 'zod';

// Available break time items enum
export const breakTimeItemSchema = z.enum(['Tea', 'Coffee', 'Milk', 'Boost', 'Horlicks']);
export type BreakTimeItem = z.infer<typeof breakTimeItemSchema>;

// Order item schema - represents a single item with quantity in an order
export const orderItemSchema = z.object({
  id: z.number(),
  order_id: z.number(),
  item_name: breakTimeItemSchema,
  quantity: z.number().int().positive(), // Must be positive integer
  created_at: z.coerce.date()
});

export type OrderItem = z.infer<typeof orderItemSchema>;

// Order schema - represents a complete order
export const orderSchema = z.object({
  id: z.number(),
  created_at: z.coerce.date(),
  total_items: z.number().int().nonnegative() // Total count of all items in order
});

export type Order = z.infer<typeof orderSchema>;

// Input schema for creating an order item
export const createOrderItemInputSchema = z.object({
  order_id: z.number(),
  item_name: breakTimeItemSchema,
  quantity: z.number().int().positive()
});

export type CreateOrderItemInput = z.infer<typeof createOrderItemInputSchema>;

// Input schema for updating order item quantity
export const updateOrderItemInputSchema = z.object({
  id: z.number(),
  quantity: z.number().int().positive()
});

export type UpdateOrderItemInput = z.infer<typeof updateOrderItemInputSchema>;

// Input schema for creating a new order
export const createOrderInputSchema = z.object({
  items: z.array(z.object({
    item_name: breakTimeItemSchema,
    quantity: z.number().int().positive()
  })).min(1) // Must have at least one item
});

export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;

// Schema for order summary with items
export const orderSummarySchema = z.object({
  order: orderSchema,
  items: z.array(orderItemSchema)
});

export type OrderSummary = z.infer<typeof orderSummarySchema>;

// Schema for current order state (transient order before submission)
export const currentOrderStateSchema = z.object({
  items: z.record(breakTimeItemSchema, z.number().int().nonnegative()) // item_name -> quantity mapping
});

export type CurrentOrderState = z.infer<typeof currentOrderStateSchema>;