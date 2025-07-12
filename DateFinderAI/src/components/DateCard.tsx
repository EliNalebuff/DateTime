'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { DateCardProps } from '@/types';
import { Clock, MapPin, DollarSign, Heart } from 'lucide-react';

const DateCard: React.FC<DateCardProps> = ({
  date,
  selected = false,
  onSelect,
  showSelection = true,
  className,
}) => {
  const handleClick = () => {
    if (onSelect) {
      onSelect(date.id);
    }
  };

  return (
    <div
      className={cn(
        'card cursor-pointer transition-all duration-300',
        {
          'ring-2 ring-primary-500 border-primary-500': selected,
          'hover:shadow-xl transform hover:-translate-y-1': !selected,
        },
        className
      )}
      onClick={handleClick}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              {date.title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {date.description}
            </p>
          </div>
          {showSelection && (
            <div className={cn(
              'ml-4 flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-200',
              {
                'border-primary-500 bg-primary-500': selected,
                'border-gray-300': !selected,
              }
            )}>
              {selected && (
                <Heart className="w-3 h-3 text-white m-0.5" fill="currentColor" />
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{date.location}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{date.duration}</span>
            </div>
            <div className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4" />
              <span>{date.cost}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {date.vibe.map((v, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary-50 text-primary-600 rounded-full text-xs font-medium"
              >
                {v}
              </span>
            ))}
          </div>

          <div className="flex items-center space-x-4 text-xs text-gray-500">
            {date.includesFood && (
              <span className="flex items-center">
                🍽️ Food included
              </span>
            )}
            {date.includesDrinks && (
              <span className="flex items-center">
                🍷 Drinks included
              </span>
            )}
            <span className="flex items-center">
              {date.indoor ? '🏠 Indoor' : '🌤️ Outdoor'}
            </span>
            <span className="flex items-center">
              {date.public ? '👥 Public' : '🔒 Private'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateCard; 