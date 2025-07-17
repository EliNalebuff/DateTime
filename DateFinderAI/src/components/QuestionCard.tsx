'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { QuestionCardProps } from '@/types';

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  children,
  className,
  required = false,
  isEmpty = false,
}) => {
  const isHighlighted = required && isEmpty;
  
  return (
    <div className={cn(
      'card card-hover transition-all duration-200',
      isHighlighted 
        ? 'border-2 border-red-300 bg-red-50 shadow-red-100' 
        : '',
      className
    )}>
      <div className="space-y-4">
        <h3 className={cn(
          'text-lg font-semibold leading-relaxed',
          isHighlighted ? 'text-red-700' : 'text-gray-800'
        )}>
          {question}
        </h3>
        <div className="space-y-3">
          {children}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard; 