import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { type CurrentOrderState, type BreakTimeItem } from '../schema';
import { validateOrderState } from '../handlers/validate_order_state';

describe('validateOrderState', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return true for valid order state with positive quantities', async () => {
    const validOrderState: CurrentOrderState = {
      items: {
        'Tea': 2,
        'Coffee': 1,
        'Milk': 3
      }
    };

    const result = await validateOrderState(validOrderState);
    expect(result).toBe(true);
  });

  it('should return true for order state with mix of zero and positive quantities', async () => {
    const orderState: CurrentOrderState = {
      items: {
        'Tea': 0,
        'Coffee': 2,
        'Milk': 0,
        'Boost': 1
      }
    };

    const result = await validateOrderState(orderState);
    expect(result).toBe(true);
  });

  it('should return false for order state with all zero quantities', async () => {
    const orderState: CurrentOrderState = {
      items: {
        'Tea': 0,
        'Coffee': 0,
        'Milk': 0
      }
    };

    const result = await validateOrderState(orderState);
    expect(result).toBe(false);
  });

  it('should return false for empty items object', async () => {
    const orderState: CurrentOrderState = {
      items: {}
    };

    const result = await validateOrderState(orderState);
    expect(result).toBe(false);
  });

  it('should return false for invalid item names', async () => {
    const orderState = {
      items: {
        'InvalidItem': 2,
        'Tea': 1
      }
    } as CurrentOrderState;

    const result = await validateOrderState(orderState);
    expect(result).toBe(false);
  });

  it('should return false for negative quantities', async () => {
    const orderState: CurrentOrderState = {
      items: {
        'Tea': -1,
        'Coffee': 2
      }
    };

    const result = await validateOrderState(orderState);
    expect(result).toBe(false);
  });

  it('should return false for non-integer quantities', async () => {
    const orderState: CurrentOrderState = {
      items: {
        'Tea': 2.5,
        'Coffee': 1
      }
    };

    const result = await validateOrderState(orderState);
    expect(result).toBe(false);
  });

  it('should return true for all valid break time items', async () => {
    const orderState: CurrentOrderState = {
      items: {
        'Tea': 1,
        'Coffee': 2,
        'Milk': 3,
        'Boost': 1,
        'Horlicks': 2
      }
    };

    const result = await validateOrderState(orderState);
    expect(result).toBe(true);
  });

  it('should return true for single item with positive quantity', async () => {
    const orderState: CurrentOrderState = {
      items: {
        'Tea': 1
      }
    };

    const result = await validateOrderState(orderState);
    expect(result).toBe(true);
  });

  it('should return false for malformed order state with null items', async () => {
    const orderState = {
      items: null as any
    };

    const result = await validateOrderState(orderState);
    expect(result).toBe(false);
  });

  it('should return false for malformed order state with undefined items', async () => {
    const orderState = {
      items: undefined as any
    };

    const result = await validateOrderState(orderState);
    expect(result).toBe(false);
  });

  it('should return false for order state with non-object items', async () => {
    const orderState = {
      items: 'invalid' as any
    };

    const result = await validateOrderState(orderState);
    expect(result).toBe(false);
  });
});