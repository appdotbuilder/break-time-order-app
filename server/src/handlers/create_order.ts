import { db } from '../db';
import { ordersTable, orderItemsTable } from '../db/schema';
import { type CreateOrderInput, type OrderSummary } from '../schema';

export async function createOrder(input: CreateOrderInput): Promise<OrderSummary> {
  try {
    // Calculate total items count
    const totalItems = input.items.reduce((sum, item) => sum + item.quantity, 0);

    // Create the order record first
    const orderResult = await db.insert(ordersTable)
      .values({
        total_items: totalItems
      })
      .returning()
      .execute();

    const order = orderResult[0];

    // Create all order items
    const orderItemsData = input.items.map(item => ({
      order_id: order.id,
      item_name: item.item_name,
      quantity: item.quantity
    }));

    const orderItemsResult = await db.insert(orderItemsTable)
      .values(orderItemsData)
      .returning()
      .execute();

    // Return the complete order summary
    return {
      order,
      items: orderItemsResult
    };
  } catch (error) {
    console.error('Order creation failed:', error);
    throw error;
  }
}