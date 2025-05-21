'use client';
import { useState, useCallback, useEffect, useRef, memo } from 'react';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import debounce from 'lodash/debounce';

interface LocationInputProps {
  defaultLocation: string;
  onLocationChange: (location: string) => void;
  onUseCurrentLocation: (coords: { latitude: number; longitude: number }) => void;
}

interface Coordinates {
  latitude: number;
  longitude: number;
  source: 'browser' | 'input' | 'geocode' | 'prediction';
  address?: string;
}

interface AddressComponent { long_name: string; types: string[] }

// Interface for predictions from our /api/maps/autocomplete
interface ApiAutocompletePrediction {
  description: string;
  place_id: string;
}

// 模块级标志：单页面会话期间只获取一次session token
let hasFetchedSessionToken = false;

function LocationInputComponent({
  defaultLocation,
  onLocationChange,
  onUseCurrentLocation
}: LocationInputProps) {
  useEffect(() => {
    console.log('🗺️ [LocationInput] 位置输入组件挂载');
    console.log(`📍 [LocationInput] 默认位置: ${defaultLocation}`);

    if (!hasFetchedSessionToken) {
      hasFetchedSessionToken = true;
      fetchNewSessionToken();
    }
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetchingToken, setIsFetchingToken] = useState(false);

  const [searchInput, setSearchInput] = useState(defaultLocation);
  const [currentCoords, setCurrentCoords] = useState<Coordinates | null>(null);
  const [predictions, setPredictions] = useState<ApiAutocompletePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [activePredictionIndex, setActivePredictionIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const sessionTokenRef = useRef<string | undefined>(undefined); // Stores string token from backend
  const lastRequestIdRef = useRef(0);
  const activeAutocompleteRequestControllerRef = useRef<AbortController | null>(null); // Added to manage active fetch controller

  // State for our backend service readiness (session token, etc.)
  const [isLocationServiceReady, setIsLocationServiceReady] = useState(false); // Start as false until first token is fetched
  const [locationServiceError, setLocationServiceError] = useState<string | null>(null);

  const fetchNewSessionToken = async () => {
    console.log('🎫 [Session] 开始获取新的会话令牌');
    setIsFetchingToken(true);
    try {
      const response = await fetch('/api/maps/session/start');
      const data = await response.json();

      console.log('🔍 [Session] API响应:', data);  // 添加调试日志

      if (data.sessionToken) {  // 修改这里，使用sessionToken而不是token
        console.log('✅ [Session] 成功获取会话令牌');
        sessionTokenRef.current = data.sessionToken;
        setIsLocationServiceReady(true);
      } else {
        console.error('❌ [Session] API响应中没有找到sessionToken:', data);
        throw new Error('Session token not found in response');
      }
    } catch (error) {
      console.error('❌ [Session] 获取会话令牌失败:', error);
      setLocationServiceError('Failed to initialize location service');
    } finally {
      setIsFetchingToken(false);
    }
  };

  const isCoordinates = (input: string): { isValid: boolean; coords?: { lat: number; lng: number } } => {
    const coordsRegex = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
    if (coordsRegex.test(input)) {
      const [lat, lng] = input.split(',').map(Number);
      return { isValid: true, coords: { lat, lng } };
    }
    return { isValid: false };
  };

  const geocodeAddress = useCallback(async (address: string) => {
    setError(null); // Clear previous errors
    try {
      const coordCheck = isCoordinates(address);
      if (coordCheck.isValid && coordCheck.coords) {
        const coords = {
          latitude: coordCheck.coords.lat,
          longitude: coordCheck.coords.lng,
          source: 'input' as const
        };
        setCurrentCoords(coords);
        onUseCurrentLocation(coords);
        return;
      }

      const response = await fetch(`/api/maps/geocode?address=${encodeURIComponent(address)}`);
      let data;
      try {
        data = await response.json();
      } catch {
        if (!response.ok) throw new Error(`Geocoding request via proxy failed with status ${response.status}`);
        throw new Error('Failed to parse API response from geocodeAddress');
      }

      if (!response.ok) throw new Error(data.error || data.details || `Geocoding request via proxy failed with status ${response.status}`);

      if (data.status === 'OK' && data.results[0]) {
        const result = data.results[0];
        const { lat, lng } = result.geometry.location;
        const coordsData = {
          latitude: lat,
          longitude: lng,
          source: 'geocode' as const,
          address: result.formatted_address
        };
        setCurrentCoords(coordsData);
        onUseCurrentLocation(coordsData);
        onLocationChange(result.formatted_address);
        setSearchInput(result.formatted_address);
      } else {
        //setError(`Location not found: ${data.status}`);
        throw new Error(`Location not found or API error: ${data.status}`);
      }
    } catch (_e: unknown) {
      const error = _e instanceof Error ? _e : new Error('Unknown error');
      setError(error.message || 'Could not find location. Please try a different search term.');
    }
  }, [onLocationChange, onUseCurrentLocation]);

  const handleSelectPrediction = useCallback(async (prediction: ApiAutocompletePrediction) => {
    setError(null);
    setSearchInput(prediction.description);
    setPredictions([]);
    setShowPredictions(false);
    setActivePredictionIndex(-1);

    if (!prediction.place_id) {
      console.warn('Place ID missing from prediction, falling back to geocodeAddress.');
      geocodeAddress(prediction.description);
      return;
    }

    const currentTokenForDetails = sessionTokenRef.current;
    sessionTokenRef.current = undefined; // Crucial: Invalidate/clear token for next session

    try {
      let apiUrl = `/api/maps/placeDetails?placeid=${encodeURIComponent(prediction.place_id)}`;
      if (currentTokenForDetails) {
        apiUrl += `&sessiontoken=${encodeURIComponent(currentTokenForDetails)}`;
      }

      const response = await fetch(apiUrl);
      const placeDetails = await response.json();

      if (!response.ok) {
        throw new Error(placeDetails.error || placeDetails.details || 'Failed to fetch place details via proxy');
      }

      if (placeDetails.geometry && placeDetails.geometry.location) {
        const { lat, lng } = placeDetails.geometry.location;
        const coords = {
          latitude: lat,
          longitude: lng,
          source: 'prediction' as const,
          address: placeDetails.formatted_address || prediction.description
        };

        let displayAddress = placeDetails.formatted_address || prediction.description;
        const components = placeDetails.address_components as AddressComponent[];
        const city = components.find(c => c.types.includes('locality'))?.long_name || '';
        const state = components.find(c => c.types.includes('administrative_area_level_1'))?.long_name || '';
        const country = components.find(c => c.types.includes('country'))?.long_name || '';
        const customFormattedAddress = [city, state, country].filter(Boolean).join(', ');
        if (customFormattedAddress) displayAddress = customFormattedAddress;

        setSearchInput(displayAddress);
        onLocationChange(displayAddress);
        setCurrentCoords(coords);
        onUseCurrentLocation({ latitude: coords.latitude, longitude: coords.longitude });
      } else {
        console.error('Place details from proxy missing geometry/location:', placeDetails);
        //setError('Could not retrieve location details. Please try again.');
        throw new Error('Could not retrieve location details from proxy.');
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      console.error('Error fetching place details via proxy:', error);
      setError(error.message || 'Error fetching place details.');
      // Fallback to geocoding the description on error
      // geocodeAddress(prediction.description); // Or just show error
    }
  }, [onLocationChange, onUseCurrentLocation, geocodeAddress]);

  const debouncedFetchSuggestions = useCallback(
    debounce(async (inputValue: string, token: string | undefined, requestId: number) => {
      if (!isLocationServiceReady) {
        setError(locationServiceError || 'Location service is not ready for suggestions.');
        return;
      }
      if (!token) {
        console.warn("Attempted to fetch suggestions without a session token.");
        return;
      }

      // Ensure we only process the latest request intention.
      if (requestId !== lastRequestIdRef.current) {
        // console.log(`Debounced function for requestId ${requestId} (${inputValue}) superseded by ${lastRequestIdRef.current}. Not fetching.`);
        return;
      }

      // Abort any previous in-flight autocomplete request.
      if (activeAutocompleteRequestControllerRef.current) {
        activeAutocompleteRequestControllerRef.current.abort();
        // console.log('Aborted previous autocomplete request.');
      }

      const controller = new AbortController();
      activeAutocompleteRequestControllerRef.current = controller;

      const apiUrl = `/api/maps/autocomplete?input=${encodeURIComponent(inputValue)}&sessiontoken=${encodeURIComponent(token)}`;

      try {
        // console.log(`Fetching suggestions for requestId ${requestId} (${inputValue})`);
        const response = await fetch(apiUrl, { signal: controller.signal });

        // If this request was not aborted by a subsequent one, clear its controller from active ref.
        if (activeAutocompleteRequestControllerRef.current === controller) {
          activeAutocompleteRequestControllerRef.current = null;
        }

        const data = await response.json(); // Attempt to parse JSON even if aborted, to handle server errors gracefully if any.

        if (!response.ok) { // Check response.ok after attempting to parse, as server might send error details in JSON.
          throw new Error(data.error || data.details || `Failed to fetch suggestions via proxy (status: ${response.status})`);
        }

        if (data.predictions) {
          setPredictions(data.predictions);
          setShowPredictions(true);
          setActivePredictionIndex(-1);
        } else {
          setPredictions([]);
          // Don't hide predictions if there are simply no results for a valid query
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          // console.log(`Fetch aborted for requestId ${requestId} (${inputValue})`);
          return; // Expected behavior, do not set error or predictions
        }
        console.error('Error fetching suggestions via proxy:', error);
        setError('Could not fetch suggestions. Please try again.');
        setPredictions([]);
        setShowPredictions(false);
      }
    }, 300), // 300ms debounce delay
    [isLocationServiceReady, locationServiceError] // Dependencies for the useCallback itself
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchInput(value);
    setError(null);

    if (value.trim() === '') {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    if (!sessionTokenRef.current) {
      console.warn('No session token available for autocomplete. Waiting for token or an error to be set.');
      //setError('Location service initializing, please wait or try again shortly.'); // User-facing message
      // Attempt to fetch a new token if one isn't available and not already fetching.
      if (!isFetchingToken && !locationServiceError) {
        fetchNewSessionToken();
      }
      return; // Don't proceed if token is missing
    }
    // Increment request ID for each new input change to manage debounced calls
    const newRequestId = lastRequestIdRef.current + 1;
    lastRequestIdRef.current = newRequestId;
    debouncedFetchSuggestions(value, sessionTokenRef.current, newRequestId);
  };

  const handleGetCurrentLocation = () => {
    setIsLoading(true);
    setError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const coords = { latitude, longitude, source: 'browser' as const };
          setCurrentCoords(coords);

          try {
            const response = await fetch(`/api/maps/geocode?latlng=${latitude},${longitude}`);
            const data = await response.json();

            if (data.status === 'OK' && data.results[0]) {
              const address = data.results[0].formatted_address;
              setSearchInput(address);
              onLocationChange(address);
            } else {
              // Fallback to raw coordinates if geocoding fails
              const fallbackAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
              setSearchInput(fallbackAddress);
              onLocationChange(fallbackAddress);
            }
          } catch (e) {
            console.error("Error reverse geocoding browser location:", e);
            const fallbackAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            setSearchInput(fallbackAddress);
            onLocationChange(fallbackAddress);
            // setError("Could not determine address from current location.");
          }

          onUseCurrentLocation(coords); // This passes the coords up
          setIsLoading(false);
        },
        (geoError) => {
          console.error('Geolocation error:', geoError);
          setError(getGeolocationErrorMessage(geoError.code));
          setIsLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setIsLoading(false);
    }
  };

  const getGeolocationErrorMessage = (code: number) => {
    switch (code) {
      case 1: return 'Location access denied. Please enable it in your browser settings.';
      case 2: return 'Location information is unavailable. Please check your connection.';
      case 3: return 'Location request timed out. Please try again.';
      default: return 'An unknown error occurred while getting your location.';
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (activePredictionIndex >= 0 && predictions[activePredictionIndex]) {
      handleSelectPrediction(predictions[activePredictionIndex]);
    } else if (searchInput.trim()) {
      geocodeAddress(searchInput.trim());
      setShowPredictions(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (showPredictions && predictions.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActivePredictionIndex(prev => (prev + 1) % predictions.length);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActivePredictionIndex(prev => (prev - 1 + predictions.length) % predictions.length);
      } else if (event.key === 'Enter') {
        if (activePredictionIndex >= 0) {
          event.preventDefault(); // Prevent form submission if a prediction is active
          handleSelectPrediction(predictions[activePredictionIndex]);
        } else {
          // Allow form submission to trigger geocodeAddress if Enter is pressed without active prediction
        }
      } else if (event.key === 'Escape') {
        setShowPredictions(false);
        setActivePredictionIndex(-1);
      }
    }
  };

  // Handle clicks outside of the input and prediction list to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        const predictionsList = document.getElementById('predictions-list');
        if (predictionsList && !predictionsList.contains(event.target as Node)) {
          setShowPredictions(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Autofocus on mount if it's a non-touch device (heuristic for desktop)
  // And if the input is empty (e.g. not pre-filled by a previous value)
  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouchDevice && inputRef.current && searchInput === '') {
      // inputRef.current.focus();
    }
  }, [searchInput]);

  const getCoordinatesMessage = () => {
    if (!currentCoords) return '';
    const lat = currentCoords.latitude.toFixed(4);
    const lng = currentCoords.longitude.toFixed(4);
    let sourceMsg = '';
    switch (currentCoords.source) {
      case 'browser': sourceMsg = ' (from browser location)'; break;
      case 'input': sourceMsg = ' (from typed coordinates)'; break;
      case 'geocode': sourceMsg = ' (geocoded)'; break;
      case 'prediction': sourceMsg = ' (from selection)'; break;
    }
    return `Using coordinates: ${lat}, ${lng}${sourceMsg}`;
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <div ref={inputRef} className="relative flex-grow">
          <input
            type="text"
            value={searchInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => predictions.length > 0 && setShowPredictions(true)} // Show on focus if there are existing predictions
            placeholder="Enter city, address, or coordinates"
            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            aria-autocomplete="list"
            aria-expanded={showPredictions}
            aria-controls="predictions-list"
            aria-activedescendant={activePredictionIndex >= 0 ? `prediction-${activePredictionIndex}` : undefined}
          />
          {showPredictions && predictions.length > 0 && (
            <ul
              id="predictions-list"
              className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
              role="listbox"
            >
              {predictions.map((prediction, index) => (
                <li
                  key={prediction.place_id || index} // Fallback to index if place_id is missing
                  id={`prediction-${index}`}
                  role="option"
                  aria-selected={activePredictionIndex === index}
                  className={`px-3 py-2 cursor-pointer hover:bg-purple-50 text-sm text-gray-700 ${
                    activePredictionIndex === index ? 'bg-purple-100' : ''
                  }`}
                  onClick={() => handleSelectPrediction(prediction)}
                  onMouseEnter={() => setActivePredictionIndex(index)} // Allow mouse hover to also set active
                >
                  {prediction.description}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLoading || isFetchingToken}
          className="p-2 text-purple-600 hover:text-purple-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-150 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          title="Use my current location"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <MapPin className="h-5 w-5" />
          )}
        </button>
      </form>
      {error && (
        <div className="mt-2 flex items-center text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {locationServiceError && (
        <div className="mt-2 flex items-center text-sm text-yellow-700 bg-yellow-50 p-2 rounded-md border border-yellow-300">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>Location Service Error: {locationServiceError}. Some features might be limited.</span>
        </div>
      )}
      {/* <p className="mt-1 text-xs text-gray-500 italic">{getCoordinatesMessage()}</p> */}
    </div>
  );
}

export const LocationInput = memo(LocationInputComponent); 