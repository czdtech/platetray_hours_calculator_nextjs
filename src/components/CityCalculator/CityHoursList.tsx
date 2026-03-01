"use client";

import { useEffect, useMemo, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { PlanetaryHour } from "@/services/PlanetaryHoursCalculator";
import { PLANET_COLOR_CLASSES, PLANET_SYMBOLS } from "@/constants/planetColors";
import { normalizePlanetaryHours } from "@/components/CityCalculator/utils";

interface CityHoursListLabels {
  daytimeHours: string;
  nighttimeHours: string;
  planet: string;
  time: string;
  duration: string;
  now: string;
}

interface CityHoursListProps {
  hours: PlanetaryHour[];
  timezone: string;
  labels?: CityHoursListLabels;
  localizedPlanets?: Record<string, string>;
}

const defaultLabels: CityHoursListLabels = {
  daytimeHours: "Daytime Planetary Hours",
  nighttimeHours: "Nighttime Planetary Hours",
  planet: "Planet",
  time: "Time",
  duration: "Duration",
  now: "Now",
};

function HourRow({
  hour,
  timezone,
  now,
  nowLabel,
  localizedPlanets,
}: {
  hour: PlanetaryHour;
  timezone: string;
  now: Date;
  nowLabel: string;
  localizedPlanets?: Record<string, string>;
}) {
  const start = formatInTimeZone(hour.startTime, timezone, "h:mm a");
  const end = formatInTimeZone(hour.endTime, timezone, "h:mm a");
  const isCurrent = now.getTime() >= hour.startTime.getTime() && now.getTime() < hour.endTime.getTime();
  const colorClass =
    PLANET_COLOR_CLASSES[hour.ruler as keyof typeof PLANET_COLOR_CLASSES] || "text-gray-500";
  const symbol = PLANET_SYMBOLS[hour.ruler as keyof typeof PLANET_SYMBOLS] || "";
  const localizedPlanet = localizedPlanets?.[hour.ruler] || hour.ruler;

  return (
    <tr
      className={`border-b border-gray-100 dark:border-gray-700 ${
        isCurrent ? "bg-purple-50 dark:bg-purple-900/20 font-semibold" : ""
      }`}
    >
      <td className="py-2 px-3 text-sm text-gray-500 dark:text-gray-400">
        {hour.hourNumberOverall <= 12 ? hour.hourNumberOverall : hour.hourNumberOverall - 12}
      </td>
      <td className={`py-2 px-3 text-sm font-medium ${colorClass}`}>
        <span className="mr-1">{symbol}</span>
        {localizedPlanet}
        {isCurrent && (
          <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
            {nowLabel}
          </span>
        )}
      </td>
      <td className="py-2 px-3 text-sm text-gray-600 dark:text-gray-300">
        {start} – {end}
      </td>
      <td className="py-2 px-3 text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
        {hour.durationMinutes} min
      </td>
    </tr>
  );
}

export function CityHoursList({
  hours,
  timezone,
  labels,
  localizedPlanets,
}: CityHoursListProps) {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const effectiveLabels = labels ?? defaultLabels;
  const normalizedHours = useMemo(() => normalizePlanetaryHours(hours), [hours]);
  const dayHours = useMemo(
    () => normalizedHours.filter((hour) => hour.type === "day"),
    [normalizedHours],
  );
  const nightHours = useMemo(
    () => normalizedHours.filter((hour) => hour.type === "night"),
    [normalizedHours],
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-amber-50 dark:bg-amber-900/20 px-4 py-3 border-b border-amber-100 dark:border-amber-800">
          <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2">
            <span>☀️</span> {effectiveLabels.daytimeHours}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-750 text-left">
                <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  #
                </th>
                <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {effectiveLabels.planet}
                </th>
                <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {effectiveLabels.time}
                </th>
                <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">
                  {effectiveLabels.duration}
                </th>
              </tr>
            </thead>
            <tbody>
              {dayHours.map((hour) => (
                <HourRow
                  key={hour.hourNumberOverall}
                  hour={hour}
                  timezone={timezone}
                  now={now}
                  nowLabel={effectiveLabels.now}
                  localizedPlanets={localizedPlanets}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-3 border-b border-indigo-100 dark:border-indigo-800">
          <h3 className="text-lg font-semibold text-indigo-800 dark:text-indigo-200 flex items-center gap-2">
            <span>🌙</span> {effectiveLabels.nighttimeHours}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-750 text-left">
                <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  #
                </th>
                <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {effectiveLabels.planet}
                </th>
                <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {effectiveLabels.time}
                </th>
                <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">
                  {effectiveLabels.duration}
                </th>
              </tr>
            </thead>
            <tbody>
              {nightHours.map((hour) => (
                <HourRow
                  key={hour.hourNumberOverall}
                  hour={hour}
                  timezone={timezone}
                  now={now}
                  nowLabel={effectiveLabels.now}
                  localizedPlanets={localizedPlanets}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
