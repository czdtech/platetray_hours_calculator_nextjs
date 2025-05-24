"use client";

import { useState } from "react";
import { EnhancedLocationInput } from "@/components/Calculator/EnhancedLocationInput";
import { LocationButtonTest } from "@/components/Calculator/LocationButtonTest";

export default function TestLocationPage() {
  const [location, setLocation] = useState("New York, NY");
  const [coordinates, setCoordinates] = useState({
    latitude: 40.7128,
    longitude: -74.006,
  });
  const [timezone, setTimezone] = useState("America/New_York");

  const handleLocationChange = (newLocation: string) => {
    console.log("Location changed:", newLocation);
    setLocation(newLocation);
  };

  const handleCoordinatesUpdate = (coords: {
    latitude: number;
    longitude: number;
  }) => {
    console.log("Coordinates updated:", coords);
    setCoordinates(coords);
  };

  const handleTimezoneChange = (newTimezone: string) => {
    console.log("Timezone changed:", newTimezone);
    setTimezone(newTimezone);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-8">Location Input Test</h1>
      
      {/* Debug component */}
      <LocationButtonTest />
      
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
        <EnhancedLocationInput
          defaultLocation={location}
          onLocationChange={handleLocationChange}
          onUseCurrentLocation={handleCoordinatesUpdate}
          onTimezoneChange={handleTimezoneChange}
        />
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Current State:</h3>
          <p><strong>Location:</strong> {location}</p>
          <p><strong>Coordinates:</strong> {coordinates.latitude}, {coordinates.longitude}</p>
          <p><strong>Timezone:</strong> {timezone}</p>
        </div>
      </div>
    </div>
  );
}