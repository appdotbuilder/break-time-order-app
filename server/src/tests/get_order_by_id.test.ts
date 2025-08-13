import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { ordersTable, orderItemsTable } from '../db/schema';
import { getOrderById } from '../handlers/get_order_by_id';
import { type BreakTimeItem } from '../schema';

describe('getOrderById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null for non-existent order', async () => {
    const result = await getOrderById(999);
    expect(result).toBeNull();
  });

  it('should return order without items when order exists but has no items', async () => {
    // Create order without items
    const orderResult = await db.insert(ordersTable)
      .values({
        total_items: 0
      })
      .returning()
      .execute();

    const orderId = orderResult[0].id;

    const result = await getOrderById(orderId);

    expect(result).not.toBeNull();
    expect(result!.order.id).toBe(orderId);
    expect(result!.order.total_items).toBe(0);
    expect(result!.order.created_at).toBeInstanceOf(Date);
    expect(result!.items).toHaveLength(0);
  });

  it('should return order with single item', async () => {
    // Create order with single item
    const orderResult = await db.insert(ordersTable)
      .values({
        total_items: 2
      })
      .returning()
      .execute();

    const orderId = orderResult[0].id;

    // Add single order item
    await db.insert(orderItemsTable)
      .values({
        order_id: orderId,
        item_name: 'Tea' as BreakTimeItem,
        quantity: 2
      })
      .execute();

    const result = await getOrderById(orderId);

    expect(result).not.toBeNull();
    expect(result!.order.id).toBe(orderId);
    expect(result!.order.total_items).toBe(2);
    expect(result!.items).toHaveLength(1);
    
    const item = result!.items[0];
    expect(item.order_id).toBe(orderId);
    expect(item.item_name).toBe('Tea');
    expect(item.quantity).toBe(2);
    expect(item.created_at).toBeInstanceOf(Date);
    expect(item.id).toBeDefined();
  });

  it('should return order with multiple items', async () => {
    // Create order with multiple items
    const orderResult = await db.insert(ordersTable)
      .values({
        total_items: 5
      })
      .returning()
      .execute();

    const orderId = orderResult[0].id;

    // Add multiple order items
    await db.insert(orderItemsTable)
      .values([
        {
          order_id: orderId,
          item_name: 'Tea' as BreakTimeItem,
          quantity: 2
        },
        {
          order_id: orderId,
          item_name: 'Coffee' as BreakTimeItem,
          quantity: 1
        },
        {
          order_id: orderId,
          item_name: 'Milk' as BreakTimeItem,
          quantity: 2
        }
      ])
      .execute();

    const result = await getOrderById(orderId);

    expect(result).not.toBeNull();
    expect(result!.order.id).toBe(orderId);
    expect(result!.order.total_items).toBe(5);
    expect(result!.items).toHaveLength(3);

    // Verify all items are present with correct data
    const itemNames = result!.items.map(item => item.item_name);
    expect(itemNames).toContain('Tea');
    expect(itemNames).toContain('Coffee');
    expect(itemNames).toContain('Milk');

    // Check specific item details
    const teaItem = result!.items.find(item => item.item_name === 'Tea')!;
    expect(teaItem.quantity).toBe(2);
    expect(teaItem.order_id).toBe(orderId);

    const coffeeItem = result!.items.find(item => item.item_name === 'Coffee')!;
    expect(coffeeItem.quantity).toBe(1);
    expect(coffeeItem.order_id).toBe(orderId);

    const milkItem = result!.items.find(item => item.item_name === 'Milk')!;
    expect(milkItem.quantity).toBe(2);
    expect(milkItem.order_id).toBe(orderId);
  });

  it('should return correct order when multiple orders exist', async () => {
    // Create multiple orders
    const order1Result = await db.insert(ordersTable)
      .values({
        total_items: 3
      })
      .returning()
      .execute();

    const order2Result = await db.insert(ordersTable)
      .values({
        total_items: 2
      })
      .returning()
      .execute();

    const orderId1 = order1Result[0].id;
    const orderId2 = order2Result[0].id;

    // Add items to both orders
    await db.insert(orderItemsTable)
      .values([
        {
          order_id: orderId1,
          item_name: 'Tea' as BreakTimeItem,
          quantity: 3
        },
        {
          order_id: orderId2,
          item_name: 'Coffee' as BreakTimeItem,
          quantity: 2
        }
      ])
      .execute();

    // Query for specific order should only return that order's data
    const result1 = await getOrderById(orderId1);
    const result2 = await getOrderById(orderId2);

    expect(result1).not.toBeNull();
    expect(result1!.order.id).toBe(orderId1);
    expect(result1!.order.total_items).toBe(3);
    expect(result1!.items).toHaveLength(1);
    expect(result1!.items[0].item_name).toBe('Tea');
    expect(result1!.items[0].quantity).toBe(3);

    expect(result2).not.toBeNull();
    expect(result2!.order.id).toBe(orderId2);
    expect(result2!.order.total_items).toBe(2);
    expect(result2!.items).toHaveLength(1);
    expect(result2!.items[0].item_name).toBe('Coffee');
    expect(result2!.items[0].quantity).toBe(2);
  });

  it('should handle all break time item types', async () => {
    // Create order with all available item types
    const orderResult = await db.insert(ordersTable)
      .values({
        total_items: 10
      })
      .returning()
      .execute();

    const orderId = orderResult[0].id;

    // Add all possible break time items
    await db.insert(orderItemsTable)
      .values([
        {
          order_id: orderId,
          item_name: 'Tea' as BreakTimeItem,
          quantity: 2
        },
        {
          order_id: orderId,
          item_name: 'Coffee' as BreakTimeItem,
          quantity: 3
        },
        {
          order_id: orderId,
          item_name: 'Milk' as BreakTimeItem,
          quantity: 1
        },
        {
          order_id: orderId,
          item_name: 'Boost' as BreakTimeItem,
          quantity: 2
        },
        {
          order_id: orderId,
          item_name: 'Horlicks' as BreakTimeItem,
          quantity: 2
        }
      ])
      .execute();

    const result = await getOrderById(orderId);

    expect(result).not.toBeNull();
    expect(result!.items).toHaveLength(5);
    
    // Verify all item types are present
    const itemNames = result!.items.map(item => item.item_name).sort();
    expect(itemNames).toEqual(['Boost', 'Coffee', 'Horlicks', 'Milk', 'Tea']);
    
    // Verify total quantities match
    const totalQuantity = result!.items.reduce((sum, item) => sum + item.quantity, 0);
    expect(totalQuantity).toBe(10);
    expect(result!.order.total_items).toBe(10);
  });
});