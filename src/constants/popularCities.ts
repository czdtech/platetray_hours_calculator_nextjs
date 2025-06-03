// Popular cities with pre-configured coordinates and timezone data
export interface PopularCity {
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  timezone: string;
  country: string;
}

// Most popular cities worldwide (excluding New York which is the default)
export const POPULAR_CITIES: PopularCity[] = [
  {
    name: "London",
    displayName: "London, UK",
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: "Europe/London",
    country: "United Kingdom"
  },
  {
    name: "Dubai",
    displayName: "Dubai, UAE",
    latitude: 25.2048,
    longitude: 55.2708,
    timezone: "Asia/Dubai",
    country: "United Arab Emirates"
  },
  {
    name: "Sydney",
    displayName: "Sydney, AU",
    latitude: -33.8688,
    longitude: 151.2093,
    timezone: "Australia/Sydney",
    country: "Australia"
  }
];

// Default city (New York)
export const DEFAULT_CITY: PopularCity = {
  name: "New York",
  displayName: "New York, NY",
  latitude: 40.7128,
  longitude: -74.006,
  timezone: "America/New_York",
  country: "United States"
};