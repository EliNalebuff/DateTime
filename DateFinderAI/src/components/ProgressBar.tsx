'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ProgressBarProps } from '@/types';

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  className,
}) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className={cn('progress-bar', className)}>
      <div 
        className="progress-fill"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ProgressBar; 