import { formatInTimeZone } from "date-fns-tz";
import { City } from "@/data/cities";
import { PLANET_COLOR_CLASSES, PLANET_SYMBOLS } from "@/constants/planetColors";
import type { Locale } from "@/i18n/config";
import { t, type Messages } from "@/i18n/getMessages";
import { getLocalizedCityDescription } from "@/i18n/cityDescription";
import { getDateFnsLocale } from "@/utils/dateLocale";

interface CityInfoProps {
  city: City;
  sunrise: Date;
  sunset: Date;
  timezone: string;
  dayRuler: string;
  locale: Locale;
  messages: Messages;
}

export function CityInfo({
  city,
  sunrise,
  sunset,
  timezone,
  dayRuler,
  locale,
  messages,
}: CityInfoProps) {
  const dateLocale = getDateFnsLocale(locale);
  const sunriseFormatted = formatInTimeZone(sunrise, timezone, "h:mm a");
  const sunsetFormatted = formatInTimeZone(sunset, timezone, "h:mm a");
  const dateFormatted = formatInTimeZone(new Date(), timezone, "EEEE, MMMM d, yyyy", {
    locale: dateLocale,
  });
  const rulerColor = PLANET_COLOR_CLASSES[dayRuler as keyof typeof PLANET_COLOR_CLASSES] || "text-gray-600";
  const rulerSymbol = PLANET_SYMBOLS[dayRuler as keyof typeof PLANET_SYMBOLS] || "";
  const localizedPlanets = messages.planets as Record<string, string>;
  const dayRulerLabel = localizedPlanets[dayRuler] || dayRuler;

  const latDir = city.latitude >= 0 ? "N" : "S";
  const lonDir = city.longitude >= 0 ? "E" : "W";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t(messages.cityPage.title, { city: city.name })}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{dateFormatted}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {city.country} · {Math.abs(city.latitude).toFixed(4)}°{latDir}, {Math.abs(city.longitude).toFixed(4)}°{lonDir}
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg px-4 py-3 text-center min-w-[100px]">
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium uppercase">
              {messages.calculator.sunrise}
            </p>
            <p className="text-lg font-semibold text-amber-800 dark:text-amber-200">☀️ {sunriseFormatted}</p>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg px-4 py-3 text-center min-w-[100px]">
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium uppercase">
              {messages.calculator.sunset}
            </p>
            <p className="text-lg font-semibold text-indigo-800 dark:text-indigo-200">🌅 {sunsetFormatted}</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg px-4 py-3 text-center min-w-[100px]">
            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium uppercase">
              {messages.calculator.dayRuler}
            </p>
            <p className={`text-lg font-semibold ${rulerColor}`}>
              {rulerSymbol} {dayRulerLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
        <p>
          {messages.cityPage.timezone}: <span className="font-medium">{timezone}</span>
        </p>
      </div>

      <p className="mt-3 text-gray-600 dark:text-gray-300 text-sm">
        {getLocalizedCityDescription(city, locale, messages)}
      </p>
    </div>
  );
}
