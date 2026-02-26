export interface City {
  slug: string;
  name: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timezone: string;
  population?: number;
  region: string;
  description: string;
}

export const cities: City[] = [
  {
    slug: "new-york",
    name: "New York",
    country: "United States",
    countryCode: "US",
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: "America/New_York",
    population: 8336817,
    region: "North America",
    description: "At 40°N latitude, New York experiences significant seasonal variation in planetary hour lengths — summer daytime hours stretch well beyond 60 minutes while winter ones shrink noticeably.",
  },
  {
    slug: "los-angeles",
    name: "Los Angeles",
    country: "United States",
    countryCode: "US",
    latitude: 34.0522,
    longitude: -118.2437,
    timezone: "America/Los_Angeles",
    population: 3979576,
    region: "North America",
    description: "Los Angeles sits at 34°N, giving it milder seasonal swings in planetary hour durations compared to cities farther north, with consistently pleasant day-night ratios.",
  },
  {
    slug: "london",
    name: "London",
    country: "United Kingdom",
    countryCode: "GB",
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: "Europe/London",
    population: 8982000,
    region: "Europe",
    description: "London's high latitude (51°N) creates dramatic seasonal contrasts — midsummer daytime planetary hours can exceed 80 minutes, while midwinter ones drop below 40 minutes.",
  },
  {
    slug: "manila",
    name: "Manila",
    country: "Philippines",
    countryCode: "PH",
    latitude: 14.5995,
    longitude: 120.9842,
    timezone: "Asia/Manila",
    population: 1780148,
    region: "Asia",
    description: "Near the equator at 14°N, Manila enjoys relatively consistent planetary hour lengths year-round, with daytime and nighttime hours staying close to 60 minutes each.",
  },
  {
    slug: "johannesburg",
    name: "Johannesburg",
    country: "South Africa",
    countryCode: "ZA",
    latitude: -26.2041,
    longitude: 28.0473,
    timezone: "Africa/Johannesburg",
    population: 5635127,
    region: "Africa",
    description: "In the Southern Hemisphere at 26°S, Johannesburg's planetary hours follow reversed seasonal patterns — longest daytime hours occur during December and January.",
  },
  {
    slug: "lagos",
    name: "Lagos",
    country: "Nigeria",
    countryCode: "NG",
    latitude: 6.5244,
    longitude: 3.3792,
    timezone: "Africa/Lagos",
    population: 15388000,
    region: "Africa",
    description: "Sitting just 6°N of the equator, Lagos has remarkably stable planetary hour durations throughout the year, making it one of the most consistent locations for planetary timing.",
  },
  {
    slug: "athens",
    name: "Athens",
    country: "Greece",
    countryCode: "GR",
    latitude: 37.9838,
    longitude: 23.7275,
    timezone: "Europe/Athens",
    population: 664046,
    region: "Europe",
    description: "The birthplace of Western astrology at 38°N, Athens is where the Chaldean planetary hour system was refined and popularized in the ancient Mediterranean world.",
  },
  {
    slug: "dubai",
    name: "Dubai",
    country: "United Arab Emirates",
    countryCode: "AE",
    latitude: 25.2048,
    longitude: 55.2708,
    timezone: "Asia/Dubai",
    population: 3331420,
    region: "Middle East",
    description: "At 25°N, Dubai's subtropical location produces moderately varying planetary hours, with the desert climate offering clear skies ideal for astronomical observation.",
  },
  {
    slug: "sydney",
    name: "Sydney",
    country: "Australia",
    countryCode: "AU",
    latitude: -33.8688,
    longitude: 151.2093,
    timezone: "Australia/Sydney",
    population: 5312163,
    region: "Oceania",
    description: "Sydney at 33°S mirrors the seasonal planetary hour patterns of cities like Los Angeles but in reverse — its longest daytime planetary hours fall in December.",
  },
  {
    slug: "mumbai",
    name: "Mumbai",
    country: "India",
    countryCode: "IN",
    latitude: 19.0760,
    longitude: 72.8777,
    timezone: "Asia/Kolkata",
    population: 12442373,
    region: "Asia",
    description: "Mumbai at 19°N enjoys relatively balanced planetary hours, with India's rich Vedic astrology tradition making planetary timing an integral part of daily life.",
  },
  {
    slug: "new-delhi",
    name: "New Delhi",
    country: "India",
    countryCode: "IN",
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: "Asia/Kolkata",
    population: 16787941,
    region: "Asia",
    description: "At 28°N, New Delhi shows moderate seasonal variation in planetary hours, and the city's deep roots in Jyotish (Vedic astrology) make planetary timing culturally significant.",
  },
  {
    slug: "chicago",
    name: "Chicago",
    country: "United States",
    countryCode: "US",
    latitude: 41.8781,
    longitude: -87.6298,
    timezone: "America/Chicago",
    population: 2693976,
    region: "North America",
    description: "Chicago at 41°N experiences wide seasonal variation — summer daytime planetary hours last over 70 minutes while winter ones compress to around 45 minutes.",
  },
  {
    slug: "houston",
    name: "Houston",
    country: "United States",
    countryCode: "US",
    latitude: 29.7604,
    longitude: -95.3698,
    timezone: "America/Chicago",
    population: 2304580,
    region: "North America",
    description: "Houston's 29°N latitude gives it more moderate planetary hour variation than northern US cities, with day-night ratios staying relatively balanced year-round.",
  },
  {
    slug: "toronto",
    name: "Toronto",
    country: "Canada",
    countryCode: "CA",
    latitude: 43.6532,
    longitude: -79.3832,
    timezone: "America/Toronto",
    population: 2731571,
    region: "North America",
    description: "At 43°N, Toronto's planetary hours show pronounced seasonal extremes — its northerly position creates some of the longest summer daytime hours in North America.",
  },
  {
    slug: "paris",
    name: "Paris",
    country: "France",
    countryCode: "FR",
    latitude: 48.8566,
    longitude: 2.3522,
    timezone: "Europe/Paris",
    population: 2161000,
    region: "Europe",
    description: "Paris at 48°N has significant seasonal planetary hour variation, and the city's historical connection to occult traditions makes it a center of planetary hour practice in Europe.",
  },
  {
    slug: "berlin",
    name: "Berlin",
    country: "Germany",
    countryCode: "DE",
    latitude: 52.5200,
    longitude: 13.4050,
    timezone: "Europe/Berlin",
    population: 3644826,
    region: "Europe",
    description: "Berlin's high latitude at 52°N creates extreme seasonal contrasts in planetary hours — summer days are very long while winter daytime hours are remarkably short.",
  },
  {
    slug: "tokyo",
    name: "Tokyo",
    country: "Japan",
    countryCode: "JP",
    latitude: 35.6762,
    longitude: 139.6503,
    timezone: "Asia/Tokyo",
    population: 13960000,
    region: "Asia",
    description: "Tokyo at 35°N experiences moderate seasonal planetary hour variation, and Japan's onmyōdō tradition has historically incorporated planetary timing concepts.",
  },
  {
    slug: "mexico-city",
    name: "Mexico City",
    country: "Mexico",
    countryCode: "MX",
    latitude: 19.4326,
    longitude: -99.1332,
    timezone: "America/Mexico_City",
    population: 9209944,
    region: "North America",
    description: "Mexico City at 19°N enjoys relatively consistent planetary hour lengths throughout the year, with its tropical latitude keeping day-night ratios stable.",
  },
  {
    slug: "sao-paulo",
    name: "São Paulo",
    country: "Brazil",
    countryCode: "BR",
    latitude: -23.5505,
    longitude: -46.6333,
    timezone: "America/Sao_Paulo",
    population: 12325232,
    region: "South America",
    description: "São Paulo at 23°S sits near the Tropic of Capricorn, giving it reversed seasonal patterns from the Northern Hemisphere with its longest daytime planetary hours around the December solstice.",
  },
  {
    slug: "cairo",
    name: "Cairo",
    country: "Egypt",
    countryCode: "EG",
    latitude: 30.0444,
    longitude: 31.2357,
    timezone: "Africa/Cairo",
    population: 10100166,
    region: "Africa",
    description: "Cairo at 30°N carries a rich legacy of ancient Egyptian astronomy and astrology, with moderate seasonal planetary hour variation under its clear desert skies.",
  },
];

export function getCityBySlug(slug: string): City | undefined {
  return cities.find((city) => city.slug === slug);
}

export function getAllCitySlugs(): string[] {
  return cities.map((city) => city.slug);
}

export function getCitiesByRegion(region: string): City[] {
  return cities.filter((city) => city.region === region);
}

export function getNearbyCities(citySlug: string, limit: number = 4): City[] {
  const city = getCityBySlug(citySlug);
  if (!city) return cities.slice(0, limit);

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const distances = cities
    .filter((c) => c.slug !== citySlug)
    .map((c) => {
      const dLat = toRad(c.latitude - city.latitude);
      const dLon = toRad(c.longitude - city.longitude);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(city.latitude)) *
          Math.cos(toRad(c.latitude)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const distance = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return { city: c, distance };
    })
    .sort((a, b) => a.distance - b.distance);

  return distances.slice(0, limit).map((d) => d.city);
}
