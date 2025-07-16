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
  const [newRange, setNewRange] = useState<{
    date: string;
    startHour: string;
    startMinute: string;
    startPeriod: 'AM' | 'PM';
    endHour: string;
    endMinute: string;
    endPeriod: 'AM' | 'PM';
  }>({
    date: '',
    startHour: '',
    startMinute: '00',
    startPeriod: 'AM',
    endHour: '',
    endMinute: '00',
    endPeriod: 'AM',
  });

  // Get the next 7 days starting from today
  const getNextWeekDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const formatDateForDisplay = (dateStr: string) => {
    // Parse the date as local date to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTimeForDisplay = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const generateDisplayText = (date: string, startTime: string, endTime: string) => {
    if (!date || !startTime || !endTime) return '';
    
    const dateDisplay = formatDateForDisplay(date);
    const startTimeDisplay = formatTimeForDisplay(startTime);
    const endTimeDisplay = formatTimeForDisplay(endTime);
    
    return `${dateDisplay} from ${startTimeDisplay} to ${endTimeDisplay}`;
  };

  // Generate hour options (1-12)
  const generateHourOptions = () => {
    const options = [];
    for (let i = 1; i <= 12; i++) {
      options.push({
        value: i.toString(),
        label: i.toString()
      });
    }
    return options;
  };

  // Generate minute options (0, 15, 30, 45)
  const generateMinuteOptions = () => {
    return [
      { value: '00', label: '00' },
      { value: '15', label: '15' },
      { value: '30', label: '30' },
      { value: '45', label: '45' }
    ];
  };

  // Convert 12-hour time to 24-hour format
  const convertTo24Hour = (hour: string, minute: string, period: 'AM' | 'PM') => {
    if (!hour) return '';
    
    let hour24 = parseInt(hour);
    if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    } else if (period === 'PM' && hour24 !== 12) {
      hour24 = hour24 + 12;
    }
    return `${hour24.toString().padStart(2, '0')}:${minute}`;
  };

  const addTimeRange = () => {
    const startTime = convertTo24Hour(newRange.startHour, newRange.startMinute, newRange.startPeriod);
    const endTime = convertTo24Hour(newRange.endHour, newRange.endMinute, newRange.endPeriod);
    
    if (!newRange.date || !startTime || !endTime) return;

    const range: TimeRange = {
      id: `range-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: newRange.date,
      startTime,
      endTime,
      startPeriod: newRange.startPeriod,
      endPeriod: newRange.endPeriod,
      displayText: generateDisplayText(newRange.date, startTime, endTime),
    };

    onChange([...selectedRanges, range]);
    setNewRange({
      date: '',
      startHour: '',
      startMinute: '00',
      startPeriod: 'AM',
      endHour: '',
      endMinute: '00',
      endPeriod: 'AM',
    });
  };

  const removeTimeRange = (id: string) => {
    onChange(selectedRanges.filter(range => range.id !== id));
  };

  const nextWeekDates = getNextWeekDates();
  const hourOptions = generateHourOptions();
  const minuteOptions = generateMinuteOptions();

  const isFormValid = newRange.date && newRange.startHour && newRange.endHour;

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
            <select
              value={newRange.date}
              onChange={(e) => setNewRange(prev => ({ ...prev, date: e.target.value }))}
              className="form-input"
            >
              <option value="">Select a date</option>
              {nextWeekDates.map((date) => (
                <option key={date.toISOString()} value={date.toISOString().split('T')[0]}>
                  {date.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </option>
              ))}
            </select>
          </div>

          {/* Time Range Selection */}
          <div className="grid grid-cols-2 gap-4">
            {/* Start Time */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">From:</label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={newRange.startHour}
                  onChange={(e) => setNewRange(prev => ({ ...prev, startHour: e.target.value }))}
                  className="form-input text-sm"
                >
                  <option value="">Hour</option>
                  {hourOptions.map((option) => (
                    <option key={`start-hour-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                <select
                  value={newRange.startMinute}
                  onChange={(e) => setNewRange(prev => ({ ...prev, startMinute: e.target.value }))}
                  className="form-input text-sm"
                >
                  {minuteOptions.map((option) => (
                    <option key={`start-minute-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                <select
                  value={newRange.startPeriod}
                  onChange={(e) => setNewRange(prev => ({ ...prev, startPeriod: e.target.value as 'AM' | 'PM' }))}
                  className="form-input text-sm"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">To:</label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={newRange.endHour}
                  onChange={(e) => setNewRange(prev => ({ ...prev, endHour: e.target.value }))}
                  className="form-input text-sm"
                >
                  <option value="">Hour</option>
                  {hourOptions.map((option) => (
                    <option key={`end-hour-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                <select
                  value={newRange.endMinute}
                  onChange={(e) => setNewRange(prev => ({ ...prev, endMinute: e.target.value }))}
                  className="form-input text-sm"
                >
                  {minuteOptions.map((option) => (
                    <option key={`end-minute-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                <select
                  value={newRange.endPeriod}
                  onChange={(e) => setNewRange(prev => ({ ...prev, endPeriod: e.target.value as 'AM' | 'PM' }))}
                  className="form-input text-sm"
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
            disabled={!isFormValid}
            className={cn(
              'flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all',
              isFormValid
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