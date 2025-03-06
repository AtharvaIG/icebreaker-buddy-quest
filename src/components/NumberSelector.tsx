
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface NumberSelectorProps {
  onSelect: (number: number) => void;
  selectedNumber: number | null;
  min?: number;
  max?: number;
}

const NumberSelector: React.FC<NumberSelectorProps> = ({ 
  onSelect, 
  selectedNumber, 
  min = 1, 
  max = 10 
}) => {
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      {numbers.map((number) => (
        <button
          key={number}
          onClick={() => onSelect(number)}
          className={cn(
            "number-button",
            "bg-white hover:bg-icebreaker hover:text-white border border-gray-200",
            "shadow-sm hover:shadow transition-all duration-300",
            selectedNumber === number ? "selected bg-icebreaker text-white scale-110" : ""
          )}
          aria-label={`Select number ${number}`}
        >
          {number}
        </button>
      ))}
    </div>
  );
};

export default NumberSelector;
