import { db } from '../db';
import { ordersTable, orderItemsTable } from '../db/schema';
import { type OrderSummary } from '../schema';
import { eq } from 'drizzle-orm';

export async function getOrderById(id: number): Promise<OrderSummary | null> {
  try {
    // Query order with its items using proper join
    const results = await db.select()
      .from(ordersTable)
      .leftJoin(orderItemsTable, eq(orderItemsTable.order_id, ordersTable.id))
      .where(eq(ordersTable.id, id))
      .execute();

    // If no results found, order doesn't exist
    if (results.length === 0) {
      return null;
    }

    // Extract order data from first result
    const orderData = results[0].orders;
    
    // Collect all order items (filter out null items from left join)
    const items = results
      .filter(result => result.order_items !== null)
      .map(result => result.order_items!);

    return {
      order: {
        id: orderData.id,
        created_at: orderData.created_at,
        total_items: orderData.total_items
      },
      items: items.map(item => ({
        id: item.id,
        order_id: item.order_id,
        item_name: item.item_name,
        quantity: item.quantity,
        created_at: item.created_at
      }))
    };
  } catch (error) {
    console.error('Failed to get order by ID:', error);
    throw error;
  }
}