"use client";

import { FormattedPlanetaryHour, formatHoursToList } from "@/utils/planetaryHourFormatters";
import { PlanetaryHoursCalculationResult } from "@/services/PlanetaryHoursCalculator";
import { useDateContext } from "@/contexts/DateContext";
import { timeZoneService } from "@/services/TimeZoneService";
import { useState, useEffect, useMemo } from "react";
import { getCurrentTime } from '@/utils/time';
// 导入全局行星颜色常量
import {
  PLANET_COLOR_CLASSES,
  PLANET_COLOR_HEX,
  PLANET_SYMBOLS,
} from "@/constants/planetColors";

import { ServerCurrentHourPayload } from '@/utils/planetaryHourHelpers';

interface CurrentHourDisplayProps {
  currentHour: FormattedPlanetaryHour | null;
  dayRuler?: string;
  sunriseTime?: Date;
  timeFormat?: "12h" | "24h";
  isSameDate?: boolean;
  beforeSunrise?: boolean;
  initialHourPayload?: ServerCurrentHourPayload | null;
  serverTime?: string; // 用于确保 SSR/CSR 一致性
  // 新增：接收完整的行星时数据，用于统一计算逻辑
  planetaryHoursRaw?: PlanetaryHoursCalculationResult | null;
}

export function CurrentHourDisplay({
  currentHour: fallbackCurrentHour,
  dayRuler,
  sunriseTime,
  timeFormat = "24h",
  isSameDate: _isSameDate = true,
  beforeSunrise = false,
  initialHourPayload = null,
  serverTime,
  planetaryHoursRaw = null,
}: CurrentHourDisplayProps) {
  // 使用DateContext获取时区及选中日期
  const { timezone, selectedDate, formatDate } = useDateContext();

  // 使用实时更新的时间，确保时间是当前的
  const [now, setNow] = useState<Date>(() => getCurrentTime(serverTime));

  // 添加定时器以实时更新时间
  useEffect(() => {
    // 立即更新一次时间（解决SSR时间不同步问题）
    setNow(new Date());
    
    // 每分钟更新一次时间
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000); // 60秒更新一次

    // 组件卸载时清理定时器
    return () => clearInterval(interval);
  }, []);

  // 判断用户当前视图是否为今天（同一时区下）
  const isTodayPage = timeZoneService.formatInTimeZone(selectedDate ?? now, timezone, "yyyy-MM-dd") ===
                      timeZoneService.formatInTimeZone(now, timezone, "yyyy-MM-dd");

  // 🎯 核心修复：使用与 HoursList 相同的逻辑计算当前行星时
  const calculatedCurrentHour = useMemo(() => {
    // 只有当是今天且有完整数据时才重新计算
    if (!isTodayPage || !planetaryHoursRaw?.planetaryHours || !planetaryHoursRaw.timezone) {
      return null;
    }

    // 使用与 HoursList 完全相同的逻辑
    const allFormattedHours = formatHoursToList(
      planetaryHoursRaw.planetaryHours,
      planetaryHoursRaw.timezone,
      timeFormat,
      undefined, // 不传递 currentHourForHighlighting，让函数自己计算
      true, // 允许高亮
    );

    // 找到当前被标记为 current 的行星时
    return allFormattedHours.find(hour => hour.current) || null;
  }, [planetaryHoursRaw, timeFormat, isTodayPage, now]); // now 作为依赖确保实时更新

  // 选择要显示的当前行星时：优先使用重新计算的结果
  let currentHour = calculatedCurrentHour || fallbackCurrentHour;

  // 如果还是没有当前小时且有服务器提供的初始化数据，使用初始化数据
  if (!currentHour && isTodayPage && initialHourPayload?.currentHour) {
    currentHour = initialHourPayload.currentHour;
    dayRuler = dayRuler ?? initialHourPayload.dayRuler ?? undefined;
    sunriseTime = sunriseTime ?? initialHourPayload.sunrise ?? undefined;
  }

  // 判断所选日期是否为"今天"（以所选时区计）
  const selectedDateStr = timeZoneService.formatInTimeZone(
    selectedDate,
    timezone,
    "yyyy-MM-dd",
  );
  const todayStr = timeZoneService.formatInTimeZone(
    now,
    timezone,
    "yyyy-MM-dd",
  );
  const isSelectedDateToday = selectedDateStr === todayStr;
  // 检查是否有日出时间，并且当前时间是否早于日出时间
  const isBeforeSunrise = sunriseTime && now < sunriseTime;
  // 仅当页面日期为今天时，才考虑"日出前"场景，避免未来日期误判
  const isPreSunrise = isSelectedDateToday && (beforeSunrise || isBeforeSunrise);

  // —— 何时显示"日出前提示" ——
  // 场景：
  // A) 选中的日期与行星时数据的实际日期不一致（如凌晨属于前一天夜时段）；
  // B) 明确标记 beforeSunrise 或计算得出 isBeforeSunrise 为 true。
  // 只要满足 A 或 B，即可认为应显示提示信息。
  const shouldShowPreSunriseMessage = !_isSameDate || isPreSunrise;

  // 计算所选日期与今天（同一时区）的先后关系
  const isSelectedDatePast = selectedDateStr < todayStr;
  const isSelectedDateFuture = selectedDateStr > todayStr;

  // 仅在非未来日期且行星时数据匹配时显示实时小时。
  const showCurrentHour = !!currentHour && _isSameDate && !isSelectedDateFuture;

  // 格式化日出时间
  const formattedSunriseTime = sunriseTime
    ? timeZoneService.formatInTimeZone(
      sunriseTime,
      timezone,
      timeFormat === "24h" ? "HH:mm" : "h:mm aa",
    )
    : "";

  // 使用用户选择的日期来计算"今天/昨天"显示，避免因日出前 UTC 偏移导致错误
  const todayDisplayBase = selectedDate;
  const yesterdayDisplayBase = new Date(todayDisplayBase);
  yesterdayDisplayBase.setUTCDate(yesterdayDisplayBase.getUTCDate() - 1);

  const formattedToday = formatDate(todayDisplayBase, "medium");
  const formattedYesterday = formatDate(yesterdayDisplayBase, "medium");

  // 添加这些安全访问帮助变量
  const isValidDayRuler = dayRuler && dayRuler in PLANET_COLOR_CLASSES;
  const planetColorClass = isValidDayRuler
    ? PLANET_COLOR_CLASSES[dayRuler as keyof typeof PLANET_COLOR_CLASSES]
    : "text-gray-500";
  const planetSymbol = isValidDayRuler
    ? PLANET_SYMBOLS[dayRuler as keyof typeof PLANET_SYMBOLS]
    : "";

  // 获取当前小时的行星颜色值
  const currentPlanetColor =
    currentHour?.planet && currentHour.planet in PLANET_COLOR_HEX
      ? PLANET_COLOR_HEX[currentHour.planet as keyof typeof PLANET_COLOR_HEX]
      : undefined;

  return (
    <div className="space-y-2" suppressHydrationWarning={true}>
      <p className="block text-sm font-medium text-gray-700">
        {showCurrentHour ? "Current Planetary Hour" : "Day Ruler"}
      </p>
      <div className="relative">
        {showCurrentHour ? (
          <div
            id="current-hour"
            className="w-full rounded-lg border border-gray-200 bg-white overflow-hidden divide-y divide-gray-200 shadow-sm"
          >
            {/* Day Ruler Row */}
            {dayRuler && (
              <div className="p-2.5 flex justify-between items-center bg-gray-50">
                <span className="text-sm font-medium text-purple-700">
                  Day Ruler
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-semibold ${planetColorClass}`}
                    style={{
                      color:
                        PLANET_COLOR_HEX[
                          dayRuler as keyof typeof PLANET_COLOR_HEX
                        ],
                    }}
                  >
                    {dayRuler}
                  </span>
                  <span
                    className={`text-xl ${planetColorClass}`}
                    style={{
                      color:
                        PLANET_COLOR_HEX[
                          dayRuler as keyof typeof PLANET_COLOR_HEX
                        ],
                    }}
                  >
                    {planetSymbol}
                  </span>
                </div>
              </div>
            )}

            {/* Current Hour Row */}
            <div className="p-2.5 flex items-center">
              <div
                className={`text-2xl ${
                  currentHour?.planetColor || "text-gray-500"
                }`}
                style={{ color: currentPlanetColor }}
              >
                {currentHour?.planet && currentHour.planet in PLANET_SYMBOLS
                  ? PLANET_SYMBOLS[
                      currentHour.planet as keyof typeof PLANET_SYMBOLS
                    ]
                  : PLANET_SYMBOLS["Sun"]}
              </div>
              <div className="ml-3 flex-grow">
                <div className="flex items-center space-x-2">
                  <span
                    className={`font-medium ${
                      currentHour?.planetColor || "text-gray-500"
                    }`}
                    style={{ color: currentPlanetColor }}
                  >
                    {currentHour?.planet}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-600 text-sm">
                    {currentHour?.timeRange}
                  </span>
                </div>
              </div>
            </div>

            {/* Good For / Avoid Row */}
            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200">
              <div className="p-2.5 flex-1">
                <div className="text-xs font-medium text-green-700 uppercase mb-1">
                  Good For
                </div>
                <div className="text-sm text-gray-600 leading-snug break-words">
                  {currentHour?.goodFor}
                </div>
              </div>
              <div className="p-2.5 flex-1">
                <div className="text-xs font-medium text-red-600 uppercase mb-1">
                  Avoid
                </div>
                <div className="text-sm text-gray-600 leading-snug break-words">
                  {currentHour?.avoid}
                </div>
              </div>
            </div>

            {/* Before Sunrise Message Row */}
            {shouldShowPreSunriseMessage && (
              <div className="p-2.5 text-center text-indigo-600 text-sm italic">
                It&apos;s early morning, before today&apos;s sunrise (
                {formattedSunriseTime}). You&apos;re seeing the night hours from{" "}
                {formattedYesterday}, continuing until sunrise on{" "}
                {formattedToday}
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
              <div className="p-2.5 flex justify-between items-center bg-gray-50">
                <span className="text-sm font-medium text-purple-700">
                  Day Ruler
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-semibold ${planetColorClass}`}
                    style={{
                      color:
                        PLANET_COLOR_HEX[
                          dayRuler as keyof typeof PLANET_COLOR_HEX
                        ],
                    }}
                  >
                    {dayRuler}
                  </span>
                  <span
                    className={`text-xl ${planetColorClass}`}
                    style={{
                      color:
                        PLANET_COLOR_HEX[
                          dayRuler as keyof typeof PLANET_COLOR_HEX
                        ],
                    }}
                  >
                    {planetSymbol}
                  </span>
                </div>
              </div>
            )}

            {/* Message for before sunrise */}
            {shouldShowPreSunriseMessage && (
              <div className="p-2.5 text-center text-gray-500 text-sm">
                Planetary hours will begin after today&apos;s sunrise.
                <br />
                Please check {formattedYesterday} for current hour.
              </div>
            )}

            {/* Message for non-today dates */}
            {!isSelectedDateToday && !shouldShowPreSunriseMessage && (
              <div className="p-2.5 text-center text-gray-500 text-sm">
                {isSelectedDatePast && (
                  <>
                    You&apos;re viewing planetary hours for {formattedToday}.
                    <br />
                    &quot;Current hour&quot; is only shown for today&apos;s
                    date.
                  </>
                )}
                {isSelectedDateFuture && (
                  <>
                    You&apos;re viewing planetary hours for {formattedToday}.
                    <br />
                    &quot;Current hour&quot; will be available on this date.
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
