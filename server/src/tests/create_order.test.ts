import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { ordersTable, orderItemsTable } from '../db/schema';
import { type CreateOrderInput } from '../schema';
import { createOrder } from '../handlers/create_order';
import { eq } from 'drizzle-orm';

// Test input with multiple items
const testInput: CreateOrderInput = {
  items: [
    { item_name: 'Tea', quantity: 2 },
    { item_name: 'Coffee', quantity: 1 },
    { item_name: 'Milk', quantity: 3 }
  ]
};

// Single item test input
const singleItemInput: CreateOrderInput = {
  items: [
    { item_name: 'Horlicks', quantity: 5 }
  ]
};

describe('createOrder', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an order with multiple items', async () => {
    const result = await createOrder(testInput);

    // Verify order structure
    expect(result.order).toBeDefined();
    expect(result.items).toBeDefined();
    expect(result.order.id).toBeDefined();
    expect(result.order.created_at).toBeInstanceOf(Date);
    expect(result.order.total_items).toEqual(6); // 2 + 1 + 3 = 6

    // Verify items structure
    expect(result.items).toHaveLength(3);
    
    // Check individual items
    const teaItem = result.items.find(item => item.item_name === 'Tea');
    expect(teaItem).toBeDefined();
    expect(teaItem!.quantity).toEqual(2);
    expect(teaItem!.order_id).toEqual(result.order.id);
    expect(teaItem!.created_at).toBeInstanceOf(Date);

    const coffeeItem = result.items.find(item => item.item_name === 'Coffee');
    expect(coffeeItem).toBeDefined();
    expect(coffeeItem!.quantity).toEqual(1);
    expect(coffeeItem!.order_id).toEqual(result.order.id);

    const milkItem = result.items.find(item => item.item_name === 'Milk');
    expect(milkItem).toBeDefined();
    expect(milkItem!.quantity).toEqual(3);
    expect(milkItem!.order_id).toEqual(result.order.id);
  });

  it('should create an order with single item', async () => {
    const result = await createOrder(singleItemInput);

    // Verify order
    expect(result.order.total_items).toEqual(5);
    expect(result.items).toHaveLength(1);

    // Verify single item
    const item = result.items[0];
    expect(item.item_name).toEqual('Horlicks');
    expect(item.quantity).toEqual(5);
    expect(item.order_id).toEqual(result.order.id);
  });

  it('should persist order to database', async () => {
    const result = await createOrder(testInput);

    // Verify order is saved in database
    const savedOrders = await db.select()
      .from(ordersTable)
      .where(eq(ordersTable.id, result.order.id))
      .execute();

    expect(savedOrders).toHaveLength(1);
    expect(savedOrders[0].total_items).toEqual(6);
    expect(savedOrders[0].created_at).toBeInstanceOf(Date);
  });

  it('should persist order items to database', async () => {
    const result = await createOrder(testInput);

    // Verify all order items are saved
    const savedItems = await db.select()
      .from(orderItemsTable)
      .where(eq(orderItemsTable.order_id, result.order.id))
      .execute();

    expect(savedItems).toHaveLength(3);

    // Check each item exists in database
    const teaItem = savedItems.find(item => item.item_name === 'Tea');
    expect(teaItem).toBeDefined();
    expect(teaItem!.quantity).toEqual(2);

    const coffeeItem = savedItems.find(item => item.item_name === 'Coffee');
    expect(coffeeItem).toBeDefined();
    expect(coffeeItem!.quantity).toEqual(1);

    const milkItem = savedItems.find(item => item.item_name === 'Milk');
    expect(milkItem).toBeDefined();
    expect(milkItem!.quantity).toEqual(3);
  });

  it('should calculate total items correctly for large quantities', async () => {
    const largeOrderInput: CreateOrderInput = {
      items: [
        { item_name: 'Tea', quantity: 100 },
        { item_name: 'Coffee', quantity: 50 },
        { item_name: 'Boost', quantity: 25 }
      ]
    };

    const result = await createOrder(largeOrderInput);

    expect(result.order.total_items).toEqual(175); // 100 + 50 + 25
    expect(result.items).toHaveLength(3);
  });

  it('should handle duplicate item names correctly', async () => {
    const duplicateItemInput: CreateOrderInput = {
      items: [
        { item_name: 'Tea', quantity: 2 },
        { item_name: 'Tea', quantity: 3 } // Same item twice
      ]
    };

    const result = await createOrder(duplicateItemInput);

    // Should create two separate order item records
    expect(result.order.total_items).toEqual(5); // 2 + 3
    expect(result.items).toHaveLength(2);

    const teaItems = result.items.filter(item => item.item_name === 'Tea');
    expect(teaItems).toHaveLength(2);
    expect(teaItems[0].quantity).toEqual(2);
    expect(teaItems[1].quantity).toEqual(3);
  });
});