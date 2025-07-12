'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { LocationInputProps } from '@/types';
import { MapPin, Loader2 } from 'lucide-react';

const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChange,
  placeholder = 'Enter location...',
  useLocationButton = true,
}) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        });
      });

      const { latitude, longitude } = position.coords;
      
      // For now, just use coordinates. In a real app, you'd reverse geocode these
      const locationString = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      onChange(locationString);
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Unable to get your location. Please enter it manually.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="form-input pr-12"
        />
        {useLocationButton && (
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={isGettingLocation}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-primary-500 transition-colors"
            title="Use current location"
          >
            {isGettingLocation ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      {useLocationButton && (
        <p className="text-xs text-gray-500">
          Click the location icon to use your current location
        </p>
      )}
    </div>
  );
};

export default LocationInput; 