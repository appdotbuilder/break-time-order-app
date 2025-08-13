import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ItemCard } from '@/components/ItemCard';
import { OrderSummary } from '@/components/OrderSummary';
import { FloatingOrderButton } from '@/components/FloatingOrderButton';
import { Toast } from '@/components/Toast';
import type { BreakTimeItem } from '../../server/src/schema';

interface OrderState {
  [key: string]: number;
}

interface ToastState {
  message: string;
  emoji: string;
  id: number;
}

function App() {
  const [availableItems, setAvailableItems] = useState<BreakTimeItem[]>([]);
  const [orderState, setOrderState] = useState<OrderState>({});
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<ToastState | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  // Load available items on mount
  const loadAvailableItems = useCallback(async () => {
    try {
      const items = await trpc.getAvailableItems.query();
      setAvailableItems(items);
    } catch (error) {
      console.error('Failed to load available items:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAvailableItems();
  }, [loadAvailableItems]);

  // Show toast notification
  const showToast = (message: string, emoji: string = '✨') => {
    const id = Date.now();
    setToast({ message, emoji, id });
  };

  // Handle quantity changes with smooth animations
  const updateQuantity = (item: BreakTimeItem, change: number) => {
    setOrderState(prev => {
      const currentQuantity = prev[item] || 0;
      const newQuantity = Math.max(0, currentQuantity + change);
      
      // Show toast notifications for changes
      if (change > 0) {
        showToast(`Added ${item} to order`, '✅');
      } else if (change < 0 && newQuantity >= 0) {
        showToast(`Removed ${item} from order`, '🗑️');
      }
      
      if (newQuantity === 0) {
        const { [item]: _, ...rest } = prev;
        return rest;
      }
      
      return {
        ...prev,
        [item]: newQuantity
      };
    });
  };

  // Clear all items
  const clearOrder = () => {
    const itemCount = totalItems;
    setOrderState({});
    if (itemCount > 0) {
      showToast(`Cleared all ${itemCount} items`, '🧹');
    }
  };

  // Calculate total items in cart
  const totalItems = Object.values(orderState).reduce((sum, quantity) => sum + quantity, 0);

  // Scroll to summary section
  const scrollToSummary = () => {
    summaryRef.current?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start',
      inline: 'nearest' 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6 loading-spinner">☕</div>
          <h2 className="text-2xl font-bold mb-2 gradient-text">
            Preparing Your Break Time Menu
          </h2>
          <p className="text-gray-600 text-lg">
            Getting everything ready for the perfect break! 
          </p>
          <div className="mt-4 flex justify-center gap-1">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <span className="text-5xl">☕</span>
            Break Time Orders
          </h1>
          <p className="text-gray-600 text-lg">
            Select your favorite items for a perfect break! 🌟
          </p>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {availableItems.map((item) => (
            <ItemCard
              key={item}
              item={item}
              quantity={orderState[item] || 0}
              onQuantityChange={updateQuantity}
            />
          ))}
        </div>

        {/* Order Summary */}
        <div ref={summaryRef}>
          <OrderSummary
            orderState={orderState}
            onQuantityChange={updateQuantity}
            onClearOrder={clearOrder}
          />
        </div>

        {/* Fun Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p className="text-sm">
            ☕ Enjoy your break time! ☕
          </p>
        </div>
      </div>

      {/* Floating Order Button */}
      <FloatingOrderButton 
        totalItems={totalItems}
        onScrollToSummary={scrollToSummary}
      />

      {/* Toast Notifications */}
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          emoji={toast.emoji}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;