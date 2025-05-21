'use client'; // Added 'use client' for hooks and date logic

import { FormattedPlanetaryHour } from '@/utils/planetaryHourFormatters'; // Updated import path
import { useDateContext } from '@/contexts/DateContext'; // Updated import path
import { timeZoneService } from '@/services/TimeZoneService'; // Updated import path

interface CurrentHourDisplayProps {
  currentHour: FormattedPlanetaryHour | null;
  planetColors: Record<string, string>;
  planetSymbols: Record<string, string>;
  dayRuler?: string;
  sunriseTime?: Date;
  timeFormat?: '12h' | '24h';
  isSameDate?: boolean; // This prop might be redundant if selectedDate is always from context
  beforeSunrise?: boolean;
}

export function CurrentHourDisplay({
  currentHour,
  planetColors,
  planetSymbols,
  dayRuler,
  sunriseTime,
  timeFormat = '24h',
  // isSameDate = true, // Consider removing if selectedDate from context is sufficient
  beforeSunrise = false
}: CurrentHourDisplayProps) {
  const { timezone, selectedDate, formatDate } = useDateContext();
  const now = new Date();
  const selectedDateStr = timeZoneService.formatInTimeZone(selectedDate, timezone, 'yyyy-MM-dd');
  const todayStr = timeZoneService.formatInTimeZone(now, timezone, 'yyyy-MM-dd');
  const isSelectedDateToday = selectedDateStr === todayStr;
  
  const isNowBeforeSunriseToday = sunriseTime && now < sunriseTime && isSelectedDateToday;
  const isPreSunriseCondition = beforeSunrise || isNowBeforeSunriseToday;

  const shouldShowPreSunriseMessage = isSelectedDateToday && (!currentHour || isPreSunriseCondition);
  const isSelectedDatePast = selectedDateStr < todayStr;
  const showCurrentHourCard = !!currentHour && (isSelectedDatePast || (isSelectedDateToday && !shouldShowPreSunriseMessage));

  if (process.env.NODE_ENV === 'development') {
    console.log('[CurrentHourDisplay] received', { currentHour });
    console.log('[CurrentHourDisplay] debug', {
      now: now.toISOString(),
      sunriseTime: sunriseTime?.toISOString(),
      isNowBeforeSunriseToday,
      beforeSunriseProp: beforeSunrise,
      isPreSunriseCondition,
      selectedDateStr,
      todayStr,
      isSelectedDateToday,
      showCurrentHourCard,
      shouldShowPreSunriseMessage,
    });
  }

  const formattedSunriseTime = sunriseTime
    ? timeZoneService.formatInTimeZone(sunriseTime, timezone, timeFormat === '24h' ? 'HH:mm' : 'h:mm aa')
    : '';

  const todayDisplayBase = selectedDate;
  const yesterdayDisplayBase = new Date(todayDisplayBase);
  yesterdayDisplayBase.setDate(yesterdayDisplayBase.getDate() - 1); // Use setDate for local date adjustment

  const formattedToday = formatDate(todayDisplayBase, 'medium');
  const formattedYesterday = formatDate(yesterdayDisplayBase, 'medium');

  return (
    <div className="space-y-2">
      <p className="block text-sm font-medium text-gray-700">
        {showCurrentHourCard ? 'Current Planetary Hour' : (dayRuler ? 'Day Ruler' : 'Planetary Hours')}
      </p>
      <div className="relative">
        {showCurrentHourCard && currentHour ? (
          <div
            id="current-hour-card"
            className="w-full rounded-lg border border-gray-200 bg-white overflow-hidden divide-y divide-gray-200 shadow-sm"
          >
            {dayRuler && (
              <div className="p-3 flex justify-between items-center bg-gray-50">
                <span className="text-sm font-medium text-purple-700">Day Ruler</span>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${planetColors[dayRuler]}`}>
                    {dayRuler}
                  </span>
                  <span className={`text-xl ${planetColors[dayRuler]}`}>
                    {planetSymbols[dayRuler]}
                  </span>
                </div>
              </div>
            )}
            <div className="p-3 flex items-center">
              <div className={`text-2xl ${currentHour.planetColor}`}>
                {planetSymbols[currentHour.planet]}
              </div>
              <div className="ml-3 flex-grow">
                <div className="flex items-center space-x-2">
                  <span className={`font-medium ${currentHour.planetColor}`}>
                    {currentHour.planet}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-600 text-sm truncate">{currentHour.timeRange}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200">
              <div className="p-3 flex-1">
                <div className="text-xs font-medium text-green-700 uppercase mb-1">Good For</div>
                <div className="text-sm text-gray-600 leading-snug break-words">{currentHour.goodFor}</div>
              </div>
              <div className="p-3 flex-1">
                <div className="text-xs font-medium text-red-600 uppercase mb-1">Avoid</div>
                <div className="text-sm text-gray-600 leading-snug break-words">{currentHour.avoid}</div>
              </div>
            </div>
          </div>
        ) : (
          <div
            id="day-ruler-card"
            className="w-full rounded-lg border border-gray-200 bg-white overflow-hidden divide-y divide-gray-200 shadow-sm p-3"
          >
            {dayRuler && (
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-t-lg -m-3 mb-3">
                <span className="text-sm font-medium text-purple-700">Day Ruler</span>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${planetColors[dayRuler]}`}>
                    {dayRuler}
                  </span>
                  <span className={`text-xl ${planetColors[dayRuler]}`}>
                    {planetSymbols[dayRuler]}
                  </span>
                </div>
              </div>
            )}
            {shouldShowPreSunriseMessage ? (
              <div className="text-center text-indigo-600 text-sm italic">
                It&apos;s early morning, before today&apos;s sunrise ({formattedSunriseTime}).
                You&apos;re seeing the night hours from {formattedYesterday}, continuing until sunrise on {formattedToday}.
              </div>
            ) : isSelectedDateToday ? (
              <div className="text-center text-gray-500 text-sm">
                Planetary hours for {formattedToday} will begin after sunrise ({formattedSunriseTime}).
              </div>
            ) : (
              <div className="text-center text-gray-500 text-sm">
                Planetary hours for {formatDate(selectedDate, 'medium')} are shown on the right.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 