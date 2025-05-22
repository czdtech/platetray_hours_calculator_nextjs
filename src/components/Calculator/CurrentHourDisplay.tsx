'use client';

import { FormattedPlanetaryHour } from '@/utils/planetaryHourFormatters';
import { useDateContext } from '@/contexts/DateContext';
import { timeZoneService } from '@/services/TimeZoneService';
// 导入全局行星颜色常量
import { PLANET_COLOR_CLASSES, PLANET_COLOR_HEX, PLANET_SYMBOLS } from '@/constants/planetColors';

interface CurrentHourDisplayProps {
  currentHour: FormattedPlanetaryHour | null;
  dayRuler?: string;
  sunriseTime?: Date;
  timeFormat?: '12h' | '24h';
  isSameDate?: boolean;
  beforeSunrise?: boolean;
}

export function CurrentHourDisplay({
  currentHour,
  dayRuler,
  sunriseTime,
  timeFormat = '24h',
  isSameDate = true,
  beforeSunrise = false
}: CurrentHourDisplayProps) {
  // 使用DateContext获取时区及选中日期
  const { timezone, selectedDate, formatDate } = useDateContext();
  // 判断所选日期是否为"今天"（以所选时区计）
  const now = new Date();
  const selectedDateStr = timeZoneService.formatInTimeZone(selectedDate, timezone, 'yyyy-MM-dd');
  const todayStr = timeZoneService.formatInTimeZone(now, timezone, 'yyyy-MM-dd');
  const isSelectedDateToday = selectedDateStr === todayStr;
  // 检查是否有日出时间，并且当前时间是否早于日出时间
  const isBeforeSunrise = sunriseTime && now < sunriseTime;
  // 综合父组件传入与即时计算的"日出前"判断
  const isPreSunrise = beforeSunrise || isBeforeSunrise;

  // 仅当「今天」且(当前行星时尚未开始 或 正处于日出前)才显示提示
  const shouldShowPreSunriseMessage = isSelectedDateToday && (!currentHour || isPreSunrise);

  // 计算所选日期与今天（同一时区）的先后关系
  const isSelectedDatePast = selectedDateStr < todayStr;
  // 何时显示当前行星时卡片？
  // 1) 选中日期在过去；或
  // 2) 选中日期是今天且不处于"日出前提示"状态
  const showCurrentHour = !!currentHour && (isSelectedDatePast || (isSelectedDateToday && !shouldShowPreSunriseMessage));

  // 格式化日出时间
  const formattedSunriseTime = sunriseTime
    ? timeZoneService.formatInTimeZone(sunriseTime, timezone, timeFormat === '24h' ? 'HH:mm' : 'h:mm aa')
    : '';

  // 使用用户选择的日期来计算"今天/昨天"显示，避免因日出前 UTC 偏移导致错误
  const todayDisplayBase = selectedDate;
  const yesterdayDisplayBase = new Date(todayDisplayBase);
  yesterdayDisplayBase.setUTCDate(yesterdayDisplayBase.getUTCDate() - 1);

  const formattedToday = formatDate(todayDisplayBase, 'medium');
  const formattedYesterday = formatDate(yesterdayDisplayBase, 'medium');

  // 添加这些安全访问帮助变量
  const isValidDayRuler = dayRuler && dayRuler in PLANET_COLOR_CLASSES;
  const planetColorClass = isValidDayRuler
    ? PLANET_COLOR_CLASSES[dayRuler as keyof typeof PLANET_COLOR_CLASSES]
    : 'text-gray-500';
  const planetSymbol = isValidDayRuler
    ? PLANET_SYMBOLS[dayRuler as keyof typeof PLANET_SYMBOLS]
    : '';
  
  // 获取当前小时的行星颜色值
  const currentPlanetColor = currentHour?.planet && currentHour.planet in PLANET_COLOR_HEX ?
    PLANET_COLOR_HEX[currentHour.planet as keyof typeof PLANET_COLOR_HEX] : undefined;

  return (
    <div className="space-y-2">
      <p className="block text-sm font-medium text-gray-700">
        {showCurrentHour ? 'Current Planetary Hour' : 'Day Ruler'}
      </p>
      <div className="relative">
        {showCurrentHour ? (
          <div
            id="current-hour"
            className="w-full rounded-lg border border-gray-200 bg-white overflow-hidden divide-y divide-gray-200 shadow-sm"
          >
            {/* Day Ruler Row */}
            {dayRuler && (
              <div className="p-3 flex justify-between items-center bg-gray-50">
                <span className="text-sm font-medium text-purple-700">Day Ruler</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-semibold ${planetColorClass}`}
                    style={{ color: PLANET_COLOR_HEX[dayRuler as keyof typeof PLANET_COLOR_HEX] }}
                  >
                    {dayRuler}
                  </span>
                  <span
                    className={`text-xl ${planetColorClass}`}
                    style={{ color: PLANET_COLOR_HEX[dayRuler as keyof typeof PLANET_COLOR_HEX] }}
                  >
                    {planetSymbol}
                  </span>
                </div>
              </div>
            )}

            {/* Current Hour Row */}
            <div className="p-3 flex items-center">
              <div
                className={`text-2xl ${currentHour?.planetColor || 'text-gray-500'}`}
                style={{ color: currentPlanetColor }}
              >
                {currentHour?.planet && currentHour.planet in PLANET_SYMBOLS ?
                  PLANET_SYMBOLS[currentHour.planet as keyof typeof PLANET_SYMBOLS] :
                  PLANET_SYMBOLS['Sun']}
              </div>
              <div className="ml-3 flex-grow">
                <div className="flex items-center space-x-2">
                  <span
                    className={`font-medium ${currentHour?.planetColor || 'text-gray-500'}`}
                    style={{ color: currentPlanetColor }}
                  >
                    {currentHour?.planet}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-600 text-sm">{currentHour?.timeRange}</span>
                </div>
              </div>
            </div>

            {/* Good For / Avoid Row */}
            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200">
              <div className="p-3 flex-1">
                <div className="text-xs font-medium text-green-700 uppercase mb-1">Good For</div>
                <div className="text-sm text-gray-600 leading-snug break-words">{currentHour?.goodFor}</div>
              </div>
              <div className="p-3 flex-1">
                <div className="text-xs font-medium text-red-600 uppercase mb-1">Avoid</div>
                <div className="text-sm text-gray-600 leading-snug break-words">{currentHour?.avoid}</div>
              </div>
            </div>

            {/* Before Sunrise Message Row */}
            {shouldShowPreSunriseMessage && (
              <div className="p-3 text-center text-indigo-600 text-sm italic">
                It's early morning, before today's sunrise ({formattedSunriseTime}).
                You're seeing the night hours from {formattedYesterday}, continuing until sunrise on {formattedToday}
              </div>
            )}
          </div>
        ) : (
          <div
            id="current-hour"
            className="w-full rounded-lg border border-gray-200 bg-white overflow-hidden divide-y divide-gray-200 shadow-sm"
          >
            {/* Day Ruler Row */}
            {dayRuler && (
              <div className="p-3 flex justify-between items-center bg-gray-50">
                <span className="text-sm font-medium text-purple-700">Day Ruler</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-semibold ${planetColorClass}`}
                    style={{ color: PLANET_COLOR_HEX[dayRuler as keyof typeof PLANET_COLOR_HEX] }}
                  >
                    {dayRuler}
                  </span>
                  <span
                    className={`text-xl ${planetColorClass}`}
                    style={{ color: PLANET_COLOR_HEX[dayRuler as keyof typeof PLANET_COLOR_HEX] }}
                  >
                    {planetSymbol}
                  </span>
                </div>
              </div>
            )}

            {/* Message for before sunrise */}
            {shouldShowPreSunriseMessage && (
              <div className="p-3 text-center text-gray-500 text-sm">
                Planetary hours will begin after today's sunrise.
                <br />Please check {formattedYesterday} for current hour.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}