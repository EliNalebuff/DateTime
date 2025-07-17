'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { TimeRange } from '@/types';

interface TimeRangeSelectorProps {
  proposedTimeRanges: TimeRange[];
  selectedTimeRange: string;
  onChange: (selectedId: string) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  proposedTimeRanges,
  selectedTimeRange,
  onChange,
}) => {
  const handleSelect = (rangeId: string) => {
    onChange(rangeId);
  };

  if (proposedTimeRanges.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No time ranges have been proposed yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        Select the time that works best for you:
      </p>
      <div className="space-y-2">
        {proposedTimeRanges.map((range) => {
          const isSelected = selectedTimeRange === range.id;
          
          return (
            <button
              key={range.id}
              type="button"
              onClick={() => handleSelect(range.id)}
              className={cn(
                'w-full p-4 rounded-lg border-2 text-left transition-all duration-200',
                {
                  'border-primary-500 bg-primary-50 text-primary-700': isSelected,
                  'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50': !isSelected,
                }
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{range.displayText}</span>
                <div className={cn(
                  'w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center',
                  {
                    'border-primary-500': isSelected,
                    'border-gray-300': !isSelected,
                  }
                )}>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      <p className="text-xs text-gray-500">
        {selectedTimeRange ? 'Time selected' : 'Please select a time that works for you'}
      </p>
    </div>
  );
};

export default TimeRangeSelector; 