import { formatInTimeZone } from "date-fns-tz";
import { PlanetaryHour } from "@/services/PlanetaryHoursCalculator";
import { PLANET_COLOR_CLASSES, PLANET_SYMBOLS } from "@/constants/planetColors";

interface CityHoursListProps {
  hours: PlanetaryHour[];
  timezone: string;
}

function HourRow({ hour, timezone, now }: { hour: PlanetaryHour; timezone: string; now: Date }) {
  const start = formatInTimeZone(hour.startTime, timezone, "h:mm a");
  const end = formatInTimeZone(hour.endTime, timezone, "h:mm a");
  const isCurrent = now.getTime() >= hour.startTime.getTime() && now.getTime() < hour.endTime.getTime();
  const colorClass = PLANET_COLOR_CLASSES[hour.ruler as keyof typeof PLANET_COLOR_CLASSES] || "text-gray-500";
  const symbol = PLANET_SYMBOLS[hour.ruler as keyof typeof PLANET_SYMBOLS] || "";

  return (
    <tr className={`border-b border-gray-100 dark:border-gray-700 ${isCurrent ? "bg-purple-50 dark:bg-purple-900/20 font-semibold" : ""}`}>
      <td className="py-2 px-3 text-sm text-gray-500 dark:text-gray-400">{hour.hourNumberOverall <= 12 ? hour.hourNumberOverall : hour.hourNumberOverall - 12}</td>
      <td className={`py-2 px-3 text-sm font-medium ${colorClass}`}>
        <span className="mr-1">{symbol}</span>
        {hour.ruler}
        {isCurrent && <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">Now</span>}
      </td>
      <td className="py-2 px-3 text-sm text-gray-600 dark:text-gray-300">{start} – {end}</td>
      <td className="py-2 px-3 text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">{hour.durationMinutes} min</td>
    </tr>
  );
}

export function CityHoursList({ hours, timezone }: CityHoursListProps) {
  const now = new Date();
  const dayHours = hours.filter((h) => h.type === "day");
  const nightHours = hours.filter((h) => h.type === "night");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Daytime Hours */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-amber-50 dark:bg-amber-900/20 px-4 py-3 border-b border-amber-100 dark:border-amber-800">
          <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2">
            <span>☀️</span> Daytime Planetary Hours
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-750 text-left">
                <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">#</th>
                <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Planet</th>
                <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Time</th>
                <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Duration</th>
              </tr>
            </thead>
            <tbody>
              {dayHours.map((hour) => (
                <HourRow key={hour.hourNumberOverall} hour={hour} timezone={timezone} now={now} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nighttime Hours */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-3 border-b border-indigo-100 dark:border-indigo-800">
          <h3 className="text-lg font-semibold text-indigo-800 dark:text-indigo-200 flex items-center gap-2">
            <span>🌙</span> Nighttime Planetary Hours
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-750 text-left">
                <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">#</th>
                <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Planet</th>
                <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Time</th>
                <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Duration</th>
              </tr>
            </thead>
            <tbody>
              {nightHours.map((hour) => (
                <HourRow key={hour.hourNumberOverall} hour={hour} timezone={timezone} now={now} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
