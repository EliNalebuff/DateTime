'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { StepHeaderProps } from '@/types';
import ProgressBar from './ProgressBar';

const StepHeader: React.FC<StepHeaderProps> = ({
  currentStep,
  totalSteps,
  title,
  description,
}) => {
  return (
    <div className="mb-8">
      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      <div className="text-center space-y-2">
        <div className="text-sm text-gray-500 font-medium">
          Step {currentStep} of {totalSteps}
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          {title}
        </h2>
        {description && (
          <p className="text-gray-600 max-w-md mx-auto">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default StepHeader; 