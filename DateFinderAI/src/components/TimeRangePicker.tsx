'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { TimeRange } from '@/types';
import { Plus, X } from 'lucide-react';

interface TimeRangePickerProps {
  selectedRanges: TimeRange[];
  onChange: (ranges: TimeRange[]) => void;
  maxRanges?: number;
}

const TimeRangePicker: React.FC<TimeRangePickerProps> = ({
  selectedRanges,
  onChange,
  maxRanges = 5,
}) => {
  const [newRange, setNewRange] = useState<Partial<TimeRange>>({
    date: '',
    startTime: '',
    endTime: '',
    startPeriod: 'PM',
    endPeriod: 'PM',
  });

  const formatDateForDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const generateDisplayText = (range: Partial<TimeRange>) => {
    if (!range.date || !range.startTime || !range.endTime) return '';
    
    const dateDisplay = formatDateForDisplay(range.date);
    return `${dateDisplay} from ${range.startTime} ${range.startPeriod} to ${range.endTime} ${range.endPeriod}`;
  };

  const addTimeRange = () => {
    if (!newRange.date || !newRange.startTime || !newRange.endTime) return;

    const range: TimeRange = {
      id: `range-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: newRange.date,
      startTime: newRange.startTime,
      endTime: newRange.endTime,
      startPeriod: newRange.startPeriod || 'PM',
      endPeriod: newRange.endPeriod || 'PM',
      displayText: generateDisplayText(newRange),
    };

    onChange([...selectedRanges, range]);
    setNewRange({
      date: '',
      startTime: '',
      endTime: '',
      startPeriod: 'PM',
      endPeriod: 'PM',
    });
  };

  const removeTimeRange = (id: string) => {
    onChange(selectedRanges.filter(range => range.id !== id));
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-4">
      {/* Selected Ranges */}
      {selectedRanges.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Selected time ranges:</p>
          {selectedRanges.map((range) => (
            <div
              key={range.id}
              className="flex items-center justify-between p-3 bg-primary-50 border border-primary-200 rounded-lg"
            >
              <span className="text-sm text-primary-700">{range.displayText}</span>
              <button
                type="button"
                onClick={() => removeTimeRange(range.id)}
                className="text-primary-500 hover:text-primary-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Range */}
      {selectedRanges.length < maxRanges && (
        <div className="p-4 border border-gray-200 rounded-lg space-y-4">
          <p className="text-sm font-medium text-gray-700">
            Add a time range ({selectedRanges.length}/{maxRanges}):
          </p>
          
          {/* Date Selection */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Date:</label>
            <input
              type="date"
              value={newRange.date}
              min={getMinDate()}
              onChange={(e) => setNewRange(prev => ({ ...prev, date: e.target.value }))}
              className="form-input"
            />
          </div>

          {/* Time Range Selection */}
          <div className="grid grid-cols-2 gap-4">
            {/* Start Time */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">From:</label>
              <div className="flex space-x-2">
                <input
                  type="time"
                  value={newRange.startTime}
                  onChange={(e) => setNewRange(prev => ({ ...prev, startTime: e.target.value }))}
                  className="form-input flex-1"
                />
                <select
                  value={newRange.startPeriod}
                  onChange={(e) => setNewRange(prev => ({ ...prev, startPeriod: e.target.value as 'AM' | 'PM' }))}
                  className="form-input w-20"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">To:</label>
              <div className="flex space-x-2">
                <input
                  type="time"
                  value={newRange.endTime}
                  onChange={(e) => setNewRange(prev => ({ ...prev, endTime: e.target.value }))}
                  className="form-input flex-1"
                />
                <select
                  value={newRange.endPeriod}
                  onChange={(e) => setNewRange(prev => ({ ...prev, endPeriod: e.target.value as 'AM' | 'PM' }))}
                  className="form-input w-20"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </div>

          {/* Add Button */}
          <button
            type="button"
            onClick={addTimeRange}
            disabled={!newRange.date || !newRange.startTime || !newRange.endTime}
            className={cn(
              'flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all',
              newRange.date && newRange.startTime && newRange.endTime
                ? 'border-primary-500 bg-primary-50 text-primary-700 hover:bg-primary-100'
                : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
            )}
          >
            <Plus className="h-4 w-4" />
            <span>Add Time Range</span>
          </button>
        </div>
      )}

      {selectedRanges.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          Add your available time ranges to continue
        </p>
      )}
    </div>
  );
};

export default TimeRangePicker; 