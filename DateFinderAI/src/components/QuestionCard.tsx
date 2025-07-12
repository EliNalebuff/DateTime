'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { QuestionCardProps } from '@/types';

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  children,
  className,
}) => {
  return (
    <div className={cn('card card-hover', className)}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 leading-relaxed">
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