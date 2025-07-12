'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ErrorMessageProps } from '@/types';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  className,
}) => {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-4 p-8 bg-red-50 border border-red-200 rounded-xl',
      className
    )}>
      <AlertCircle className="h-12 w-12 text-red-500" />
      <div className="text-center">
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Something went wrong
        </h3>
        <p className="text-red-600 text-sm">
          {message}
        </p>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try again
        </Button>
      )}
    </div>
  );
};

export default ErrorMessage; 