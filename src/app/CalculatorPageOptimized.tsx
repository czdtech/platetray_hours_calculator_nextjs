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
import { LayoutStabilizer } from "@/components/Performance/LayoutStabilizer";
import { createLogger } from '@/utils/unified-logger';
import { ServerCurrentHourPayload } from '@/utils/planetaryHourHelpers';
import { getCurrentTime } from '@/utils/time';
import { reanchorSelectedDateOnTimezoneChange } from "@/utils/timezoneDates";
import type { Locale } from "@/i18n/config";
import { getMessagesSync } from "@/i18n/getMessages";

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

interface HomeFaqItem {
  question: string;
  answer: string;
}

interface CalculatorPageOptimizedProps {
  precomputed?: PlanetaryHoursCalculationResult | null;
  initialHour?: ServerCurrentHourPayload | null;
  serverTime?: string; // 服务端时间戳，确保 SSR/CSR 一致性
  cacheControl?: string; // 缓存控制头信息（当前仅透传用于调试）
  ttlInfo?: import('@/utils/cache/dynamicTTL').TTLCalculationResult; // TTL计算结果（当前仅透传用于调试）
  error?: string; // 错误信息（当前仅透传用于调试）
  locale?: Locale;
}

function CalculatorCore({
  precomputed,
  initialHour,
  serverTime,
  locale = "en",
  // 以下参数当前未在 UI 中直接使用，但保留以便未来调试和扩展
  cacheControl: _cacheControl,
  ttlInfo: _ttlInfo,
  error: _error,
}: CalculatorPageOptimizedProps) {
  const { selectedDate, timezone, setSelectedDate, setTimezone, formatDate, formatDateWithTodayPrefix } =
    useDateContext();

  const [location, setLocation] = useState("New York, NY");
  const [coordinates, setCoordinates] = useState<Coordinates>(DEFAULT_COORDINATES);
  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">("12h");
  const [isTimezoneUpdating, setIsTimezoneUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<"day" | "night">("day");
  const [hasInitialCalculated, setHasInitialCalculated] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const messages = getMessagesSync(locale);
  const faqItems = useMemo<HomeFaqItem[]>(
    () =>
      messages.home.faqItems.map((item: HomeFaqItem) => ({
        question: item.question,
        answer: item.answer,
      })),
    [messages],
  );

  // 使用useRef存储函数引用，避免依赖变化
  const lastApiCallRef = useRef<number>(0);
  const calculationParamsRef = useRef<string>("");

  // 实时更新的当前时间，用于动态显示页面日期
  const [currentTime, setCurrentTime] = useState<Date>(() => getCurrentTime(serverTime));

  // 添加定时器以实时更新时间
  useEffect(() => {
    // 立即更新一次时间（解决SSR时间不同步问题）
    setCurrentTime(new Date());
    
    // 每分钟更新一次时间
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 60秒更新一次

    // 组件卸载时清理定时器
    return () => clearInterval(interval);
  }, []);

  const applyTimezoneUpdate = useCallback((newTimezone: string, reason: string) => {
    // 统一用同一个基准时间做“今天”判断，避免 SSR/CSR 与缓存导致的错位
    const baseTime = serverTime ? new Date(serverTime) : new Date();

    const reanchored = reanchorSelectedDateOnTimezoneChange({
      selectedDateUtc: selectedDate,
      oldTimezone: timezone,
      newTimezone,
      baseTimeUtc: baseTime,
    });

    logger.info("🧭 [Timezone] 时区切换并重锚日期", {
      reason,
      from: timezone,
      to: newTimezone,
      selectedDateBefore: selectedDate.toISOString(),
      selectedDateAfter: reanchored.toISOString(),
    });

    setSelectedDate(reanchored);
    setTimezone(newTimezone);
    setHasInitialCalculated(false);
    calculationParamsRef.current = "";
  }, [serverTime, selectedDate, timezone, setSelectedDate, setTimezone]);

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
          applyTimezoneUpdate(newTimezone, "timezone-api");
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
      const isBeforeSunrise = sunrise ? currentTime < sunrise : false;
      if (isBeforeSunrise) {
        setActiveTab("day");
      } else {
        setActiveTab(currentHour.type === "night" ? "night" : "day");
      }
    }
  }, [currentHour, planetaryHoursRaw?.sunriseLocal, currentTime]);

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
  }, [serverTime, setTimezone, setSelectedDate, setCoordinates, setLocation, setHasInitialCalculated]);

  const handleDateChange = useCallback((date: Date) => {
    logger.info("📅 [Date] 日期更新:", date.toISOString());
    setSelectedDate(date);
    calculationParamsRef.current = ""; // 清空参数缓存，强制重新计算
  }, [setSelectedDate]);

  const handleTimeFormatChange = useCallback((format: "12h" | "24h") => {
    setTimeFormat(format);
  }, []);

  // 优化的渲染逻辑计算
  const renderData = useMemo(() => {
    const sunriseLocal = planetaryHoursRaw?.sunriseLocal;
    const requestedDate = planetaryHoursRaw?.requestedDate;
    
    // 简单比较：用户选择的日期与计算请求的日期是否一致
    const selectedDateStr = formatInTimeZoneDirect(selectedDate, timezone, "yyyy-MM-dd");
    const isSameDate = selectedDateStr === requestedDate;
    
    // 调试日志
    if (process.env.NODE_ENV === 'development') {
      logger.debug('[RenderData] 日期比较:', {
        selectedDateStr,
        requestedDate,
        isSameDate,
        selectedDateISO: selectedDate.toISOString(),
        timezone
      });
    }
    
    const selectedDayRuler = planetaryHoursRaw?.dayRuler;

    return {
      sunriseLocal,
      isSameDate,
      selectedDayRuler,
      beforeSunrise: sunriseLocal ? currentTime < sunriseLocal : false,
    };
  }, [planetaryHoursRaw, selectedDate, timezone, currentTime]);

  return (
    <>
      <Header activePage="calculator" locale={locale} />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Section className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 sm:p-6 md:p-8 mb-8 w-full max-w-full">
          <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-6 mb-8">
            <div className="w-full md:w-2/5 pr-0 md:pr-6">
              {/* 页面主标题 */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-500 to-indigo-400 bg-clip-text text-transparent mb-3 md:mb-0 leading-tight overflow-hidden text-ellipsis">
                {messages.home.title}
              </h1>
            </div>
            <div className="w-full md:w-3/5 mt-3 md:mt-0 md:pl-6 md:border-l border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg leading-relaxed">
                {messages.home.subtitle}
              </p>
            </div>
          </div>

          {hoursError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
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
                      onTimezoneChange={(tz) => applyTimezoneUpdate(tz, "location-input")}
                      onCitySelect={handleCitySelect}
                      locale={locale}
                      aria-label="Enter location for planetary hours calculation"
                    />
                    <DateTimeInput
                      defaultDate={formatDate(selectedDate, "medium")}
                      onDateChange={handleDateChange}
                      selectedDate={selectedDate}
                      serverTime={serverTime}
                      locale={locale}
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
                      locale={locale}
                    />
                  )}
                </LayoutStabilizer>
              </div>
            </div>

            <div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
                <div className="flex flex-col md:flex-row items-center justify-center md:justify-between">
                  <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-1 md:gap-2 mb-3 md:mb-0">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex flex-wrap items-center justify-center gap-1">
                      <span>{formatDateWithTodayPrefix(currentTime, "medium")}</span>
                      <span className="text-gray-500 dark:text-gray-400 hidden md:inline">•</span>
                      <span>{location}</span>
                    </h2>
                    <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
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
                        {timeZoneService.getTimeZoneAbbreviation(currentTime, timezone)}
                        ,{" "}
                        {timeZoneService.getUTCOffset(currentTime, timezone)}
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
                <div className="flex md:hidden rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                  <button
                    onClick={() => setActiveTab("day")}
                    className={`flex items-center justify-center w-1/2 py-2 text-sm font-medium rounded-md ${activeTab === "day"
                      ? "bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
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
                    {messages.calculator.daytime}
                  </button>
                  <button
                    onClick={() => setActiveTab("night")}
                    className={`flex items-center justify-center w-1/2 py-2 text-sm font-medium rounded-md ${activeTab === "night"
                      ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
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
                    {messages.calculator.nighttime}
                  </button>
                </div>

                {/* 列表区域：grid-1（移动端） / grid-2（桌面端） */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mt-4">
                  {/* Daytime list - 使用CSS控制标题显隐，避免重复渲染DOM */}
                  <div
                    className={`${activeTab === "day" ? "" : "hidden"} md:block`}
                  >
                    <LayoutStabilizer minHeight="400px">
                      {showHourListLoading ? (
                        <HoursListSkeleton 
                          title={messages.calculator.daytimeHours}
                          showTitle={true} 
                        />
                      ) : (
                        <Suspense fallback={
                          <div className="h-[400px]" style={{ minHeight: '400px' }} />
                        }>
                          <LazyHoursList
                            title={messages.calculator.daytimeHours}
                            hours={daytimeHours}
                            titleColor="text-amber-600"
                            showTitle={true}
                            locale={locale}
                          />
                        </Suspense>
                      )}
                    </LayoutStabilizer>
                  </div>

                  {/* Nighttime list - 使用CSS控制标题显隐，避免重复渲染DOM */}
                  <div
                    className={`${activeTab === "night" ? "" : "hidden"} md:block`}
                  >
                    <LayoutStabilizer minHeight="400px">
                      {showHourListLoading ? (
                        <HoursListSkeleton 
                          title={messages.calculator.nighttimeHours}
                          showTitle={true} 
                        />
                      ) : (
                        <Suspense fallback={
                          <div className="h-[400px]" style={{ minHeight: '400px' }} />
                        }>
                          <LazyHoursList
                            title={messages.calculator.nighttimeHours}
                            hours={nighttimeHours}
                            titleColor="text-indigo-600"
                            showTitle={true}
                            locale={locale}
                          />
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
              <LazyFAQSection
                faqs={faqItems}
                locale={locale}
                messages={messages}
                title={messages.home.faqHeading}
              />
            </Suspense>
          </Section>
        )}
      </div>
    </>
  );
}

export default function CalculatorPageOptimized({
  precomputed,
  initialHour,
  serverTime,
  cacheControl,
  ttlInfo,
  error,
  locale = "en",
}: CalculatorPageOptimizedProps = {}) {
  const initialTimezone = "America/New_York";

  // 使用服务端传递的时间戳确保 SSR/CSR 一致性
  const baseTime = serverTime ? new Date(serverTime) : new Date();
  const todayNYStr = formatInTimeZoneDirect(baseTime, initialTimezone, "yyyy-MM-dd");
  const initialDate = fromZonedTime(`${todayNYStr}T12:00:00`, initialTimezone);

  return (
    <DateProvider
      initialDate={initialDate}
      initialTimezone={initialTimezone}
      serverTime={serverTime}
      locale={locale}
    >
      <CalculatorCore
        precomputed={precomputed}
        initialHour={initialHour}
        serverTime={serverTime}
        cacheControl={cacheControl}
        ttlInfo={ttlInfo}
        error={error}
        locale={locale}
      />
    </DateProvider>
  );
}
