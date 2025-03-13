
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronRight, Plus, Minus, RotateCcw } from 'lucide-react';

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
  max = 100 
}) => {
  const [inputValue, setInputValue] = useState<string>(selectedNumber?.toString() || '');
  const numValue = parseInt(inputValue, 10) || 0;
  
  useEffect(() => {
    if (selectedNumber !== null) {
      setInputValue(selectedNumber.toString());
    }
  }, [selectedNumber]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only positive numbers
    if (/^\d*$/.test(value)) {
      setInputValue(value);
    }
  };
  
  const handleSubmit = () => {
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onSelect(numValue);
    }
  };

  const increment = () => {
    const newValue = Math.min(numValue + 1, max);
    setInputValue(newValue.toString());
  };

  const decrement = () => {
    const newValue = Math.max(numValue - 1, min);
    setInputValue(newValue.toString());
  };

  const reset = () => {
    setInputValue('');
  };

  return (
    <div className="flex flex-col items-center gap-4 mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <div className="flex w-full max-w-xs gap-3">
        <div className="flex w-full items-center">
          <Button 
            type="button" 
            onClick={decrement}
            disabled={numValue <= min || !inputValue}
            variant="outline"
            size="icon"
            className="rounded-r-none interactive-button dark:bg-gray-800 dark:text-purple-light dark:border-gray-700"
            aria-label="Decrease number"
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={`Enter (${min}-${max})`}
            className="text-center text-lg rounded-none shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:placeholder:text-gray-500"
            aria-label="Enter a number"
            min={min}
            max={max}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
            autoFocus
          />
          
          <Button 
            type="button" 
            onClick={increment}
            disabled={numValue >= max || !inputValue}
            variant="outline"
            size="icon"
            className="rounded-l-none interactive-button dark:bg-gray-800 dark:text-purple-light dark:border-gray-700"
            aria-label="Increase number"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <Button 
          onClick={handleSubmit}
          className="bg-icebreaker hover:bg-icebreaker-dark dark:bg-purple dark:hover:bg-purple-dark transition-all duration-300 shadow-sm interactive-button"
          disabled={!inputValue || isNaN(numValue) || numValue < min || numValue > max}
        >
          <span>Select</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      {inputValue && (
        <Button
          variant="ghost"
          size="sm"
          onClick={reset}
          className="text-gray-500 dark:text-gray-400 interactive-button gap-1"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset</span>
        </Button>
      )}
      
      {selectedNumber !== null && (
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-icebreaker dark:bg-purple text-white text-2xl font-bold mt-2 shadow-md animate-bounce-subtle">
          {selectedNumber}
        </div>
      )}
    </div>
  );
};

export default NumberSelector;
