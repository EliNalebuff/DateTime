'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ToggleProps } from '@/types';

const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
}) => {
  return (
    <div className="flex items-start space-x-3">
      <button
        type="button"
        className={cn(
          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          {
            'bg-primary-500': checked,
            'bg-gray-200': !checked,
          }
        )}
        onClick={() => onChange(!checked)}
      >
        <span className="sr-only">Toggle</span>
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out',
            {
              'translate-x-5': checked,
              'translate-x-0': !checked,
            }
          )}
        />
      </button>
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <label className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => onChange(!checked)}>
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Toggle; 