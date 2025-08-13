import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { BreakTimeItem } from '../../../server/src/schema';

interface OrderSummaryProps {
  orderState: { [key: string]: number };
  onQuantityChange: (item: BreakTimeItem, change: number) => void;
  onClearOrder: () => void;
}

export function OrderSummary({ orderState, onQuantityChange, onClearOrder }: OrderSummaryProps) {
  // Calculate total items in cart
  const totalItems = Object.values(orderState).reduce((sum, quantity) => sum + quantity, 0);

  // Get emoji for each item
  const getItemEmoji = (item: BreakTimeItem): string => {
    const emojis: Record<BreakTimeItem, string> = {
      'Tea': '🍵',
      'Coffee': '☕',
      'Milk': '🥛',
      'Boost': '🥤',
      'Horlicks': '🍫'
    };
    return emojis[item] || '🥤';
  };

  return (
    <Card className={`transition-all duration-500 ${totalItems > 0 ? 'slide-up' : ''}`}>
      <CardHeader className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-t-lg">
        <CardTitle className="text-2xl font-semibold text-gray-800 flex items-center justify-between">
          <span className="flex items-center gap-3">
            <span className="text-3xl">🛒</span>
            Order Summary
          </span>
          {totalItems > 0 && (
            <Badge className="bg-orange-500 text-white text-lg px-4 py-2 rounded-full pulse-gentle">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {totalItems === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">🫗</div>
            <p className="text-xl mb-2 font-medium">No items selected yet</p>
            <p className="text-base">Start adding items to see your order summary!</p>
            <div className="mt-4 text-sm text-gray-400">
              💡 Tip: Use the + buttons above to add items
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              {Object.entries(orderState).map(([item, quantity]) => (
                <div 
                  key={item} 
                  className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border transition-all duration-200 hover:shadow-md hover:border-orange-200 fade-in"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{getItemEmoji(item as BreakTimeItem)}</span>
                    <div>
                      <span className="font-semibold text-gray-800 text-lg">{item}</span>
                      <p className="text-sm text-gray-500">
                        {quantity === 1 ? '1 serving' : `${quantity} servings`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-base px-4 py-2">
                      Qty: {quantity}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onQuantityChange(item as BreakTimeItem, -1)}
                        className="w-9 h-9 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                      >
                        −
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onQuantityChange(item as BreakTimeItem, 1)}
                        className="w-9 h-9 rounded-full hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Separator className="my-6" />
            
            {/* Summary Footer */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <span className="text-xl font-bold text-gray-800">
                      Total: {totalItems} {totalItems === 1 ? 'item' : 'items'}
                    </span>
                    <p className="text-sm text-gray-600">
                      Perfect for your break time!
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={onClearOrder}
                    className="text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors duration-200"
                  >
                    <span className="mr-1">🗑️</span>
                    Clear All
                  </Button>
                </div>
              </div>
            </div>

            {/* Fun Stats */}
            <div className="text-center mt-4">
              <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-full px-4 py-2">
                <span>⏰</span>
                <span>Perfect timing for a break!</span>
                <span>🌟</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}