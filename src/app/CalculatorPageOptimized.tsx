"use client";

import { useState, useEffect, Suspense, lazy, useMemo, useCallback, useRef } from "react";
import { DateProvider, useDateContext } from "@/contexts/DateContext";
import { usePlanetaryHours } from "@/hooks/usePlanetaryHours";
import { PlanetaryHoursCalculationResult } from "@/services/PlanetaryHoursCalculator";
import { Header } from "@/components/Layout/Header";
import { EnhancedLocationInput } from "@/components/Calculator/EnhancedLocationInput";
import { DateTimeInput } from "@/components/Calculator/DateTimeInput";
import { CurrentHourDisplay } from "@/components/Calculator/CurrentHourDisplay";
import { WeekNavigation } from "@/components/Calculator/WeekNavigation";
import { TimeFormatToggle } from "@/components/Calculator/TimeFormatToggle";
import { HoursListSkeleton } from "@/components/Skeleton/HoursListSkeleton";
import { CurrentHourSkeleton } from "@/components/Skeleton/CurrentHourSkeleton";
import { Section } from "@/components/semantic/Section";
import { timeZoneService } from "@/services/TimeZoneService";
import { formatInTimeZone as formatInTimeZoneDirect, fromZonedTime } from "date-fns-tz";
import { subDays } from "date-fns";
import { LayoutStabilizer } from "@/components/Performance/LayoutStabilizer";
import { createLogger } from '@/utils/unified-logger';
import { ServerCurrentHourPayload } from '@/utils/planetaryHourHelpers';

// 将 logger 创建移到组件外部，避免每次渲染时重新创建
const logger = createLogger('CalculatorPageOptimized');

// 懒加载非关键组件
const LazyHoursList = lazy(() => import("@/components/Calculator/HoursList").then(module => ({ default: module.HoursList })));
const LazyFAQSection = lazy(() => import("@/components/FAQ/FAQSection").then(module => ({ default: module.FAQSection })));



interface Coordinates {
  latitude: number;
  longitude: number;
  source: "browser" | "input" | "geocode" | "autocomplete" | "preset";
  address?: string;
}

// 默认坐标常量
const DEFAULT_COORDINATES = {
  latitude: 40.7128,
  longitude: -74.006,
  source: "input" as const,
};

// API调用频率限制和缓存
const timezoneCache = new Map<string, { timezone: string; timestamp: number }>();
const pendingTimezoneRequests = new Map<string, Promise<string | null>>();
const API_CALL_INTERVAL = 1000; // 最小间隔1秒
const CACHE_DURATION = 5 * 60 * 1000; // 缓存5分钟

// FAQ数据移到组件外部，避免重复创建
const FAQ_DATA = [
  {
    question: "How are planetary hours calculated?",
    answer:
      'Planetary hours are calculated by dividing the time between sunrise and sunset (for daytime hours) and sunset and the next sunrise (for nighttime hours) into 12 equal parts. The length of these "hours" varies depending on the season and latitude.',
  },
  {
    question: "Why are the planetary hours not exactly 60 minutes long?",
    answer:
      "Because the length of daylight and nighttime changes throughout the year, the duration of each planetary hour also changes. They are only close to 60 minutes near the equinoxes.",
  },
  {
    question: "Do I need to know my exact sunrise/sunset times for the planetary hours calculator?",
    answer:
      "No, this planetary hours calculator handles that automatically based on the location and date you provide. It uses precise astronomical calculations.",
  },
  {
    question: "Which planets are used in the planetary hours system?",
    answer:
      "The planetary hours system uses the seven traditional astrological planets: Sun, Moon, Mercury, Venus, Mars, Jupiter, and Saturn. Uranus, Neptune, and Pluto are not part of this traditional planetary hours system.",
  },
  {
    question: "Is the planetary hours system scientifically proven?",
    answer:
      "Planetary hours are part of traditional astrology and are not based on modern scientific principles. They are used as a symbolic or spiritual timing system by those who follow these traditions.",
  },
  {
    question: "How accurate is the location detection in this planetary hours calculator?",
    answer:
      "If you allow location access, the planetary hours calculator uses your browser's geolocation capabilities, which are generally quite accurate for determining sunrise/sunset times. You can also manually enter any location worldwide.",
  },
  {
    question: "Why do summer and winter planetary hours differ in length?",
    answer:
      "Because planetary hours divide sunrise-to-sunset into 12 slices, the length of each slice stretches in summer and shrinks in winter. Near the equator they stay close to 60 minutes all year.",
  },
  {
    question: 'Why is it still "night hours" before today\'s sunrise?',
    answer:
      "By tradition the planetary day starts at sunrise. Any time before sunrise belongs to the previous night set, even if the clock shows 3 AM of the new calendar date.",
  },
  {
    question: "How do I choose the best planetary hour for my task?",
    answer:
      "Match the symbolism: Venus for love or art, Mercury for emails or study, Mars for workouts or assertive action. Use our planetary hours calculator cheat-sheet or hover tips for quick guidance.",
  },
];

interface CalculatorPageOptimizedProps {
  precomputed?: PlanetaryHoursCalculationResult | null;
  initialHour?: ServerCurrentHourPayload | null;
  serverTime?: string; // 服务端时间戳，确保 SSR/CSR 一致性
  cacheControl?: string; // 缓存控制头信息
  ttlInfo?: import('@/utils/cache/dynamicTTL').TTLCalculationResult; // TTL计算结果
  error?: string; // 错误信息
}

function CalculatorCore({ precomputed, initialHour, serverTime, cacheControl, ttlInfo, error }: CalculatorPageOptimizedProps) {
  const { selectedDate, timezone, setSelectedDate, setTimezone, formatDate, formatDateWithTodayPrefix } =
    useDateContext();

  const [location, setLocation] = useState("New York, NY");
  const [coordinates, setCoordinates] = useState<Coordinates>(DEFAULT_COORDINATES);
  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">("24h");
  const [isTimezoneUpdating, setIsTimezoneUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<"day" | "night">("day");
  const [hasInitialCalculated, setHasInitialCalculated] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);

  // 使用useRef存储函数引用，避免依赖变化
  const lastApiCallRef = useRef<number>(0);
  const calculationParamsRef = useRef<string>("");

  const {
    planetaryHoursRaw,
    currentHour,
    daytimeHours,
    nighttimeHours,
    isLoading: isLoadingHours,
    error: hoursError,
    calculate,
  } = usePlanetaryHours(timeFormat, precomputed ?? null);

  // 页面首次加载时，如果有预计算数据就不显示hourlist的loading状态
  const loading = isLoadingHours || isTimezoneUpdating;
  const showHourListLoading = loading && (!precomputed || hasInitialCalculated);

  // 检查是否为默认坐标的函数
  const isDefaultCoordinates = useCallback((coords: Coordinates) => {
    return (
      coords.latitude === DEFAULT_COORDINATES.latitude &&
      coords.longitude === DEFAULT_COORDINATES.longitude &&
      coords.source === "input"
    );
  }, []);

  // 优化的时区获取函数，添加频率限制和缓存
  const fetchTimezone = useCallback(async (coords: Coordinates): Promise<string | null> => {
    if (isDefaultCoordinates(coords)) {
      logger.info("🏠 [Timezone] 使用默认坐标，跳过API调用，使用默认时区");
      return null;
    }

    // Skip API call for preset cities (they already have timezone set)
    if (coords.source === "preset") {
      logger.info("[Timezone] 跳过预设城市的时区API调用");
      return null;
    }

    const cacheKey = `${coords.latitude.toFixed(6)}_${coords.longitude.toFixed(6)}`;
    const now = Date.now();

    // 检查缓存
    const cached = timezoneCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      logger.data("[Timezone] 使用缓存的时区数据:", cached.timezone);
      return cached.timezone;
    }

    // 检查是否有正在进行的请求
    if (pendingTimezoneRequests.has(cacheKey)) {
      logger.info("⏳ [Timezone] 等待正在进行的时区请求");
      return await pendingTimezoneRequests.get(cacheKey)!;
    }

    // 频率限制检查
    if (now - lastApiCallRef.current < API_CALL_INTERVAL) {
      logger.info("🚫 [Timezone] API调用频率限制，跳过请求");
      return null;
    }

    const requestPromise = (async () => {
      try {
        setIsTimezoneUpdating(true);
        lastApiCallRef.current = now;

        logger.info("🌍 [Timezone] 发起时区API请求:", cacheKey);
        const timestamp = Math.floor(now / 1000);
        const response = await fetch(
          `/api/maps/timezone?location=${coords.latitude},${coords.longitude}&timestamp=${timestamp}`,
        );
        const data = await response.json();

        if (data.status === "OK") {
          // 缓存结果
          timezoneCache.set(cacheKey, {
            timezone: data.timeZoneId,
            timestamp: now
          });
          logger.info("✅ [Timezone] 成功获取时区:", data.timeZoneId);
          return data.timeZoneId;
        }
        throw new Error("Failed to fetch timezone");
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        logger.error("❌ [Timezone] 获取时区失败:", err);
        return null;
      } finally {
        setIsTimezoneUpdating(false);
        pendingTimezoneRequests.delete(cacheKey);
      }
    })();

    pendingTimezoneRequests.set(cacheKey, requestPromise);
    return await requestPromise;
  }, [isDefaultCoordinates]);

  // 简化：直接计算简单字符串，不需要缓存
  const coordinatesKey = `${coordinates.latitude}_${coordinates.longitude}_${coordinates.source}`;
  const selectedDateKey = formatInTimeZoneDirect(selectedDate, timezone, "yyyy-MM-dd");

  // 使用服务端传递的时间，确保 SSR/CSR 一致性
  const [now] = useState<Date>(() => serverTime ? new Date(serverTime) : new Date());

  useEffect(() => {
    let isCancelled = false;

    // —— 优化：若存在 SSR 预计算数据且满足默认条件，则直接复用数据，跳过首次客户端计算 ——
    const isNYDefaultCoords = isDefaultCoordinates(coordinates);

    // 直接复用 SSR 预计算数据（默认纽约坐标），不再比较"纽约当天"判断，避免因跨时区造成的误判
    if (precomputed && isNYDefaultCoords && !hasInitialCalculated) {
      logger.info("✅ [SSR] 复用预计算数据，跳过首次客户端计算");
      calculationParamsRef.current = `${coordinatesKey}_${selectedDateKey}_${timezone}`;
      setHasInitialCalculated(true);
      return;
    }

    const performCalculation = async () => {
      // 创建计算参数标识符
      const currentParams = `${coordinatesKey}_${selectedDateKey}_${timezone}`;

      // 跳过重复计算的前提：
      // 1) 参数完全一致；且
      // 2) planetaryHoursRaw 的 requestedDate 已与 selectedDateKey 相同
      if (
        currentParams === calculationParamsRef.current &&
        planetaryHoursRaw?.requestedDate === selectedDateKey
      ) {
        logger.info("⚡ [Calculation] 跳过重复计算，参数未变化且日期已对齐");
        return;
      }

      logger.process("[Calculation] 开始新的计算流程", {
        coordinates: `${coordinates.latitude}, ${coordinates.longitude}`,
        selectedDate: selectedDate.toISOString(),
        timezone,
        isDefault: isDefaultCoordinates(coordinates)
      });

      // 如果不是默认坐标且时区需要更新
      if (!isDefaultCoordinates(coordinates)) {
        const newTimezone = await fetchTimezone(coordinates);
        if (isCancelled) return;

        if (newTimezone && newTimezone !== timezone) {
          logger.info("🌍 [Timezone] 时区已更新:", newTimezone);
          setTimezone(newTimezone);
          return; // 时区更新后会触发下一次useEffect
        }
      }

      // 执行行星时计算
      if (coordinates && timezone && !isTimezoneUpdating) {
        logger.info("🚀 [Calculation] 触发行星时计算", {
          coordinates: `${coordinates.latitude}, ${coordinates.longitude}`,
          timezone: timezone,
          selectedDate: selectedDate.toISOString(),
        });

        try {
          await calculate(coordinates.latitude, coordinates.longitude, selectedDate, timezone);
          calculationParamsRef.current = currentParams;

          if (!hasInitialCalculated) {
            setHasInitialCalculated(true);
          }
        } catch (error) {
          const err = error instanceof Error ? error : new Error('Unknown error');
          logger.error("❌ [计算] 计算行星小时失败", err);
          setHasInitialCalculated(false);
        }
      }
    };

    performCalculation();

    return () => {
      isCancelled = true;
    };
  }, [
    // 使用稳定的键值而不是对象引用
    coordinatesKey,
    selectedDateKey,
    timezone,
    // 添加必要的函数依赖
    coordinates,
    selectedDate,
    isDefaultCoordinates,
    fetchTimezone,
    calculate,
    setTimezone,
    hasInitialCalculated,
    isTimezoneUpdating,
    precomputed,
    planetaryHoursRaw?.requestedDate
  ]);

  // 当前小时变化时更新活动标签
  useEffect(() => {
    if (currentHour) {
      const sunrise = planetaryHoursRaw?.sunriseLocal;
      const isBeforeSunrise = sunrise ? now < sunrise : false;
      if (isBeforeSunrise) {
        setActiveTab("day");
      } else {
        setActiveTab(currentHour.type === "night" ? "night" : "day");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHour, planetaryHoursRaw?.sunriseLocal, now]);

  // 延迟加载FAQ部分 - 避免布局偏移，直接显示
  useEffect(() => {
    // 简化：直接显示FAQ，避免动态内容导致的布局偏移
    setShowFAQ(true);
  }, []);

  // 优化的事件处理函数
  const handleLocationChange = useCallback((newLocation: string) => {
    setLocation(newLocation);
  }, []);

  const handleCoordinatesUpdate = useCallback((coords: {
    latitude: number;
    longitude: number;
    source?: string;
    address?: string;
  }) => {
    const startTime = performance.now();

    // 使用 requestAnimationFrame 进行异步处理，避免阻塞主线程
    requestAnimationFrame(() => {
      try {
        const newCoordinates: Coordinates = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          source: (coords.source as Coordinates["source"]) || "input",
          address: coords.address,
        };

        logger.info("📍 [Coordinates] 坐标更新:", newCoordinates);
        setCoordinates(newCoordinates);
        setHasInitialCalculated(false); // 重置计算状态，允许新的计算
        calculationParamsRef.current = ""; // 清空参数缓存，强制重新计算

        // 性能监控（开发环境）
        if (process.env.NODE_ENV === 'development') {
          const duration = performance.now() - startTime;
          if (duration > 100) {
            logger.performance(`[INP Warning] Coordinates update took ${duration.toFixed(2)}ms`);
          }
        }
      } catch (error) {
        logger.error('Error in handleCoordinatesUpdate', error as Error);
      }
    });
  }, []);

  // 新增：城市选择回调，同时更新坐标和时区
  const handleCitySelect = useCallback((cityData: {
    latitude: number;
    longitude: number;
    timezone: string;
    displayName: string;
  }) => {
    const startTime = performance.now();


    // 使用 requestAnimationFrame 进行异步处理，避免阻塞主线程
    requestAnimationFrame(() => {
      try {
        const newCoordinates: Coordinates = {
          latitude: cityData.latitude,
          longitude: cityData.longitude,
          source: "preset" as const,
          address: cityData.displayName,
        };


        logger.info("🏙️ [CitySelect] 同时更新坐标和时区:", {
          coordinates: newCoordinates,
          timezone: cityData.timezone,
          displayName: cityData.displayName
        });

        // 1) 同时更新坐标、位置和时区，确保状态同步
        setCoordinates(newCoordinates);
        setLocation(cityData.displayName);
        setTimezone(cityData.timezone);


        // 2) 重置 selectedDate 为新时区当天中午，避免跨时区后出现"Tomorrow"错位
        try {
          const baseTime = serverTime ? new Date(serverTime) : new Date();
          const todayInNewTZStr = formatInTimeZoneDirect(baseTime, cityData.timezone, "yyyy-MM-dd");
          const middayInNewTZUtc = fromZonedTime(`${todayInNewTZStr}T12:00:00`, cityData.timezone);
          setSelectedDate(middayInNewTZUtc);
          
        } catch (err) {
          logger.error("Error computing midday for new timezone", err as Error);
        }

        setHasInitialCalculated(false);
        calculationParamsRef.current = "";


        // 性能监控（开发环境）
        if (process.env.NODE_ENV === 'development') {
          const duration = performance.now() - startTime;
          if (duration > 100) {
            logger.performance(`[INP Warning] City select took ${duration.toFixed(2)}ms`);
          }
        }
      } catch (error) {
        logger.error('Error in handleCitySelect', error as Error);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDateChange = useCallback((date: Date) => {
    logger.info("📅 [Date] 日期更新:", date.toISOString());
    setSelectedDate(date);
    calculationParamsRef.current = ""; // 清空参数缓存，强制重新计算
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTimeFormatChange = useCallback((format: "12h" | "24h") => {
    setTimeFormat(format);
  }, []);

  // 优化的渲染逻辑计算
  const renderData = useMemo(() => {
    const sunriseLocal = planetaryHoursRaw?.sunriseLocal;
    let ephemDateStr = formatInTimeZoneDirect(selectedDate, timezone, "yyyy-MM-dd");

    if (sunriseLocal) {
      const nowUtc = now;
      const nowInTzDay = formatInTimeZoneDirect(nowUtc, timezone, "yyyy-MM-dd");
      const sunriseDay = formatInTimeZoneDirect(sunriseLocal, timezone, "yyyy-MM-dd");

      if (nowInTzDay === sunriseDay && nowUtc < sunriseLocal) {
        const yesterday = subDays(sunriseLocal, 1);
        ephemDateStr = formatInTimeZoneDirect(yesterday, timezone, "yyyy-MM-dd");
      } else {
        ephemDateStr = sunriseDay;
      }
    }

    const isSameDate = formatInTimeZoneDirect(selectedDate, timezone, "yyyy-MM-dd") === ephemDateStr;
    const selectedDayRuler = planetaryHoursRaw?.dayRuler;

    return {
      sunriseLocal,
      isSameDate,
      selectedDayRuler,
      beforeSunrise: sunriseLocal ? now < sunriseLocal : false,
    };
  }, [planetaryHoursRaw, selectedDate, timezone, now]);

  return (
    <>
      <Header activePage="calculator" />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Section className="bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 md:p-8 mb-8 w-full max-w-full">
          <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-100 pb-6 mb-8">
            <div className="w-full md:w-2/5 pr-0 md:pr-6">
              {/* 页面主标题 */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-500 to-indigo-400 bg-clip-text text-transparent mb-3 md:mb-0 leading-tight overflow-hidden text-ellipsis">
                Planetary Hours Calculator
              </h1>
            </div>
            <div className="w-full md:w-3/5 mt-3 md:mt-0 md:pl-6 md:border-l border-gray-200">
              <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                Find the perfect timing for your activities based on ancient planetary wisdom.
                Enter your location and date below to get started.
              </p>
            </div>
          </div>

          {hoursError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {hoursError}
            </div>
          )}

          <div className="space-y-8">
            <div className="grid grid-cols-12 gap-4 md:gap-8">
              <div className="col-span-12 lg:col-span-8">
                <div className="space-y-6 md:space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                    <EnhancedLocationInput
                      key="location-input" // 添加稳定的key防止重复挂载
                      defaultLocation={location}
                      onLocationChange={handleLocationChange}
                      onUseCurrentLocation={handleCoordinatesUpdate}
                      onTimezoneChange={setTimezone}
                      onCitySelect={handleCitySelect}
                      aria-label="Enter location for planetary hours calculation"
                    />
                    <DateTimeInput
                      defaultDate={formatDate(selectedDate, "medium")}
                      onDateChange={handleDateChange}
                      selectedDate={selectedDate}
                      serverTime={serverTime}
                      aria-label="Select date for planetary hours calculator"
                    />
                  </div>
                  <WeekNavigation onDaySelect={handleDateChange} />
                </div>
              </div>
              <div className="col-span-12 lg:col-span-4">
                <LayoutStabilizer minHeight="180px">
                  {loading ? (
                    <CurrentHourSkeleton />
                  ) : (
                    <CurrentHourDisplay
                      currentHour={currentHour}
                      dayRuler={renderData.selectedDayRuler}
                      sunriseTime={renderData.sunriseLocal}
                      timeFormat={timeFormat}
                      isSameDate={renderData.isSameDate}
                      beforeSunrise={renderData.beforeSunrise}
                      initialHourPayload={initialHour}
                      serverTime={serverTime}
                      planetaryHoursRaw={planetaryHoursRaw}
                    />
                  )}
                </LayoutStabilizer>
              </div>
            </div>

            <div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex flex-col md:flex-row items-center justify-center md:justify-between">
                  <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-1 md:gap-2 mb-3 md:mb-0">
                    <h2 className="text-xl font-semibold text-gray-800 flex flex-wrap items-center justify-center gap-1">
                      <span>{formatDateWithTodayPrefix(selectedDate, "medium")}</span>
                      <span className="text-gray-500 hidden md:inline">•</span>
                      <span>{location}</span>
                    </h2>
                    <div className="flex items-center justify-center text-sm text-gray-500">
                      <svg
                        className="w-4 h-4 mr-1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                      <span suppressHydrationWarning={true}>
                        {timezone} (
                        {timeZoneService.getTimeZoneAbbreviation(now, timezone)}
                        ,{" "}
                        {timeZoneService.getUTCOffset(now, timezone)}
                        )
                      </span>
                    </div>
                  </div>
                  <div className="md:ml-4">
                    <TimeFormatToggle
                      format={timeFormat}
                      onFormatChange={handleTimeFormatChange}
                    />
                  </div>
                </div>
              </div>

              {/* 行星时间列表：移动端单列（可切换），桌面端双列并排 */}
              <div className="mb-4">
                {/* 移动端 Tab 切换按钮 */}
                <div className="flex md:hidden rounded-lg bg-gray-100 p-1">
                  <button
                    onClick={() => setActiveTab("day")}
                    className={`flex items-center justify-center w-1/2 py-2 text-sm font-medium rounded-md ${activeTab === "day"
                      ? "bg-white text-amber-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                      } transition-colors duration-200`}
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="5" />
                      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                    </svg>
                    Day
                  </button>
                  <button
                    onClick={() => setActiveTab("night")}
                    className={`flex items-center justify-center w-1/2 py-2 text-sm font-medium rounded-md ${activeTab === "night"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                      } transition-colors duration-200`}
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                    Night
                  </button>
                </div>

                {/* 列表区域：grid-1（移动端） / grid-2（桌面端） */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mt-4">
                  {/* Daytime list */}
                  <div
                    className={`${activeTab === "day" ? "" : "hidden"} md:block`}
                  >
                    <LayoutStabilizer minHeight="400px">
                      {showHourListLoading ? (
                        <>
                          {/* 移动端：不显示标题 */}
                          <div className="md:hidden">
                            <HoursListSkeleton title="Daytime Planetary Hours" showTitle={false} />
                          </div>
                          {/* 桌面端：显示标题 */}
                          <div className="hidden md:block">
                            <HoursListSkeleton title="Daytime Planetary Hours" showTitle={true} />
                          </div>
                        </>
                      ) : (
                        <Suspense fallback={
                          <div className="h-[400px]" style={{ minHeight: '400px' }}>
                            {/* 静默fallback，不显示loading文本 */}
                          </div>
                        }>
                          {/* 移动端：不显示标题 */}
                          <div className="md:hidden">
                            <LazyHoursList
                              title="Daytime Planetary Hours"
                              hours={daytimeHours}
                              titleColor="text-amber-600"
                              showTitle={false}
                            />
                          </div>
                          {/* 桌面端：显示标题 */}
                          <div className="hidden md:block">
                            <LazyHoursList
                              title="Daytime Planetary Hours"
                              hours={daytimeHours}
                              titleColor="text-amber-600"
                              showTitle={true}
                            />
                          </div>
                        </Suspense>
                      )}
                    </LayoutStabilizer>
                  </div>

                  {/* Nighttime list */}
                  <div
                    className={`${activeTab === "night" ? "" : "hidden"} md:block`}
                  >
                    <LayoutStabilizer minHeight="400px">
                      {showHourListLoading ? (
                        <>
                          {/* 移动端：不显示标题 */}
                          <div className="md:hidden">
                            <HoursListSkeleton title="Nighttime Planetary Hours" showTitle={false} />
                          </div>
                          {/* 桌面端：显示标题 */}
                          <div className="hidden md:block">
                            <HoursListSkeleton title="Nighttime Planetary Hours" showTitle={true} />
                          </div>
                        </>
                      ) : (
                        <Suspense fallback={
                          <div className="h-[400px]" style={{ minHeight: '400px' }}>
                            {/* 静默fallback，不显示loading文本 */}
                          </div>
                        }>
                          {/* 移动端：不显示标题 */}
                          <div className="md:hidden">
                            <LazyHoursList
                              title="Nighttime Planetary Hours"
                              hours={nighttimeHours}
                              titleColor="text-indigo-600"
                              showTitle={false}
                            />
                          </div>
                          {/* 桌面端：显示标题 */}
                          <div className="hidden md:block">
                            <LazyHoursList
                              title="Nighttime Planetary Hours"
                              hours={nighttimeHours}
                              titleColor="text-indigo-600"
                              showTitle={true}
                            />
                          </div>
                        </Suspense>
                      )}
                    </LayoutStabilizer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* 延迟加载FAQ部分 */}
        {showFAQ && (
          <Section id="faq">
            <Suspense fallback={
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="border-b border-gray-100 pb-4">
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-100 rounded w-full"></div>
                        <div className="h-4 bg-gray-100 rounded w-2/3 mt-1"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            }>
              <LazyFAQSection faqs={FAQ_DATA} />
            </Suspense>
          </Section>
        )}
      </div>
    </>
  );
}

export default function CalculatorPageOptimized({ precomputed, initialHour, serverTime, cacheControl, ttlInfo, error }: CalculatorPageOptimizedProps = {}) {
  const initialTimezone = "America/New_York";

  // 使用服务端传递的时间戳确保 SSR/CSR 一致性
  const baseTime = serverTime ? new Date(serverTime) : new Date();
  const todayNYStr = formatInTimeZoneDirect(baseTime, initialTimezone, "yyyy-MM-dd");
  const initialDate = fromZonedTime(`${todayNYStr}T12:00:00`, initialTimezone);

  return (
    <DateProvider initialDate={initialDate} initialTimezone={initialTimezone} serverTime={serverTime}>
      <CalculatorCore
        precomputed={precomputed}
        initialHour={initialHour}
        serverTime={serverTime}
        cacheControl={cacheControl}
        ttlInfo={ttlInfo}
        error={error}
      />
    </DateProvider>
  );
}
