"use client";

import { useState } from "react";
import { LocationInput } from "@/components/Calculator/LocationInput";
import { EnhancedLocationInput } from "@/components/Calculator/EnhancedLocationInput";
import { POPULAR_CITIES, DEFAULT_CITY } from "@/constants/popularCities";

export function LocationDemo() {
  // State for original LocationInput
  const [originalLocation, setOriginalLocation] = useState("New York, NY");
  const [originalCoords, setOriginalCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // State for enhanced LocationInput
  const [enhancedLocation, setEnhancedLocation] = useState("New York, NY");
  const [enhancedCoords, setEnhancedCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [enhancedTimezone, setEnhancedTimezone] = useState<string | null>(null);

  const handleOriginalLocationChange = (location: string) => {
    setOriginalLocation(location);
  };

  const handleOriginalCoordinatesUpdate = (coords: {
    latitude: number;
    longitude: number;
  }) => {
    setOriginalCoords(coords);
  };

  const handleEnhancedLocationChange = (location: string) => {
    setEnhancedLocation(location);
  };

  const handleEnhancedCoordinatesUpdate = (coords: {
    latitude: number;
    longitude: number;
  }) => {
    setEnhancedCoords(coords);
  };

  const handleEnhancedTimezoneChange = (timezone: string) => {
    setEnhancedTimezone(timezone);
  };

  return (
    <div className="space-y-8">
      {/* Feature Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          ✨ New Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl mb-2">🏙️</div>
            <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-1">
              Popular Cities
            </h3>
            <p className="text-sm text-purple-600 dark:text-purple-400">
              Quick access to London, Tokyo, and Sydney
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold text-green-800 dark:text-green-300 mb-1">
              Instant Results
            </h3>
            <p className="text-sm text-green-600 dark:text-green-400">
              Pre-configured coordinates and timezones
            </p>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
              Smart Display
            </h3>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Buttons only show when needed
            </p>
          </div>
        </div>
      </div>

      {/* Popular Cities Reference */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          🌍 Available Cities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-medium text-gray-800 dark:text-gray-200">
              {DEFAULT_CITY.displayName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {DEFAULT_CITY.latitude.toFixed(4)}, {DEFAULT_CITY.longitude.toFixed(4)}
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              {DEFAULT_CITY.timezone}
            </p>
          </div>
          {POPULAR_CITIES.map((city) => (
            <div key={city.name} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-800 dark:text-gray-200">
                {city.displayName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {city.latitude.toFixed(4)}, {city.longitude.toFixed(4)}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                {city.timezone}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Original LocationInput */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            📍 Original Location Input
          </h2>
          <div className="space-y-4">
            <LocationInput
              defaultLocation={originalLocation}
              onLocationChange={handleOriginalLocationChange}
              onUseCurrentLocation={handleOriginalCoordinatesUpdate}
            />
            
            {/* Display current state */}
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current State:
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Location:</strong> {originalLocation}
              </p>
              {originalCoords && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Coordinates:</strong> {originalCoords.latitude.toFixed(4)}, {originalCoords.longitude.toFixed(4)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced LocationInput */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            ✨ Enhanced Location Input
          </h2>
          <div className="space-y-4">
            <EnhancedLocationInput
              defaultLocation={enhancedLocation}
              onLocationChange={handleEnhancedLocationChange}
              onUseCurrentLocation={handleEnhancedCoordinatesUpdate}
              onTimezoneChange={handleEnhancedTimezoneChange}
            />
            
            {/* Display current state */}
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current State:
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Location:</strong> {enhancedLocation}
              </p>
              {enhancedCoords && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Coordinates:</strong> {enhancedCoords.latitude.toFixed(4)}, {enhancedCoords.longitude.toFixed(4)}
                </p>
              )}
              {enhancedTimezone && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  <strong>Timezone:</strong> {enhancedTimezone} ⚡
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          📖 How to Use
        </h2>
        <div className="space-y-3 text-gray-600 dark:text-gray-400">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-sm font-medium">
              1
            </span>
            <p>
              <strong>Quick Cities:</strong> Click on London, Tokyo, or Sydney buttons for instant location switching with pre-configured timezones.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-sm font-medium">
              2
            </span>
            <p>
              <strong>Smart Display:</strong> Quick city buttons only appear when you're not already in one of those cities.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-sm font-medium">
              3
            </span>
            <p>
              <strong>No API Delays:</strong> Popular cities use pre-configured data, so there's no waiting for timezone API calls.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-sm font-medium">
              4
            </span>
            <p>
              <strong>Full Compatibility:</strong> All existing features (search, autocomplete, GPS) work exactly the same.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}