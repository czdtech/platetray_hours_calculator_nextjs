"use client";

import { useState, useEffect, Suspense, lazy } from "react";
import { DateProvider, useDateContext } from "@/contexts/DateContext";
import { usePlanetaryHours } from "@/hooks/usePlanetaryHours";
import { Header } from "@/components/Layout/Header";
import { LocationInput } from "@/components/Calculator/LocationInput";
import { DateTimeInput } from "@/components/Calculator/DateTimeInput";
import { CurrentHourDisplay } from "@/components/Calculator/CurrentHourDisplay";
import { WeekNavigation } from "@/components/Calculator/WeekNavigation";
import { TimeFormatToggle } from "@/components/Calculator/TimeFormatToggle";
import { HoursListSkeleton } from "@/components/Skeleton/HoursListSkeleton";
import { CurrentHourSkeleton } from "@/components/Skeleton/CurrentHourSkeleton";
import { Section } from "@/components/semantic/Section";
import { timeZoneService } from "@/services/TimeZoneService";
import { formatInTimeZone as formatInTimeZoneDirect } from "date-fns-tz";
import { subDays } from "date-fns";

// 懒加载非关键组件
const LazyHoursList = lazy(() => import("@/components/Calculator/HoursList").then(module => ({ default: module.HoursList })));
const LazyFAQSection = lazy(() => import("@/components/FAQ/FAQSection").then(module => ({ default: module.FAQSection })));

// 导入全局行星颜色常量
import { PLANET_COLOR_CLASSES as _PLANET_COLOR_CLASSES, PLANET_SYMBOLS as _PLANET_SYMBOLS } from "@/constants/planetColors";

interface Coordinates {
  latitude: number;
  longitude: number;
  source: "browser" | "input" | "geocode" | "autocomplete";
  address?: string;
}

function CalculatorCore() {
  const { selectedDate, timezone, setSelectedDate, setTimezone, formatDate } =
    useDateContext();

  const [location, setLocation] = useState("New York, NY");
  const [coordinates, setCoordinates] = useState<Coordinates>({
    latitude: 40.7128,
    longitude: -74.006,
    source: "input",
  });
  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">("24h");
  const [isTimezoneUpdating, setIsTimezoneUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<"day" | "night">("day");
  const [hasInitialCalculated, setHasInitialCalculated] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);

  const {
    planetaryHoursRaw,
    currentHour,
    daytimeHours,
    nighttimeHours,
    isLoading: isLoadingHours,
    error: hoursError,
    calculate,
  } = usePlanetaryHours(timeFormat);

  const loading = isLoadingHours || isTimezoneUpdating;

  // ---- EFFECTS ----
  // 初始计算：使用默认坐标和时区进行第一次计算
  useEffect(() => {
    // 如果有默认坐标和时区，且还没有进行过初始计算，立即进行第一次计算
    if (
      coordinates &&
      timezone &&
      !hasInitialCalculated &&
      !isTimezoneUpdating
    ) {
      console.log("🚀 [Initial] 使用默认数据进行初始计算", {
        coordinates: `${coordinates.latitude}, ${coordinates.longitude}`,
        timezone,
        selectedDate: selectedDate.toISOString(),
      });
      calculate(
        coordinates.latitude,
        coordinates.longitude,
        selectedDate,
        timezone,
      );
      setHasInitialCalculated(true);
    }
  }, [
    coordinates,
    timezone,
    selectedDate,
    hasInitialCalculated,
    isTimezoneUpdating,
    calculate,
  ]); // 依赖这些变量的变化

  useEffect(() => {
    if (currentHour) {
      const sunrise = planetaryHoursRaw?.sunriseLocal;
      const isBeforeSunrise = sunrise ? new Date() < sunrise : false;
      if (isBeforeSunrise) {
        setActiveTab("day");
      } else {
        setActiveTab(currentHour.type === "night" ? "night" : "day");
      }
    }
  }, [currentHour, planetaryHoursRaw]);

  // 与旧版本保持一致的时区获取逻辑
  useEffect(() => {
    const fetchTimezone = async () => {
      if (coordinates) {
        // 如果是默认的纽约坐标，直接使用默认时区，避免API调用
        const isDefaultCoordinates =
          coordinates.latitude === 40.7128 &&
          coordinates.longitude === -74.006 &&
          coordinates.source === "input";

        if (isDefaultCoordinates) {
          console.log("🏠 [Timezone] 使用默认坐标，跳过API调用，使用默认时区");
          setIsTimezoneUpdating(false);
          return;
        }

        try {
          // Mark timezone as updating
          setIsTimezoneUpdating(true);

          const timestamp = Math.floor(Date.now() / 1000);
          const response = await fetch(
            `/api/maps/timezone?location=${coordinates.latitude},${coordinates.longitude}&timestamp=${timestamp}`,
          );
          const data = await response.json();
          if (data.status === "OK") {
            setTimezone(data.timeZoneId);

            // 日志：完成时区更新后立即重新计算行星时
            console.log("✅ [Timezone] 时区获取完成，开始重新计算行星时间");
            calculate(
              coordinates.latitude,
              coordinates.longitude,
              selectedDate,
              data.timeZoneId,
            );
          }

          // Mark timezone update as complete
          setIsTimezoneUpdating(false);
        } catch (error) {
          console.error("Error fetching timezone:", error);
          // Also mark as complete in case of error
          setIsTimezoneUpdating(false);
        }
      }
    };

    fetchTimezone();
  }, [coordinates, selectedDate, setTimezone, calculate]);

  // 当用户仅修改日期时重新计算（坐标和时区已就绪）
  useEffect(() => {
    if (!isTimezoneUpdating && coordinates && timezone) {
      calculate(
        coordinates.latitude,
        coordinates.longitude,
        selectedDate,
        timezone,
      );
    }
  }, [selectedDate, calculate, coordinates, isTimezoneUpdating, timezone]);

  // 延迟加载FAQ部分
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFAQ(true);
    }, 2000); // 2秒后加载FAQ

    return () => clearTimeout(timer);
  }, []);

  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation);
  };

  const handleCoordinatesUpdate = (coords: {
    latitude: number;
    longitude: number;
    source?: string;
    address?: string;
  }) => {
    // Mark timezone as updating
    setIsTimezoneUpdating(true);

    setCoordinates({
      latitude: coords.latitude,
      longitude: coords.longitude,
      source: (coords.source as Coordinates["source"]) || "input",
      address: coords.address,
    });
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleTimeFormatChange = (format: "12h" | "24h") => {
    setTimeFormat(format);
  };

  // ---- RENDER LOGIC ----
  // 移除本地的 planetColors 和 planetSymbols 定义

  // Determine date for display in CurrentHourDisplay (pre-sunrise logic)
  const sunriseLocal = planetaryHoursRaw?.sunriseLocal;
  let ephemDateStr = formatInTimeZoneDirect(
    selectedDate,
    timezone,
    "yyyy-MM-dd",
  );

  if (sunriseLocal) {
    const nowUtc = new Date();
    const nowInTzDay = formatInTimeZoneDirect(nowUtc, timezone, "yyyy-MM-dd");
    const sunriseDay = formatInTimeZoneDirect(
      sunriseLocal,
      timezone,
      "yyyy-MM-dd",
    );

    // 如果当前仍在日出之前，则行星时归属前一天
    if (nowInTzDay === sunriseDay && nowUtc < sunriseLocal) {
      const yesterday = subDays(sunriseLocal, 1);
      ephemDateStr = formatInTimeZoneDirect(yesterday, timezone, "yyyy-MM-dd");
    } else {
      ephemDateStr = sunriseDay;
    }
  }

  const isSameDate =
    formatInTimeZoneDirect(selectedDate, timezone, "yyyy-MM-dd") ===
    ephemDateStr;
  const selectedDayRuler = planetaryHoursRaw?.dayRuler;

  // FAQ数据
  const faqs = [
    {
      question: "How are planetary hours calculated?",
      answer:
        'Planetary hours are calculated by dividing the time between sunrise and sunset (for daytime hours) and sunset and the next sunrise (for nighttime hours) into 12 equal parts. The length of these "hours" varies depending on the season and latitude.',
    },
    {
      question: "Why are the hours not exactly 60 minutes long?",
      answer:
        "Because the length of daylight and nighttime changes throughout the year, the duration of each planetary hour also changes. They are only close to 60 minutes near the equinoxes.",
    },
    {
      question: "Do I need to know my exact sunrise/sunset times?",
      answer:
        "No, this calculator handles that automatically based on the location and date you provide. It uses precise astronomical calculations.",
    },
    {
      question: "Which planets are used?",
      answer:
        "The system uses the seven traditional astrological planets: Sun, Moon, Mercury, Venus, Mars, Jupiter, and Saturn. Uranus, Neptune, and Pluto are not part of this traditional system.",
    },
    {
      question: "Is this scientifically proven?",
      answer:
        "Planetary hours are part of traditional astrology and are not based on modern scientific principles. They are used as a symbolic or spiritual timing system by those who follow these traditions.",
    },
    {
      question: "How accurate is the location detection?",
      answer:
        "If you allow location access, the calculator uses your browser's geolocation capabilities, which are generally quite accurate for determining sunrise/sunset times. You can also manually enter any location worldwide.",
    },
    {
      question: "Why do summer and winter hours differ in length?",
      answer:
        "Because planetary hours divide sunrise-to-sunset into 12 slices, the length of each slice stretches in summer and shrinks in winter. Near the equator they stay close to 60 minutes all year.",
    },
    {
      question: 'Why is it still "night hours" before today\'s sunrise?',
      answer:
        "By tradition the planetary day starts at sunrise. Any time before sunrise belongs to the previous night set, even if the clock shows 3 AM of the new calendar date.",
    },
    {
      question: "How do I choose the best hour for my task?",
      answer:
        "Match the symbolism: Venus for love or art, Mercury for emails or study, Mars for workouts or assertive action. Use our cheat-sheet or hover tips for quick guidance.",
    },
  ];

  return (
    <>
      <Header activePage="calculator" />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Section className="bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 md:p-8 mb-8 w-full max-w-full">
          <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-100 pb-6 mb-8">
            <div className="w-full md:w-2/5 pr-0 md:pr-6">
              {/* 页面唯一主标题 */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-500 to-indigo-400 bg-clip-text text-transparent mb-3 md:mb-0 leading-tight overflow-hidden text-ellipsis">
                Find Your Planetary Hours
              </h1>
            </div>
            <div className="w-full md:w-3/5 mt-3 md:mt-0 md:pl-6 md:border-l border-gray-200">
              <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                Discover the perfect time for your activities based on ancient
                planetary wisdom.
              </p>
            </div>
          </div>

          {hoursError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {hoursError}
            </div>
          )}

          {loading && (
            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg text-purple-700">
              Calculating planetary hours...
            </div>
          )}

          <div className="space-y-8">
            <div className="grid grid-cols-12 gap-4 md:gap-8">
              <div className="col-span-12 lg:col-span-8">
                <div className="space-y-6 md:space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                    <LocationInput
                      defaultLocation={location}
                      onLocationChange={handleLocationChange}
                      onUseCurrentLocation={handleCoordinatesUpdate}
                    />
                    <DateTimeInput
                      defaultDate={formatDate(selectedDate, "medium")}
                      onDateChange={handleDateChange}
                      selectedDate={selectedDate}
                    />
                  </div>
                  <WeekNavigation onDaySelect={handleDateChange} />
                </div>
              </div>
              <div className="col-span-12 lg:col-span-4">
                {loading ? (
                  <CurrentHourSkeleton />
                ) : (
                  <CurrentHourDisplay
                    currentHour={currentHour}
                    dayRuler={selectedDayRuler}
                    sunriseTime={sunriseLocal}
                    timeFormat={timeFormat}
                    isSameDate={isSameDate}
                    beforeSunrise={
                      sunriseLocal ? new Date() < sunriseLocal : false
                    }
                  />
                )}
              </div>
            </div>

            <div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex flex-col md:flex-row items-center justify-center md:justify-between">
                  <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-1 md:gap-2 mb-3 md:mb-0">
                    <h2 className="text-xl font-semibold text-gray-800 flex flex-wrap items-center justify-center gap-1">
                      <span>{formatDate(selectedDate, "medium")}</span>
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
                      <span>
                        {timezone} (
                        {timeZoneService.getTimeZoneAbbreviation(
                          new Date(),
                          timezone,
                        )}
                        ,{" "}
                        {timeZoneService.formatInTimeZone(
                          new Date(),
                          timezone,
                          "z",
                        )}
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
                    >
                      <circle cx="12" cy="12" r="5" />
                      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                    </svg>
                    Daytime Hours
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
                    >
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                    Nighttime Hours
                  </button>
                </div>

                {/* 列表区域：grid-1（移动端） / grid-2（桌面端） */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mt-4">
                  {/* Daytime list */}
                  <div
                    className={`${activeTab === "day" ? "" : "hidden"} md:block`}
                  >
                    {loading ? (
                      <HoursListSkeleton title="Daytime Hours" />
                    ) : (
                      <Suspense fallback={<HoursListSkeleton title="Daytime Hours" />}>
                        <LazyHoursList
                          title="Daytime Hours"
                          hours={daytimeHours}
                          titleColor="text-amber-600"
                        />
                      </Suspense>
                    )}
                  </div>

                  {/* Nighttime list */}
                  <div
                    className={`${activeTab === "night" ? "" : "hidden"} md:block`}
                  >
                    {loading ? (
                      <HoursListSkeleton title="Nighttime Hours" />
                    ) : (
                      <Suspense fallback={<HoursListSkeleton title="Nighttime Hours" />}>
                        <LazyHoursList
                          title="Nighttime Hours"
                          hours={nighttimeHours}
                          titleColor="text-indigo-600"
                        />
                      </Suspense>
                    )}
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
              <LazyFAQSection faqs={faqs} />
            </Suspense>
          </Section>
        )}
      </div>
    </>
  );
}

export default function CalculatorPageOptimized() {
  const initialDate = new Date();
  const initialTimezone = "America/New_York";

  return (
    <DateProvider initialDate={initialDate} initialTimezone={initialTimezone}>
      <CalculatorCore />
    </DateProvider>
  );
}