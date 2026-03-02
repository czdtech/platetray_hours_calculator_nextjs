import type { City } from "@/data/cities";
import type { Locale } from "@/i18n/config";
import { t, type Messages } from "@/i18n/getMessages";

const formatLatitude = (value: number): string =>
  `${Math.abs(value).toFixed(4)}°${value >= 0 ? "N" : "S"}`;

const formatLongitude = (value: number): string =>
  `${Math.abs(value).toFixed(4)}°${value >= 0 ? "E" : "W"}`;

export function getLocalizedCityDescription(
  city: City,
  locale: Locale,
  messages: Messages,
): string {
  if (locale === "en") {
    return city.description;
  }

  return t(messages.cityPage.descriptionTemplate, {
    city: city.name,
    country: city.country,
    lat: formatLatitude(city.latitude),
    lon: formatLongitude(city.longitude),
    timezone: city.timezone,
  });
}
