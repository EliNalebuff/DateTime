'use client';

import { Calendar, Clock, Check } from 'lucide-react';
import { TimeSlot } from '@/types';

interface TimeSlotSelectorProps {
  proposedTimes: TimeSlot[];
  selectedTimeSlots: string[];
  onChange: (selectedIds: string[]) => void;
}

export default function TimeSlotSelector({ proposedTimes, selectedTimeSlots, onChange }: TimeSlotSelectorProps) {
  const handleToggleSlot = (slotId: string) => {
    if (selectedTimeSlots.includes(slotId)) {
      onChange(selectedTimeSlots.filter(id => id !== slotId));
    } else {
      onChange([...selectedTimeSlots, slotId]);
    }
  };

  if (proposedTimes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No time slots have been proposed yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 mb-4">
        Select all the times that work for you from the options below:
      </p>
      
      {proposedTimes.map((slot) => {
        const isSelected = selectedTimeSlots.includes(slot.id);
        
        return (
          <button
            key={slot.id}
            onClick={() => handleToggleSlot(slot.id)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              isSelected
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  isSelected ? 'bg-primary-100' : 'bg-gray-100'
                }`}>
                  <Calendar className={`h-4 w-4 ${
                    isSelected ? 'text-primary-600' : 'text-gray-500'
                  }`} />
                </div>
                <div>
                  <p className={`font-medium ${
                    isSelected ? 'text-primary-800' : 'text-gray-800'
                  }`}>
                    {slot.displayText}
                  </p>
                  <p className={`text-sm ${
                    isSelected ? 'text-primary-600' : 'text-gray-500'
                  }`}>
                    {slot.date} at {slot.time}
                  </p>
                </div>
              </div>
              
              {isSelected && (
                <div className="p-1 bg-primary-500 rounded-full">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          </button>
        );
      })}
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Selected:</strong> {selectedTimeSlots.length} of {proposedTimes.length} time slots
        </p>
        {selectedTimeSlots.length === 0 && (
          <p className="text-sm text-gray-500 mt-1">
            Please select at least one time slot that works for you.
          </p>
        )}
      </div>
    </div>
  );
} 