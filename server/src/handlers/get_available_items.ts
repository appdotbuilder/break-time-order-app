import { type BreakTimeItem } from '../schema';

export async function getAvailableItems(): Promise<BreakTimeItem[]> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is returning the fixed list of available break time items.
    // This is a simple handler that returns the predefined list: Tea, Coffee, Milk, Boost, Horlicks
    
    return ['Tea', 'Coffee', 'Milk', 'Boost', 'Horlicks'];
}