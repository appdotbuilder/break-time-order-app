import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import type { BreakTimeItem } from '../../../server/src/schema';

interface ItemCardProps {
  item: BreakTimeItem;
  quantity: number;
  onQuantityChange: (item: BreakTimeItem, change: number) => void;
}

export function ItemCard({ item, quantity, onQuantityChange }: ItemCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);

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

  // Get description for each item
  const getItemDescription = (item: BreakTimeItem): string => {
    const descriptions: Record<BreakTimeItem, string> = {
      'Tea': 'Refreshing tea blend',
      'Coffee': 'Rich coffee experience',
      'Milk': 'Fresh dairy goodness',
      'Boost': 'Energy drink boost',
      'Horlicks': 'Malted milk drink'
    };
    return descriptions[item] || 'Delicious drink';
  };

  const handleQuantityChange = (change: number) => {
    setIsAnimating(true);
    onQuantityChange(item, change);
    
    // Reset animation after a short delay
    setTimeout(() => setIsAnimating(false), 300);
  };

  const hasItems = quantity > 0;

  return (
    <Card 
      className={`card-hover transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${
        hasItems ? 'ring-2 ring-orange-400 bg-orange-50' : 'hover:bg-white'
      } ${isAnimating ? 'scale-105' : ''}`}
    >
      <CardHeader className="text-center pb-4">
        <div className={`text-4xl mb-2 transition-transform duration-200 hover:scale-110 ${
          isAnimating ? 'quantity-bounce' : ''
        }`}>
          {getItemEmoji(item)}
        </div>
        <CardTitle className="text-xl font-semibold text-gray-800">
          {item}
        </CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          {getItemDescription(item)}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quantity Display */}
        <div className="text-center min-h-[2rem] flex items-center justify-center">
          {quantity > 0 && (
            <Badge 
              variant="secondary" 
              className="text-lg px-3 py-1 bg-orange-100 text-orange-800 fade-in"
            >
              {quantity} selected
            </Badge>
          )}
        </div>
        
        {/* Quantity Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity === 0}
            className="w-12 h-12 rounded-full text-xl font-bold hover:bg-red-50 hover:border-red-300 disabled:opacity-30 transition-all duration-200 scale-on-hover"
          >
            −
          </Button>
          
          <div className="min-w-[3rem] text-center">
            <span className={`text-2xl font-bold text-gray-700 transition-all duration-200 ${
              isAnimating ? 'quantity-bounce' : ''
            }`}>
              {quantity}
            </span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(1)}
            className="w-12 h-12 rounded-full text-xl font-bold hover:bg-green-50 hover:border-green-300 transition-all duration-200 scale-on-hover"
          >
            +
          </Button>
        </div>
        
        {/* Quick Add Buttons */}
        {quantity === 0 && (
          <div className="flex gap-2 justify-center fade-in">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuantityChange(1)}
              className="text-xs px-3 py-1 hover:bg-orange-100 hover:text-orange-700 transition-colors duration-200"
            >
              Add 1
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuantityChange(5)}
              className="text-xs px-3 py-1 hover:bg-orange-100 hover:text-orange-700 transition-colors duration-200"
            >
              Add 5
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}