'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinnerProps } from '@/types';

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className={cn(
        'animate-spin rounded-full border-2 border-gray-200 border-t-primary-500',
        sizes[size]
      )} />
    </div>
  );
};

export default LoadingSpinner; 