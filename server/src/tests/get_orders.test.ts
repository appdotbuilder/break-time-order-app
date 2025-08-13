import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { ordersTable, orderItemsTable } from '../db/schema';
import { getOrders } from '../handlers/get_orders';
import type { BreakTimeItem } from '../schema';

describe('getOrders', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no orders exist', async () => {
    const result = await getOrders();
    
    expect(result).toEqual([]);
  });

  it('should return orders with their items', async () => {
    // Create test order
    const orderResult = await db.insert(ordersTable)
      .values({
        total_items: 3
      })
      .returning()
      .execute();

    const order = orderResult[0];

    // Create test order items
    await db.insert(orderItemsTable)
      .values([
        {
          order_id: order.id,
          item_name: 'Tea' as BreakTimeItem,
          quantity: 2
        },
        {
          order_id: order.id,
          item_name: 'Coffee' as BreakTimeItem,
          quantity: 1
        }
      ])
      .execute();

    const result = await getOrders();

    expect(result).toHaveLength(1);
    
    const orderSummary = result[0];
    expect(orderSummary.order.id).toEqual(order.id);
    expect(orderSummary.order.total_items).toEqual(3);
    expect(orderSummary.order.created_at).toBeInstanceOf(Date);

    expect(orderSummary.items).toHaveLength(2);
    
    // Check Tea item
    const teaItem = orderSummary.items.find(item => item.item_name === 'Tea');
    expect(teaItem).toBeDefined();
    expect(teaItem!.quantity).toEqual(2);
    expect(teaItem!.order_id).toEqual(order.id);
    expect(teaItem!.created_at).toBeInstanceOf(Date);

    // Check Coffee item
    const coffeeItem = orderSummary.items.find(item => item.item_name === 'Coffee');
    expect(coffeeItem).toBeDefined();
    expect(coffeeItem!.quantity).toEqual(1);
    expect(coffeeItem!.order_id).toEqual(order.id);
    expect(coffeeItem!.created_at).toBeInstanceOf(Date);
  });

  it('should return multiple orders with their respective items', async () => {
    // Create first order
    const order1Result = await db.insert(ordersTable)
      .values({
        total_items: 2
      })
      .returning()
      .execute();

    const order1 = order1Result[0];

    // Create second order
    const order2Result = await db.insert(ordersTable)
      .values({
        total_items: 1
      })
      .returning()
      .execute();

    const order2 = order2Result[0];

    // Create items for first order
    await db.insert(orderItemsTable)
      .values([
        {
          order_id: order1.id,
          item_name: 'Tea' as BreakTimeItem,
          quantity: 2
        }
      ])
      .execute();

    // Create items for second order
    await db.insert(orderItemsTable)
      .values([
        {
          order_id: order2.id,
          item_name: 'Milk' as BreakTimeItem,
          quantity: 1
        }
      ])
      .execute();

    const result = await getOrders();

    expect(result).toHaveLength(2);
    
    // Orders should be sorted by created_at desc (newest first)
    // Since order2 was created after order1, it should come first
    expect(result[0].order.id).toEqual(order2.id);
    expect(result[1].order.id).toEqual(order1.id);

    // Check first order (order2)
    expect(result[0].order.total_items).toEqual(1);
    expect(result[0].items).toHaveLength(1);
    expect(result[0].items[0].item_name).toEqual('Milk');
    expect(result[0].items[0].quantity).toEqual(1);

    // Check second order (order1)
    expect(result[1].order.total_items).toEqual(2);
    expect(result[1].items).toHaveLength(1);
    expect(result[1].items[0].item_name).toEqual('Tea');
    expect(result[1].items[0].quantity).toEqual(2);
  });

  it('should handle orders with no items gracefully', async () => {
    // Create order without any items
    const orderResult = await db.insert(ordersTable)
      .values({
        total_items: 0
      })
      .returning()
      .execute();

    const order = orderResult[0];

    const result = await getOrders();

    expect(result).toHaveLength(1);
    expect(result[0].order.id).toEqual(order.id);
    expect(result[0].order.total_items).toEqual(0);
    expect(result[0].items).toEqual([]);
  });

  it('should handle all break time item types', async () => {
    const orderResult = await db.insert(ordersTable)
      .values({
        total_items: 5
      })
      .returning()
      .execute();

    const order = orderResult[0];

    // Create items with all available break time items
    await db.insert(orderItemsTable)
      .values([
        {
          order_id: order.id,
          item_name: 'Tea' as BreakTimeItem,
          quantity: 1
        },
        {
          order_id: order.id,
          item_name: 'Coffee' as BreakTimeItem,
          quantity: 1
        },
        {
          order_id: order.id,
          item_name: 'Milk' as BreakTimeItem,
          quantity: 1
        },
        {
          order_id: order.id,
          item_name: 'Boost' as BreakTimeItem,
          quantity: 1
        },
        {
          order_id: order.id,
          item_name: 'Horlicks' as BreakTimeItem,
          quantity: 1
        }
      ])
      .execute();

    const result = await getOrders();

    expect(result).toHaveLength(1);
    expect(result[0].items).toHaveLength(5);

    const itemNames = result[0].items.map(item => item.item_name).sort();
    expect(itemNames).toEqual(['Boost', 'Coffee', 'Horlicks', 'Milk', 'Tea']);
    
    // Verify all items have correct quantities
    result[0].items.forEach(item => {
      expect(item.quantity).toEqual(1);
      expect(item.order_id).toEqual(order.id);
    });
  });

  it('should order results by creation date descending', async () => {
    // Create orders with a small delay to ensure different timestamps
    const order1Result = await db.insert(ordersTable)
      .values({ total_items: 0 })
      .returning()
      .execute();

    // Add a small delay
    await new Promise(resolve => setTimeout(resolve, 10));

    const order2Result = await db.insert(ordersTable)
      .values({ total_items: 0 })
      .returning()
      .execute();

    const result = await getOrders();

    expect(result).toHaveLength(2);
    
    // Most recent order should come first
    expect(result[0].order.id).toEqual(order2Result[0].id);
    expect(result[1].order.id).toEqual(order1Result[0].id);
    
    // Verify timestamps are in descending order
    expect(result[0].order.created_at >= result[1].order.created_at).toBe(true);
  });
});