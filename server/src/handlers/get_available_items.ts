import { type BreakTimeItem } from '../schema';

export const getAvailableItems = async (): Promise<BreakTimeItem[]> => {
  try {
    // Return the fixed list of available break time items
    // These items correspond to the breakTimeItemEnum in the database schema
    const availableItems: BreakTimeItem[] = ['Tea', 'Coffee', 'Milk', 'Boost', 'Horlicks'];
    
    return availableItems;
  } catch (error) {
    console.error('Failed to get available items:', error);
    throw error;
  }
};