"use client";
import { useState, useCallback, useEffect, useRef, memo, useMemo } from "react";
import { MapPin, Loader2, AlertCircle } from "lucide-react";
import debounce from "lodash/debounce";
import { POPULAR_CITIES, DEFAULT_CITY, type PopularCity } from "@/constants/popularCities";
import { createLogger } from "@/utils/logger";

interface LocationInputProps {
  defaultLocation: string;
  onLocationChange: (location: string) => void;
  onUseCurrentLocation: (coords: {
    latitude: number;
    longitude: number;
    source?: string;
    address?: string;
  }) => void;
  onTimezoneChange?: (timezone: string) => void; // New prop for direct timezone updates
}

interface Coordinates {
  latitude: number;
  longitude: number;
  source: "browser" | "input" | "geocode" | "prediction" | "preset";
  address?: string;
}

interface AddressComponent {
  long_name: string;
  types: string[];
}

// Interface for predictions from our /api/maps/autocomplete
interface ApiAutocompletePrediction {
  description: string;
  place_id: string;
}

// 模块级标志：单页面会话期间只获取一次session token
let hasFetchedSessionToken = false;

function EnhancedLocationInputComponent({
  defaultLocation,
  onLocationChange,
  onUseCurrentLocation,
  onTimezoneChange,
}: LocationInputProps) {
  const logger = createLogger('LocationInput');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetchingToken, setIsFetchingToken] = useState(false);

  const [searchInput, setSearchInput] = useState(defaultLocation);
  const [currentCoords, setCurrentCoords] = useState<Coordinates | null>(null);
  const [predictions, setPredictions] = useState<ApiAutocompletePrediction[]>(
    [],
  );
  const [showPredictions, setShowPredictions] = useState(false);
  const [activePredictionIndex, setActivePredictionIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const sessionTokenRef = useRef<string | undefined>(undefined);
  const lastRequestIdRef = useRef(0);
  const activeAutocompleteRequestControllerRef = useRef<AbortController | null>(
    null,
  );

  // State for our backend service readiness (session token, etc.)
  const [isLocationServiceReady, setIsLocationServiceReady] = useState(false);
  const [locationServiceError, setLocationServiceError] = useState<
    string | null
  >(null);

  // Check if current location matches any popular city
  const _isCurrentLocationPopular = useMemo(() => {
    // Show buttons when no coordinates are set yet
    if (!currentCoords) {
      return false;
    }
    
    // Check if current location matches any popular city (within reasonable tolerance)
    const tolerance = 0.1; // degrees
    return POPULAR_CITIES.some(city => 
      Math.abs(city.latitude - currentCoords.latitude) < tolerance &&
      Math.abs(city.longitude - currentCoords.longitude) < tolerance
    ) || (
      Math.abs(DEFAULT_CITY.latitude - currentCoords.latitude) < tolerance &&
      Math.abs(DEFAULT_CITY.longitude - currentCoords.longitude) < tolerance
    );
  }, [currentCoords]);

  const fetchNewSessionToken = useCallback(async () => {
    logger.debug("🎫 开始获取新的会话令牌");
    setIsFetchingToken(true);
    try {
      const response = await fetch("/api/maps/session/start");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        logger.error("❌ 非JSON响应:", text);
        throw new Error("Server returned non-JSON response");
      }

      const data = await response.json();
      logger.debug("🔍 API响应:", data);

      if (data.sessionToken) {
        logger.info("✅ 成功获取会话令牌");
        sessionTokenRef.current = data.sessionToken;
        setIsLocationServiceReady(true);
      } else {
        logger.error("❌ API响应中没有找到sessionToken:", data);
        throw new Error("Session token not found in response");
      }
    } catch (error) {
      logger.error("❌ 获取会话令牌失败:", error);
      setLocationServiceError("Failed to initialize location service");
    } finally {
      setIsFetchingToken(false);
    }
  }, [logger]);

  useEffect(() => {
    logger.debug("🗺️ 位置输入组件挂载");
    logger.debug(`📍 默认位置: ${defaultLocation}`);

    // 如果是默认位置（New York, NY），跳过会话令牌获取
    if (defaultLocation === "New York, NY") {
      logger.debug("🏠 使用默认位置，跳过会话令牌获取");
      return;
    }

    if (!hasFetchedSessionToken) {
      hasFetchedSessionToken = true;
      fetchNewSessionToken();
    }
  }, [defaultLocation, fetchNewSessionToken, logger]);

  const isCoordinates = (
    input: string,
  ): { isValid: boolean; coords?: { lat: number; lng: number } } => {
    const coordsRegex =
      /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
    if (coordsRegex.test(input)) {
      const [lat, lng] = input.split(",").map(Number);
      return { isValid: true, coords: { lat, lng } };
    }
    return { isValid: false };
  };

  // Handle popular city selection
  const handlePopularCitySelect = useCallback((city: PopularCity) => {
    setError(null);
    setSearchInput(city.displayName);
    setPredictions([]);
    setShowPredictions(false);
    setActivePredictionIndex(-1);

    const coords = {
      latitude: city.latitude,
      longitude: city.longitude,
      source: "preset" as const,
      address: city.displayName,
    };

    setCurrentCoords(coords);
    onLocationChange(city.displayName);
    onUseCurrentLocation({
      latitude: city.latitude,
      longitude: city.longitude,
      source: "preset",
      address: city.displayName,
    });

    // If timezone change callback is provided, use it for immediate timezone update
    if (onTimezoneChange) {
      onTimezoneChange(city.timezone);
    }

    logger.info(`🏙️ 选择城市: ${city.displayName}`, {
      coordinates: `${city.latitude}, ${city.longitude}`,
      timezone: city.timezone,
    });
  }, [onLocationChange, onUseCurrentLocation, onTimezoneChange]);

  const geocodeAddress = useCallback(
    async (address: string) => {
      setError(null);
      try {
        const coordCheck = isCoordinates(address);
        if (coordCheck.isValid && coordCheck.coords) {
          const coords = {
            latitude: coordCheck.coords.lat,
            longitude: coordCheck.coords.lng,
            source: "input" as const,
          };
          setCurrentCoords(coords);
          onUseCurrentLocation(coords);
          return;
        }

        const response = await fetch(
          `/api/maps/geocode?address=${encodeURIComponent(address)}`,
        );
        let data;
        try {
          data = await response.json();
        } catch {
          if (!response.ok)
            throw new Error(
              `Geocoding request via proxy failed with status ${response.status}`,
            );
          throw new Error("Failed to parse API response from geocodeAddress");
        }

        if (!response.ok)
          throw new Error(
            data.error ||
            data.details ||
            `Geocoding request via proxy failed with status ${response.status}`,
          );

        if (data.status === "OK" && data.results[0]) {
          const result = data.results[0];
          const { lat, lng } = result.geometry.location;
          const coordsData = {
            latitude: lat,
            longitude: lng,
            source: "geocode" as const,
            address: result.formatted_address,
          };
          setCurrentCoords(coordsData);
          onUseCurrentLocation(coordsData);
          onLocationChange(result.formatted_address);
          setSearchInput(result.formatted_address);
        } else {
          throw new Error(`Location not found or API error: ${data.status}`);
        }
      } catch (_e: unknown) {
        const error = _e instanceof Error ? _e : new Error("Unknown error");
        setError(
          error.message ||
          "Could not find location. Please try a different search term.",
        );
      }
    },
    [onLocationChange, onUseCurrentLocation],
  );

  const handleSelectPrediction = useCallback(
    async (prediction: ApiAutocompletePrediction) => {
      setError(null);
      setSearchInput(prediction.description);
      setPredictions([]);
      setShowPredictions(false);
      setActivePredictionIndex(-1);

      if (!prediction.place_id) {
        logger.warn("Place ID missing from prediction, falling back to geocodeAddress.");
        geocodeAddress(prediction.description);
        return;
      }

      const currentTokenForDetails = sessionTokenRef.current;
      sessionTokenRef.current = undefined;

      try {
        let apiUrl = `/api/maps/placeDetails?placeid=${encodeURIComponent(prediction.place_id)}`;
        if (currentTokenForDetails) {
          apiUrl += `&sessiontoken=${encodeURIComponent(currentTokenForDetails)}`;
        }

        const response = await fetch(apiUrl);
        const placeDetails = await response.json();

        if (!response.ok) {
          throw new Error(
            placeDetails.error ||
            placeDetails.details ||
            "Failed to fetch place details via proxy",
          );
        }

        if (placeDetails.geometry && placeDetails.geometry.location) {
          const { lat, lng } = placeDetails.geometry.location;
          const coords = {
            latitude: lat,
            longitude: lng,
            source: "prediction" as const,
            address: placeDetails.formatted_address || prediction.description,
          };

          let displayAddress =
            placeDetails.formatted_address || prediction.description;
          const components =
            placeDetails.address_components as AddressComponent[];
          const city =
            components.find((c) => c.types.includes("locality"))?.long_name ||
            "";
          const state =
            components.find((c) =>
              c.types.includes("administrative_area_level_1"),
            )?.long_name || "";
          const country =
            components.find((c) => c.types.includes("country"))?.long_name ||
            "";
          const customFormattedAddress = [city, state, country]
            .filter(Boolean)
            .join(", ");
          if (customFormattedAddress) displayAddress = customFormattedAddress;

          setSearchInput(displayAddress);
          onLocationChange(displayAddress);
          setCurrentCoords(coords);
          onUseCurrentLocation({
            latitude: coords.latitude,
            longitude: coords.longitude,
          });
        } else {
          logger.error("Place details from proxy missing geometry/location:", placeDetails);
          throw new Error("Could not retrieve location details from proxy.");
        }
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        logger.error("Error fetching place details via proxy:", error);
        setError(error.message || "Error fetching place details.");
      }
    },
    [onLocationChange, onUseCurrentLocation, geocodeAddress],
  );

  const fetchSuggestions = useCallback(
    async (
      inputValue: string,
      token: string | undefined,
      requestId: number,
    ) => {
      if (!isLocationServiceReady) {
        setError(
          locationServiceError ||
          "Location service is not ready for suggestions.",
        );
        return;
      }
      if (!token) {
        logger.warn("Attempted to fetch suggestions without a session token.");
        return;
      }

      if (requestId !== lastRequestIdRef.current) {
        return;
      }

      if (activeAutocompleteRequestControllerRef.current) {
        activeAutocompleteRequestControllerRef.current.abort();
      }

      const controller = new AbortController();
      activeAutocompleteRequestControllerRef.current = controller;

      const apiUrl = `/api/maps/autocomplete?input=${encodeURIComponent(inputValue)}&sessiontoken=${encodeURIComponent(token)}`;

      try {
        const response = await fetch(apiUrl, { signal: controller.signal });

        if (activeAutocompleteRequestControllerRef.current === controller) {
          activeAutocompleteRequestControllerRef.current = null;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
            data.details ||
            `Failed to fetch suggestions via proxy (status: ${response.status})`,
          );
        }

        if (requestId === lastRequestIdRef.current) {
          setPredictions(data.predictions || []);
          setShowPredictions(data.predictions && data.predictions.length > 0);
          setActivePredictionIndex(-1);
          setError(null);
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          // Aborted request, no action needed
        } else if (requestId === lastRequestIdRef.current) {
          logger.error("fetchAutocompleteSuggestions (via proxy) error:", err);
          setPredictions([]);
          setShowPredictions(false);
          const error =
            err instanceof Error ? err : new Error("Unknown error");
          setError(error.message || "Could not fetch location suggestions.");
        }
        if (activeAutocompleteRequestControllerRef.current === controller) {
          activeAutocompleteRequestControllerRef.current = null;
        }
      }
    },
    [isLocationServiceReady, locationServiceError],
  );

  const debouncedFetchSuggestions = useMemo(
    () => debounce(fetchSuggestions, 150),
    [fetchSuggestions],
  );

  const handleInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchInput(value);
      setError(null);

      if (value.trim().length < 3) {
        setPredictions([]);
        setShowPredictions(false);
        setActivePredictionIndex(-1);
        if (activeAutocompleteRequestControllerRef.current) {
          activeAutocompleteRequestControllerRef.current.abort();
          activeAutocompleteRequestControllerRef.current = null;
        }
        return;
      }

      const currentRequestId = ++lastRequestIdRef.current;

      if (value.trim() === "" || isCoordinates(value).isValid) {
        setPredictions([]);
        setShowPredictions(false);
        return;
      }

      if (!sessionTokenRef.current && !isFetchingToken) {
        await fetchNewSessionToken();
      }

      if (sessionTokenRef.current) {
        debouncedFetchSuggestions(
          value,
          sessionTokenRef.current,
          currentRequestId,
        );
      } else {
        setError(
          locationServiceError ||
          "Location suggestions unavailable: session not ready.",
        );
        setPredictions([]);
        setShowPredictions(false);
      }
    },
    [
      fetchNewSessionToken,
      debouncedFetchSuggestions,
      locationServiceError,
      isFetchingToken,
    ],
  );

  const handleGetLocation = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setIsLoading(false);
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          });
        },
      );
      const { latitude, longitude } = position.coords;

      const response = await fetch(
        `/api/maps/geocode?latlng=${latitude},${longitude}`,
      );
      let data;
      try {
        data = await response.json();
      } catch {
        if (!response.ok)
          throw new Error(
            `Reverse geocoding via proxy failed with status ${response.status}`,
          );
        throw new Error("Failed to parse API response from handleGetLocation");
      }
      if (!response.ok)
        throw new Error(
          data.error ||
          data.details ||
          `Reverse geocoding via proxy failed with status ${response.status}`,
        );

      if (data.status === "OK" && data.results[0]) {
        const place = data.results[0];
        const addressComponents = place.address_components;
        const addrComps = addressComponents as AddressComponent[];
        const city =
          addrComps.find((c) => c.types.includes("locality"))?.long_name || "";
        const state =
          addrComps.find((c) => c.types.includes("administrative_area_level_1"))
            ?.long_name || "";
        const country =
          addrComps.find((c) => c.types.includes("country"))?.long_name || "";
        const formattedAddress = [city, state, country]
          .filter(Boolean)
          .join(", ");

        setSearchInput(formattedAddress);
        onLocationChange(formattedAddress);
        setCurrentCoords({
          latitude,
          longitude,
          source: "browser" as const,
          address: formattedAddress,
        });
        onUseCurrentLocation({ latitude, longitude });
      } else {
        throw new Error(
          `No results found for current location: ${data.status}`,
        );
      }
    } catch (err: unknown) {
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("Please allow location access or enter location manually");
            break;
          case err.POSITION_UNAVAILABLE:
            setError(
              "Location information is unavailable. Please try entering location manually",
            );
            break;
          case err.TIMEOUT:
            setError(
              "Location request timed out. Please try again or enter location manually",
            );
            break;
          default:
            setError(
              "An unknown error occurred. Please try entering location manually",
            );
        }
      } else {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(
          error.message ||
          "Failed to get location. Please try entering location manually",
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [onLocationChange, onUseCurrentLocation]);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (showPredictions && predictions.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setActivePredictionIndex(
            (prevIndex) => (prevIndex + 1) % predictions.length,
          );
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setActivePredictionIndex(
            (prevIndex) =>
              (prevIndex - 1 + predictions.length) % predictions.length,
          );
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (
            activePredictionIndex >= 0 &&
            predictions[activePredictionIndex]
          ) {
            handleSelectPrediction(predictions[activePredictionIndex]);
          } else if (searchInput.trim()) {
            geocodeAddress(searchInput);
            setShowPredictions(false);
            setPredictions([]);
            setActivePredictionIndex(-1);
            debouncedFetchSuggestions.cancel();
            if (activeAutocompleteRequestControllerRef.current) {
              activeAutocompleteRequestControllerRef.current.abort();
              activeAutocompleteRequestControllerRef.current = null;
            }
            lastRequestIdRef.current++;
          }
        } else if (e.key === "Escape") {
          e.preventDefault();
          setShowPredictions(false);
          setActivePredictionIndex(-1);
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (searchInput.trim()) {
          geocodeAddress(searchInput);
          setShowPredictions(false);
          setPredictions([]);
          setActivePredictionIndex(-1);
          debouncedFetchSuggestions.cancel();
          if (activeAutocompleteRequestControllerRef.current) {
            activeAutocompleteRequestControllerRef.current.abort();
            activeAutocompleteRequestControllerRef.current = null;
          }
          lastRequestIdRef.current++;
        }
      }
    },
    [
      showPredictions,
      predictions,
      activePredictionIndex,
      handleSelectPrediction,
      searchInput,
      geocodeAddress,
      debouncedFetchSuggestions,
    ],
  );

  // Handle clicks outside of the input and prediction list to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        const predictionsList = document.getElementById("predictions-list");
        if (
          predictionsList &&
          !predictionsList.contains(event.target as Node)
        ) {
          setShowPredictions(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getCoordinatesMessage = () => {
    if (!currentCoords) return null;
    const lat = currentCoords.latitude.toFixed(4);
    const lng = currentCoords.longitude.toFixed(4);
    return `longitude: ${lng}, latitude: ${lat}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor="location"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Location
        </label>
        {/* Popular cities quick buttons - always show for easy access */}
        <div className="flex items-center gap-1">
          {POPULAR_CITIES.map((city) => (
            <button
              key={city.name}
              onClick={() => handlePopularCitySelect(city)}
              className="px-2.5 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 
                       bg-purple-50 dark:bg-purple-900/30 
                       hover:bg-purple-100 dark:hover:bg-purple-900/50 
                       rounded-md transition-all duration-200 
                       hover:scale-105 active:scale-95 
                       border border-purple-200 dark:border-purple-700
                       hover:shadow-md active:shadow-sm transform
                       focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              type="button"
              aria-label={`Switch to ${city.displayName}`}
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          id="location"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                   focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 
                   transition-all duration-200 pl-4 pr-10
                   placeholder:text-gray-500 dark:placeholder:text-gray-400"
          placeholder="Enter your location..."
          value={searchInput}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={() => {
            if (searchInput.trim() && predictions.length > 0)
              setShowPredictions(true);
            if (!sessionTokenRef.current && !isFetchingToken) {
              fetchNewSessionToken();
            }
          }}
          onBlur={() => {
            setTimeout(() => {
              if (
                document.activeElement &&
                inputRef.current &&
                !inputRef.current.parentElement?.contains(
                  document.activeElement,
                )
              ) {
                setShowPredictions(false);
              }
            }, 200);
          }}
          autoComplete="off"
        />
        {showPredictions && predictions.length > 0 && (
          <ul
            id="predictions-list"
            className="absolute z-10 w-full left-0 right-0 bg-white dark:bg-gray-800 
                     border border-gray-300 dark:border-gray-600 rounded-md shadow-lg mt-1 
                     max-h-60 overflow-y-auto"
            role="listbox"
            aria-activedescendant={
              activePredictionIndex >= 0
                ? `prediction-item-${activePredictionIndex}`
                : undefined
            }
          >
            {predictions.map((prediction, index) => (
              <li
                key={prediction.place_id || index}
                id={`prediction-item-${index}`}
                role="option"
                aria-selected={index === activePredictionIndex}
                className={`px-4 py-2 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/20 
                          ${index === activePredictionIndex ? "bg-purple-100 dark:bg-purple-900/20" : ""} 
                          text-sm truncate text-gray-900 dark:text-gray-100`}
                onMouseDown={() => handleSelectPrediction(prediction)}
              >
                {prediction.description}
              </li>
            ))}
            <li className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 text-right">
              Powered by Google
            </li>
          </ul>
        )}
        <button
          onClick={handleGetLocation}
          disabled={isLoading}
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 
                    ${isLoading ? "text-purple-400" : "text-gray-400 hover:text-purple-500 dark:text-gray-500 dark:hover:text-purple-400"} 
                    transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30 
                    rounded-full p-1 hover:scale-105 active:scale-95`}
          aria-label="Use current location"
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <MapPin size={18} />
          )}
        </button>
      </div>
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 mt-1 animate-fade-in flex items-center gap-2">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
      {currentCoords && !error && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 animate-fade-in">
          {getCoordinatesMessage()}
        </div>
      )}
    </div>
  );
}

export const EnhancedLocationInput = memo(EnhancedLocationInputComponent);