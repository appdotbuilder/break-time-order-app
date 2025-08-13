import { type CurrentOrderState, breakTimeItemSchema } from '../schema';

export const validateOrderState = async (orderState: CurrentOrderState): Promise<boolean> => {
  try {
    // Check that the orderState has items
    if (!orderState.items || typeof orderState.items !== 'object') {
      return false;
    }

    const itemEntries = Object.entries(orderState.items);

    // Check that there is at least one item
    if (itemEntries.length === 0) {
      return false;
    }

    let hasPositiveQuantity = false;

    // Validate each item and quantity
    for (const [itemName, quantity] of itemEntries) {
      // 1. Check that item name is a valid break time item
      const itemValidation = breakTimeItemSchema.safeParse(itemName);
      if (!itemValidation.success) {
        return false;
      }

      // 2. Check that quantity is a non-negative integer
      if (!Number.isInteger(quantity) || quantity < 0) {
        return false;
      }

      // 3. Track if we have at least one item with positive quantity
      if (quantity > 0) {
        hasPositiveQuantity = true;
      }
    }

    // 4. Ensure at least one item has quantity > 0
    return hasPositiveQuantity;
  } catch (error) {
    console.error('Order state validation failed:', error);
    return false;
  }
};