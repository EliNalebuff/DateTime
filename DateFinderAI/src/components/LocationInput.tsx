'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { LocationInputProps } from '@/types';
import { MapPin, Loader2 } from 'lucide-react';

const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChange,
  placeholder = 'Enter city, neighborhood, or address...',
  useLocationButton = true,
  required = false,
  isEmpty = false,
}) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch location suggestions
  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const locationSuggestions = data.map((item: any) => {
          // Extract city, state, country for cleaner display
          const address = item.address || {};
          const city = address.city || address.town || address.village || address.hamlet;
          const state = address.state;
          const country = address.country;
          
          if (city && state && country === 'United States') {
            return `${city}, ${state}`;
          } else if (city && country) {
            return `${city}, ${country}`;
          } else {
            return item.display_name.split(',').slice(0, 3).join(', ');
          }
        }).filter((item: string, index: number, array: string[]) => 
          array.indexOf(item) === index // Remove duplicates
        );
        
        setSuggestions(locationSuggestions);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Handle input change with debounced search
  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    setShowSuggestions(true);
    
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Debounce the search
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Handle input blur
  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for suggestion clicks
    setTimeout(() => {
      setShowSuggestions(false);
    }, 150);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

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
      
      // Reverse geocode to get city name
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
        );
        
        if (response.ok) {
          const data = await response.json();
          const city = data.address?.city || data.address?.town || data.address?.village || 
                     data.address?.hamlet || data.display_name?.split(',')[0] || 
                     `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          onChange(city);
        } else {
          // Fallback to coordinates if reverse geocoding fails
          const locationString = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          onChange(locationString);
        }
      } catch (error) {
        console.error('Error reverse geocoding:', error);
        const locationString = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        onChange(locationString);
      }
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
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className={`${required && isEmpty ? 'form-input-required' : 'form-input'} pr-12`}
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
        
        {/* Suggestions Dropdown */}
        {showSuggestions && (suggestions.length > 0 || isLoadingSuggestions) && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {isLoadingSuggestions ? (
              <div className="px-4 py-3 text-gray-500 text-sm flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading suggestions...
              </div>
            ) : (
              suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{suggestion}</span>
                  </div>
                </button>
              ))
            )}
          </div>
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