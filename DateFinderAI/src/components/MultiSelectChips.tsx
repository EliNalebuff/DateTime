'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { MultiSelectChipsProps } from '@/types';

const MultiSelectChips: React.FC<MultiSelectChipsProps> = ({
  options,
  selected,
  onChange,
  maxSelections,
  placeholder = 'Select options...',
}) => {
  const handleToggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      if (maxSelections && selected.length >= maxSelections) {
        return;
      }
      onChange([...selected, option]);
    }
  };

  return (
    <div className="space-y-3">
      {placeholder && selected.length === 0 && (
        <p className="text-sm text-gray-500">{placeholder}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option, index) => {
          const isSelected = selected.includes(option);
          const isDisabled = Boolean(maxSelections && selected.length >= maxSelections && !isSelected);
          
          return (
            <button
              key={`${option}-${index}`}
              type="button"
              onClick={() => handleToggle(option)}
              disabled={isDisabled}
              className={cn(
                'chip transition-all duration-200',
                {
                  'chip-selected': isSelected,
                  'opacity-50 cursor-not-allowed': isDisabled,
                }
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
      {maxSelections && (
        <p className="text-xs text-gray-500">
          Select up to {maxSelections} option{maxSelections > 1 ? 's' : ''} 
          ({selected.length}/{maxSelections} selected)
        </p>
      )}
    </div>
  );
};

export default MultiSelectChips; 