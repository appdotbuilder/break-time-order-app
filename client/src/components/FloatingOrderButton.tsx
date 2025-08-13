import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FloatingOrderButtonProps {
  totalItems: number;
  onScrollToSummary: () => void;
}

export function FloatingOrderButton({ totalItems, onScrollToSummary }: FloatingOrderButtonProps) {
  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={onScrollToSummary}
        className="relative w-16 h-16 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 pulse-gentle"
        size="lg"
      >
        <div className="flex flex-col items-center justify-center">
          <span className="text-xl">🛒</span>
          <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[1.5rem] h-6 flex items-center justify-center">
            {totalItems > 99 ? '99+' : totalItems}
          </Badge>
        </div>
      </Button>
    </div>
  );
}