'use client';

import { useState } from 'react';
import { Plus, X, Calendar, Clock } from 'lucide-react';
import { TimeSlot } from '@/types';

interface TimeSlotPickerProps {
  selectedSlots: TimeSlot[];
  onChange: (slots: TimeSlot[]) => void;
  maxSlots?: number;
}

export default function TimeSlotPicker({ selectedSlots, onChange, maxSlots = 5 }: TimeSlotPickerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSlot, setNewSlot] = useState({ date: '', time: '' });

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

  const formatDisplayText = (date: string, time: string): string => {
    const dateObj = new Date(date);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const monthDay = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    
    // Convert 24-hour time to 12-hour format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    
    return `${dayName}, ${monthDay} at ${displayHour}:${minutes} ${ampm}`;
  };

  // Generate time options with 15-minute increments
  const generateTimeOptions = () => {
    const options = [];
    
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0');
      const minutes = ['00', '15', '30', '45'];
      
      for (const minute of minutes) {
        const time24 = `${hour}:${minute}`;
        const hour12 = i === 0 ? 12 : i <= 12 ? i : i - 12;
        const ampm = i < 12 ? 'AM' : 'PM';
        const displayTime = `${hour12}:${minute} ${ampm}`;
        
        options.push({
          value: time24,
          label: displayTime
        });
      }
    }
    
    return options;
  };

  const addTimeSlot = () => {
    if (newSlot.date && newSlot.time && selectedSlots.length < maxSlots) {
      const id = `${newSlot.date}-${newSlot.time}`;
      const displayText = formatDisplayText(newSlot.date, newSlot.time);
      
      // Check if this slot already exists
      const exists = selectedSlots.some(slot => slot.id === id);
      if (!exists) {
        const timeSlot: TimeSlot = {
          id,
          date: newSlot.date,
          time: newSlot.time,
          displayText
        };
        
        onChange([...selectedSlots, timeSlot]);
        setNewSlot({ date: '', time: '' });
        setShowAddForm(false);
      }
    }
  };

  const removeTimeSlot = (id: string) => {
    onChange(selectedSlots.filter(slot => slot.id !== id));
  };

  const nextWeekDates = getNextWeekDates();
  const timeOptions = generateTimeOptions();

  return (
    <div className="space-y-4">
      {/* Selected Time Slots */}
      <div className="space-y-2">
        {selectedSlots.map((slot) => (
          <div
            key={slot.id}
            className="flex items-center justify-between p-3 bg-primary-50 border border-primary-200 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-800">
                {slot.displayText}
              </span>
            </div>
            <button
              onClick={() => removeTimeSlot(slot.id)}
              className="p-1 text-primary-600 hover:text-primary-800 hover:bg-primary-100 rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add New Time Slot */}
      {selectedSlots.length < maxSlots && (
        <div>
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors w-full"
            >
              <Plus className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Add another time slot ({selectedSlots.length}/{maxSlots})
              </span>
            </button>
          ) : (
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <select
                      value={newSlot.date}
                      onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time
                    </label>
                    <select
                      value={newSlot.time}
                      onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select a time</option>
                      {timeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={addTimeSlot}
                    disabled={!newSlot.date || !newSlot.time}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Time Slot</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewSlot({ date: '', time: '' });
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Helper Text */}
      <p className="text-sm text-gray-500">
        Select up to {maxSlots} specific times when you'd be available for this date. 
        Your partner will see these options and choose which ones work for them.
      </p>
    </div>
  );
} 