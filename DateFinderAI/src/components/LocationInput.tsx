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
}) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Detect if we're on mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

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

  // Improved reverse geocoding for current location
  const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=10`
      );
      
      if (response.ok) {
        const data = await response.json();
        const address = data.address || {};
        
        // Try to extract meaningful location info in order of preference
        const city = address.city || address.town || address.village || address.hamlet || address.municipality;
        const state = address.state || address.region;
        const country = address.country;
        
        // Return the most appropriate format
        if (city && state && country === 'United States') {
          return `${city}, ${state}`;
        } else if (city && country) {
          return `${city}, ${country}`;
        } else if (address.suburb && state && country === 'United States') {
          return `${address.suburb}, ${state}`;
        } else if (data.display_name) {
          // Extract first two meaningful parts from display name
          const parts = data.display_name.split(',').map((part: string) => part.trim());
          return parts.slice(0, 2).join(', ');
        }
      }
      
      // If all else fails, format coordinates nicely
      return `Location: ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `Location: ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
    }
  };

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
          timeout: 15000, // Increased timeout for mobile
          maximumAge: 300000,
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Use improved reverse geocoding
      const locationString = await reverseGeocode(latitude, longitude);
      onChange(locationString);
      
    } catch (error) {
      console.error('Error getting location:', error);
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert('Location access was denied. Please enable location permissions and try again.');
            break;
          case error.POSITION_UNAVAILABLE:
            alert('Location information is unavailable. Please enter your location manually.');
            break;
          case error.TIMEOUT:
            alert('Location request timed out. Please try again or enter your location manually.');
            break;
          default:
            alert('An error occurred while getting your location. Please enter it manually.');
            break;
        }
      } else {
        alert('Unable to get your location. Please enter it manually.');
      }
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
        
        {/* Suggestions Dropdown - Mobile Optimized */}
        {showSuggestions && (suggestions.length > 0 || isLoadingSuggestions) && (
          <div 
            ref={suggestionsRef}
            className={cn(
              "bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50",
              isMobile 
                ? "fixed left-4 right-4 top-auto mobile-suggestions"
                : "absolute w-full mt-1"
            )}
            style={isMobile ? { 
              top: inputRef.current ? inputRef.current.getBoundingClientRect().bottom + window.scrollY + 4 : 'auto' 
            } : {}}
          >
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
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none 
                             border-b border-gray-100 last:border-b-0 active:bg-gray-100"
                >
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700 break-words">{suggestion}</span>
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