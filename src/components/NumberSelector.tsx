
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  max = 100 
}) => {
  const [inputValue, setInputValue] = useState<string>(selectedNumber?.toString() || '');
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only positive numbers
    if (/^\d*$/.test(value)) {
      setInputValue(value);
    }
  };
  
  const handleSubmit = () => {
    const numValue = parseInt(inputValue, 10);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onSelect(numValue);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <div className="flex w-full max-w-xs gap-2">
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Enter a number"
          className="text-center text-lg"
          aria-label="Enter a number"
          min={min}
          max={max}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmit();
            }
          }}
        />
        <Button 
          onClick={handleSubmit}
          className="bg-icebreaker hover:bg-icebreaker-dark"
          disabled={!inputValue}
        >
          Select
        </Button>
      </div>
      
      {selectedNumber !== null && (
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-icebreaker text-white text-2xl font-bold mt-2">
          {selectedNumber}
        </div>
      )}
    </div>
  );
};

export default NumberSelector;
