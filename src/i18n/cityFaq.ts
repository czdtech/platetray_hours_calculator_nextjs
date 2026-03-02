import type { City } from "@/data/cities";
import { t, type Messages } from "@/i18n/getMessages";

export interface CityFaqItem {
  question: string;
  answer: string;
}

interface BuildCityFaqParams {
  city: City;
  sunriseFormatted: string;
  dayRulerLabel: string;
  daytimeHourDuration: number;
  nighttimeHourDuration: number;
}

const formatLatitude = (value: number): string =>
  `${Math.abs(value).toFixed(4)}°${value >= 0 ? "N" : "S"}`;

const formatLongitude = (value: number): string =>
  `${Math.abs(value).toFixed(4)}°${value >= 0 ? "E" : "W"}`;

export function buildCityFaqItems(
  params: BuildCityFaqParams,
  messages: Messages,
): CityFaqItem[] {
  const {
    city,
    sunriseFormatted,
    dayRulerLabel,
    daytimeHourDuration,
    nighttimeHourDuration,
  } = params;

  const lat = formatLatitude(city.latitude);
  const lon = formatLongitude(city.longitude);

  return [
    {
      question: t(messages.cityPage.faqTemplates.todayQuestion, { city: city.name }),
      answer: t(messages.cityPage.faqTemplates.todayAnswer, {
        city: city.name,
        sunrise: sunriseFormatted,
        dayRuler: dayRulerLabel,
        dayMinutes: daytimeHourDuration.toFixed(0),
        nightMinutes: nighttimeHourDuration.toFixed(0),
      }),
    },
    {
      question: t(messages.cityPage.faqTemplates.rulerQuestion, { city: city.name }),
      answer: t(messages.cityPage.faqTemplates.rulerAnswer, {
        city: city.name,
        dayRuler: dayRulerLabel,
      }),
    },
    {
      question: t(messages.cityPage.faqTemplates.calculationQuestion, {
        city: city.name,
      }),
      answer: t(messages.cityPage.faqTemplates.calculationAnswer, {
        city: city.name,
        lat,
        lon,
        timezone: city.timezone,
      }),
    },
  ];
}
