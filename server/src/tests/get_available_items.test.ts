import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { type BreakTimeItem } from '../schema';
import { getAvailableItems } from '../handlers/get_available_items';

describe('getAvailableItems', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return all available break time items', async () => {
    const result = await getAvailableItems();

    // Verify all expected items are present
    const expectedItems: BreakTimeItem[] = ['Tea', 'Coffee', 'Milk', 'Boost', 'Horlicks'];
    expect(result).toEqual(expectedItems);
  });

  it('should return items in correct order', async () => {
    const result = await getAvailableItems();

    // Verify the order matches the schema definition
    expect(result[0]).toEqual('Tea');
    expect(result[1]).toEqual('Coffee');
    expect(result[2]).toEqual('Milk');
    expect(result[3]).toEqual('Boost');
    expect(result[4]).toEqual('Horlicks');
  });

  it('should return exactly 5 items', async () => {
    const result = await getAvailableItems();

    expect(result).toHaveLength(5);
  });

  it('should return items that match BreakTimeItem type', async () => {
    const result = await getAvailableItems();

    // Verify each item is a valid BreakTimeItem
    const validItems = ['Tea', 'Coffee', 'Milk', 'Boost', 'Horlicks'];
    result.forEach(item => {
      expect(validItems).toContain(item);
      expect(typeof item).toBe('string');
    });
  });

  it('should not contain duplicate items', async () => {
    const result = await getAvailableItems();

    // Create a set to check for duplicates
    const uniqueItems = new Set(result);
    expect(uniqueItems.size).toEqual(result.length);
  });

  it('should be consistent across multiple calls', async () => {
    const result1 = await getAvailableItems();
    const result2 = await getAvailableItems();

    expect(result1).toEqual(result2);
  });
});