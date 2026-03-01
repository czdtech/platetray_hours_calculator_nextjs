"use client";

import { useEffect, useMemo, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { PLANET_COLOR_CLASSES, PLANET_SYMBOLS } from "@/constants/planetColors";
import type { Locale } from "@/i18n/config";
import { getLocalizedPlanetAttributes } from "@/i18n/planetAttributes";
import type { PlanetaryHour } from "@/services/PlanetaryHoursCalculator";
import { normalizePlanetaryHours } from "@/components/CityCalculator/utils";

interface CurrentHourLabels {
  currentHour: string;
  daytime: string;
  nighttime: string;
  goodFor: string;
  avoid: string;
}

interface CityCurrentHourCardProps {
  hours: PlanetaryHour[];
  timezone: string;
  locale: Locale;
  labels: CurrentHourLabels;
  localizedPlanets?: Record<string, string>;
}

export function CityCurrentHourCard({
  hours,
  timezone,
  locale,
  labels,
  localizedPlanets,
}: CityCurrentHourCardProps) {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const normalizedHours = useMemo(() => normalizePlanetaryHours(hours), [hours]);

  const currentHour = useMemo(() => {
    const nowMs = now.getTime();
    return (
      normalizedHours.find(
        (hour) => nowMs >= hour.startTime.getTime() && nowMs < hour.endTime.getTime(),
      ) ?? null
    );
  }, [normalizedHours, now]);

  if (!currentHour) {
    return null;
  }

  const currentHourColor =
    PLANET_COLOR_CLASSES[currentHour.ruler as keyof typeof PLANET_COLOR_CLASSES] ||
    "text-gray-600";
  const currentHourSymbol =
    PLANET_SYMBOLS[currentHour.ruler as keyof typeof PLANET_SYMBOLS] || "";
  const currentHourPlanet = localizedPlanets?.[currentHour.ruler] || currentHour.ruler;
  const localizedAttributes = getLocalizedPlanetAttributes(currentHour.ruler, locale);
  const goodForText = localizedAttributes?.goodFor ?? currentHour.goodFor;
  const avoidText = localizedAttributes?.avoid ?? currentHour.avoid;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl shadow-sm border border-purple-200 dark:border-purple-800 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {labels.currentHour}
      </h2>
      <div className="flex items-center gap-3">
        <span className={`text-3xl font-bold ${currentHourColor}`}>
          {currentHourSymbol} {currentHourPlanet}
        </span>
        <span className="text-gray-500 dark:text-gray-400">·</span>
        <span className="text-gray-600 dark:text-gray-300">
          {formatInTimeZone(currentHour.startTime, timezone, "h:mm a")} –{" "}
          {formatInTimeZone(currentHour.endTime, timezone, "h:mm a")}
        </span>
        <span className="text-xs bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-200 px-2 py-1 rounded-full">
          {currentHour.type === "day" ? labels.daytime : labels.nighttime}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        <div>
          <span className="font-medium text-green-700 dark:text-green-400">
            {labels.goodFor}:
          </span>{" "}
          <span className="text-gray-600 dark:text-gray-300">{goodForText}</span>
        </div>
        <div>
          <span className="font-medium text-red-700 dark:text-red-400">{labels.avoid}:</span>{" "}
          <span className="text-gray-600 dark:text-gray-300">{avoidText}</span>
        </div>
      </div>
    </div>
  );
}
