'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { DayPickerProps } from '@/types';

const DayPicker: React.FC<DayPickerProps> = ({
  selectedDays,
  onChange,
  maxSelections,
}) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleToggle = (day: string) => {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter(d => d !== day));
    } else {
      if (maxSelections && selectedDays.length >= maxSelections) {
        return;
      }
      onChange([...selectedDays, day]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {days.map((day) => {
          const isSelected = selectedDays.includes(day);
          const isDisabled = maxSelections && selectedDays.length >= maxSelections && !isSelected;
          
          return (
            <button
              key={day}
              type="button"
              onClick={() => handleToggle(day)}
              disabled={isDisabled}
              className={cn(
                'p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200',
                {
                  'border-primary-500 bg-primary-50 text-primary-700': isSelected,
                  'border-gray-200 bg-white text-gray-700 hover:border-gray-300': !isSelected && !isDisabled,
                  'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed': isDisabled,
                }
              )}
            >
              {day.slice(0, 3)}
            </button>
          );
        })}
      </div>
      {maxSelections && (
        <p className="text-xs text-gray-500">
          Select up to {maxSelections} day{maxSelections > 1 ? 's' : ''} 
          ({selectedDays.length}/{maxSelections} selected)
        </p>
      )}
    </div>
  );
};

export default DayPicker; 