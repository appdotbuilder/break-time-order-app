import { db } from '../db';
import { ordersTable, orderItemsTable } from '../db/schema';
import { type OrderSummary, type Order, type OrderItem } from '../schema';
import { desc, eq } from 'drizzle-orm';

export async function getOrders(): Promise<OrderSummary[]> {
  try {
    // Fetch all orders with their related items using join
    const results = await db.select()
      .from(ordersTable)
      .leftJoin(orderItemsTable, eq(ordersTable.id, orderItemsTable.order_id))
      .orderBy(desc(ordersTable.created_at))
      .execute();

    // Group the results by order ID to structure the response
    const orderMap = new Map<number, {
      order: Order;
      items: OrderItem[];
    }>();

    for (const result of results) {
      const order = result.orders;
      const orderItem = result.order_items;

      if (!orderMap.has(order.id)) {
        orderMap.set(order.id, {
          order: {
            id: order.id,
            created_at: order.created_at,
            total_items: order.total_items
          },
          items: []
        });
      }

      // Add order item if it exists (leftJoin can have null order items for orders with no items)
      if (orderItem) {
        orderMap.get(order.id)!.items.push({
          id: orderItem.id,
          order_id: orderItem.order_id,
          item_name: orderItem.item_name,
          quantity: orderItem.quantity,
          created_at: orderItem.created_at
        });
      }
    }

    // Convert map to array of OrderSummary objects
    return Array.from(orderMap.values()).map(({ order, items }) => ({
      order,
      items
    }));
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    throw error;
  }
}