"use client";

import { useDateContext } from "@/contexts/DateContext";
import { useRef, useEffect, useCallback } from "react";
import {
  PLANET_COLOR_CLASSES,
  PLANET_COLOR_HEX,
} from "@/constants/planetColors";

interface WeekNavigationProps {
  onDaySelect: (date: Date) => void;
}

export function WeekNavigation({ onDaySelect }: WeekNavigationProps) {
  const { weekDays, selectedDate, setSelectedDate } = useDateContext();
  const activeButtonRef = useRef<HTMLButtonElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 使激活按钮水平居中（在滚动容器范围内）
  const centerActiveButton = () => {
    const container = scrollContainerRef.current;
    const button = activeButtonRef.current;

    if (container && button) {
      // 计算希望滚动到的位置：按钮左侧距离 - 一半容器宽度 + 按钮宽度一半
      let targetScrollLeft =
        button.offsetLeft - container.clientWidth / 2 + button.clientWidth / 2;

      // 限制到可滚动范围内
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      targetScrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScrollLeft));

      container.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
    }
  };

  // 每当选中日期变化，在移动端将其居中
  useEffect(() => {
    if (window.innerWidth < 768) {
      requestAnimationFrame(() => centerActiveButton());
    }
  }, [selectedDate]);

  // 用户点击时也居中
  const handleDaySelect = useCallback((date: Date) => {
    const startTime = performance.now();

    // 使用 requestAnimationFrame 进行异步处理，避免阻塞主线程
    requestAnimationFrame(() => {
      try {
        setSelectedDate(date);
        onDaySelect(date);

        // 移动端居中逻辑
        if (window.innerWidth < 768) {
          requestAnimationFrame(() => centerActiveButton());
        }

        // 性能监控（开发环境）
        if (process.env.NODE_ENV === 'development') {
          const duration = performance.now() - startTime;
          if (duration > 100) {
            console.warn(`⚡ [INP Warning] Week navigation took ${duration.toFixed(2)}ms`);
          }
        }
      } catch (error) {
        console.error('Error in handleDaySelect:', error);
      }
    });
  }, [setSelectedDate, onDaySelect]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden relative">
      {/* 左右渐变遮罩，仅移动端显示 */}
      <div className="hidden md:block" />
      <div className="block md:hidden pointer-events-none">
        {/* 左遮罩 */}
        <div className="absolute left-0 top-0 h-full w-6 z-10 bg-gradient-to-r from-white via-white/80 to-transparent" />
        {/* 右遮罩 */}
        <div className="absolute right-0 top-0 h-full w-6 z-10 bg-gradient-to-l from-white via-white/80 to-transparent" />
      </div>
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* 移动端flex可滚动，大屏grid等分 */}
        <div className="flex md:grid md:grid-cols-7 divide-x divide-gray-100 min-w-max md:min-w-0">
          {weekDays.map((day, index) => {
            const isActive = day.active;
            // 获取当前行星的颜色值
            const planetColor =
              PLANET_COLOR_HEX[day.planet as keyof typeof PLANET_COLOR_HEX];
            const planetColorClass =
              PLANET_COLOR_CLASSES[
              day.planet as keyof typeof PLANET_COLOR_CLASSES
              ];

            return (
              <button
                key={index}
                onClick={() => handleDaySelect(day.date)}
                ref={isActive ? activeButtonRef : null}
                className={`
                  group relative py-4 transition-all duration-200 ease-in-out
                  min-w-[4.5rem] md:min-w-0 md:w-full flex-shrink-0
                  ${isActive
                    ? "bg-purple-50 hover:bg-purple-100 shadow-sm"
                    : "hover:bg-gray-50 hover:shadow-sm active:bg-gray-100"
                  }
                  hover:scale-105 transform origin-center
                  active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500/30
                `}
              >
                <div className="flex flex-col items-center space-y-1.5">
                  <span
                    className={`text-sm font-medium 
                    ${isActive ? "text-purple-700" : "text-gray-600"}`}
                  >
                    {day.name.slice(0, 3)}
                  </span>
                  <div
                    className={`text-2xl ${isActive ? "text-purple-500" : planetColorClass}`}
                    style={{ color: isActive ? undefined : planetColor }}
                  >
                    <span aria-label={`Planet symbol for ${day.planet}`}>
                      {day.symbol}
                    </span>
                  </div>
                  <span
                    className={`text-xs 
                    ${isActive ? "text-purple-600" : "text-gray-500"}`}
                  >
                    {day.displayDate}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
