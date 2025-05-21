'use client';

import { useState, useEffect } from 'react';
import { DateProvider, useDateContext } from '@/contexts/DateContext';
import { usePlanetaryHours } from '@/hooks/usePlanetaryHours';
import { LocationInput } from '@/components/Calculator/LocationInput';
import { DateTimeInput } from '@/components/Calculator/DateTimeInput';
import { CurrentHourDisplay } from '@/components/Calculator/CurrentHourDisplay';
import { WeekNavigation } from '@/components/Calculator/WeekNavigation';
import { HoursList } from '@/components/Calculator/HoursList';
import { TimeFormatToggle } from '@/components/Calculator/TimeFormatToggle';
import { HoursListSkeleton } from '@/components/Skeleton/HoursListSkeleton';
import { CurrentHourSkeleton } from '@/components/Skeleton/CurrentHourSkeleton';
// import { JsonLd } from '@/components/SEO/JsonLd'; // JSON-LD will be handled by page.tsx metadata or a dedicated component if complex
// import { getWebSiteSchema, getFAQPageSchema } from '@/utils/seo/jsonld'; // Ditto
import { Breadcrumb } from '@/components/SEO/Breadcrumb'; 
import { Section } from '@/components/semantic/Section';
import { timeZoneService } from '@/services/TimeZoneService'; // For initial formatting, if needed before context is fully ready
import { formatInTimeZone as formatInTimeZoneDirect } from 'date-fns-tz'; // Direct import for specific cases
import { subDays } from 'date-fns';

interface Coordinates {
  latitude: number;
  longitude: number;
  source: 'browser' | 'input' | 'geocode' | 'autocomplete'; // Make sure this matches LocationInput's expectations if different
  address?: string;
}

// Combine Calculator and CalculatorContent logic here
function CalculatorCore() {
  const { selectedDate, timezone, setSelectedDate, setTimezone, formatDate } = useDateContext();
  
  const [location, setLocation] = useState('New York, NY');
  const [coordinates, setCoordinates] = useState<Coordinates>({
    latitude: 40.7128,
    longitude: -74.0060,
    source: 'input'
  });
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('24h');
  const [isTimezoneUpdating, setIsTimezoneUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'day' | 'night'>('day');

  const {
    planetaryHoursRaw,
    currentHour,
    daytimeHours,
    nighttimeHours,
    isLoading: isLoadingHours,
    error: hoursError,
    calculate
  } = usePlanetaryHours(timeFormat);

  const loading = isLoadingHours || isTimezoneUpdating;

  // ---- EFFECTS ----
  useEffect(() => {
    if (currentHour) {
      const sunrise = planetaryHoursRaw?.sunriseLocal;
      const isBeforeSunrise = sunrise ? (new Date() < sunrise) : false;
      if (isBeforeSunrise) {
        setActiveTab('day');
      } else {
        setActiveTab(currentHour.type === 'night' ? 'night' : 'day');
      }
    }
  }, [currentHour, planetaryHoursRaw]);

  useEffect(() => {
    const fetchTimezoneAndCalculate = async () => {
      if (coordinates) {
        setIsTimezoneUpdating(true);
        try {
          const timestamp = Math.floor(Date.now() / 1000);
          const response = await fetch(
            `/api/maps/timezone?location=${coordinates.latitude},${coordinates.longitude}&timestamp=${timestamp}`
          );
          const data = await response.json();
          let newTimezone = timezone; // Default to current timezone if API fails
          if (data.status === 'OK') {
            newTimezone = data.timeZoneId;
            setTimezone(data.timeZoneId);
          }
          calculate(coordinates.latitude, coordinates.longitude, selectedDate, newTimezone);
        } catch (error) {
          console.error('Error fetching timezone:', error);
          // Calculate with current/default timezone on error
          calculate(coordinates.latitude, coordinates.longitude, selectedDate, timezone);
        } finally {
          setIsTimezoneUpdating(false);
        }
      }
    };
    fetchTimezoneAndCalculate();
  }, [coordinates, calculate, selectedDate, setTimezone, timezone]); // Added timezone to dependencies

  useEffect(() => {
    // This effect recalculates if ONLY the date changes, and timezone is stable.
    // The main calculation is now triggered by the coordinates change effect (fetchTimezoneAndCalculate).
    if (!isTimezoneUpdating && coordinates && timezone && !isLoadingHours) { // Ensure not already loading hours
      // console.log('[DateChange Only Effect] Recalculating for date change');
      // calculate(coordinates.latitude, coordinates.longitude, selectedDate, timezone);
      // This might be redundant if fetchTimezoneAndCalculate covers it. Let's monitor.
    }
  }, [selectedDate]); // Removed calculate, coordinates, timezone, isLoadingHours to be more specific

  // ---- HANDLERS ----
  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation);
    // Coordinate update will trigger timezone fetch and calculation
  };

  const handleCoordinatesUpdate = (coords: { latitude: number; longitude: number; source?: string; address?: string }) => {
    // setIsTimezoneUpdating(true); // This will be set by the effect that fetches timezone
    setCoordinates({
      latitude: coords.latitude,
      longitude: coords.longitude,
      source: (coords.source as Coordinates['source']) || 'input',
      address: coords.address
    });
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date); 
    // The effect watching `selectedDate` along with stable timezone/coords should trigger re-calc.
  };

  const handleTimeFormatChange = (format: '12h' | '24h') => {
    setTimeFormat(format);
    // Re-calculation will happen due to usePlanetaryHours dependency on timeFormat
  };

  // ---- RENDER LOGIC ----
  const planetColors = {
    Sun: 'text-planet-sun',
    Moon: 'text-planet-moon',
    Mercury: 'text-planet-mercury',
    Venus: 'text-planet-venus',
    Mars: 'text-planet-mars',
    Jupiter: 'text-planet-jupiter',
    Saturn: 'text-planet-saturn'
  };

  const planetSymbols = {
    Sun: '☉',
    Moon: '☽',
    Mercury: '☿',
    Venus: '♀',
    Mars: '♂',
    Jupiter: '♃',
    Saturn: '♄'
  };

  const breadcrumbItems = [
    { name: 'Home', url: '/' } // Assuming this is the root page
  ];
  
  // Determine date for display in CurrentHourDisplay (pre-sunrise logic)
  const sunriseLocal = planetaryHoursRaw?.sunriseLocal;
  let ephemDate = selectedDate;
  let isBeforeSunriseToday = false;
  if (sunriseLocal) {
    const nowInSelectedTimezone = timeZoneService.utcToZonedTime(new Date(), timezone);
    if (nowInSelectedTimezone < sunriseLocal && 
        formatInTimeZoneDirect(nowInSelectedTimezone, timezone, 'yyyy-MM-dd') === formatInTimeZoneDirect(sunriseLocal, timezone, 'yyyy-MM-dd')) {
      ephemDate = subDays(selectedDate, 1);
      isBeforeSunriseToday = true;
    }
  }
  const selectedDayRuler = planetaryHoursRaw?.dayRuler;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <Breadcrumb items={breadcrumbItems} />
      
      <Section aria-labelledby="calculator-settings">
        <h1 id="calculator-settings" className="sr-only">Calculator Settings</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <LocationInput 
            defaultLocation={location}
            onLocationChange={handleLocationChange}
            onUseCurrentLocation={handleCoordinatesUpdate}
          />
          <DateTimeInput 
            selectedDate={selectedDate} 
            onDateChange={handleDateChange} 
            defaultDate={formatDate(selectedDate, 'medium')} // Or use formatDateWithPattern from context
          />
        </div>
      </Section>

      <WeekNavigation planetColors={planetColors} onDaySelect={handleDateChange} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-4">
          <Section aria-labelledby="current-hour-heading">
            <h2 id="current-hour-heading" className="sr-only">Current Planetary Hour</h2>
            {loading ? (
              <CurrentHourSkeleton />
            ) : (
              <CurrentHourDisplay 
                currentHour={currentHour}
                planetColors={planetColors}
                planetSymbols={planetSymbols}
                dayRuler={selectedDayRuler}
                sunriseTime={sunriseLocal} // Pass localized sunrise time
                timeFormat={timeFormat}
                beforeSunrise={isBeforeSunriseToday}
              />
            )}
          </Section>
          <TimeFormatToggle format={timeFormat} onFormatChange={handleTimeFormatChange} />
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex border-b border-gray-200 mb-4">
            <button 
              onClick={() => setActiveTab('day')}
              className={`py-2 px-4 font-medium text-sm transition-colors duration-150 ${activeTab === 'day' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}>
              Day Hours
            </button>
            <button 
              onClick={() => setActiveTab('night')}
              className={`py-2 px-4 font-medium text-sm transition-colors duration-150 ${activeTab === 'night' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}>
              Night Hours
            </button>
          </div>

          {loading ? (
            <HoursListSkeleton title={activeTab === 'day' ? "Loading Daytime Hours..." : "Loading Nighttime Hours..."} />
          ) : activeTab === 'day' ? (
            <HoursList 
              title="Daytime Planetary Hours"
              hours={daytimeHours}
              planetColors={planetColors}
              planetSymbols={planetSymbols}
              titleColor="text-yellow-600"
            />
          ) : (
            <HoursList 
              title="Nighttime Planetary Hours"
              hours={nighttimeHours}
              planetColors={planetColors}
              planetSymbols={planetSymbols}
              titleColor="text-indigo-600"
            />
          )}
          {hoursError && <p className="text-red-500 mt-4">Error calculating hours: {hoursError}</p>}
        </div>
      </div>
    </div>
  );
}

export default function CalculatorPageClient() {
  const initialDate = new Date();
  // Attempt to get user's timezone; fallback to a common one if not available or on server initially.
  // This is tricky SSR vs Client. For now, stick to a default, context can allow user to change.
  const initialTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';

  return (
    <DateProvider initialDate={initialDate} initialTimezone={initialTimezone}>
      <CalculatorCore />
    </DateProvider>
  );
} 