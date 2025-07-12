'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { SliderProps } from '@/types';

const Slider: React.FC<SliderProps> = ({
  min,
  max,
  step,
  value,
  onChange,
  label,
  formatValue,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  const displayValue = formatValue ? formatValue(value) : value.toString();

  return (
    <div className="space-y-3">
      {label && (
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
          <span className="text-sm font-semibold text-primary-600">
            {displayValue}
          </span>
        </div>
      )}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, #e86875 0%, #e86875 ${((value - min) / (max - min)) * 100}%, #e5e5e5 ${((value - min) / (max - min)) * 100}%, #e5e5e5 100%)`
          }}
        />
        <style jsx>{`
          .slider-thumb::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #e86875;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          .slider-thumb::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #e86875;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
        `}</style>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{formatValue ? formatValue(min) : min}</span>
        <span>{formatValue ? formatValue(max) : max}</span>
      </div>
    </div>
  );
};

export default Slider; 