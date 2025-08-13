import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  emoji?: string;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, emoji = '✨', duration = 2000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-6 right-6 z-50">
      <div
        className={`
          bg-white border border-orange-200 rounded-lg shadow-lg px-4 py-3 flex items-center gap-3
          transition-all duration-300 transform
          ${isVisible 
            ? 'translate-y-0 opacity-100 scale-100' 
            : '-translate-y-2 opacity-0 scale-95'
          }
        `}
      >
        <span className="text-xl">{emoji}</span>
        <span className="text-sm font-medium text-gray-700">{message}</span>
      </div>
    </div>
  );
}