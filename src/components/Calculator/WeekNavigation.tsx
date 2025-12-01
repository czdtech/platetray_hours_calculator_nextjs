"use client";

import React from "react";
import { useDateContext } from "@/contexts/DateContext";
import { useRef, useEffect, useCallback, useMemo } from "react";
import {
  PLANET_COLOR_CLASSES,
  PLANET_COLOR_HEX,
} from "@/constants/planetColors";
import { createLogger } from '@/utils/unified-logger';

const logger = createLogger('WeekNavigation');

interface WeekNavigationProps {
  onDaySelect: (date: Date) => void;
}

interface WeekNavigationButtonProps {
  day: {
    date: Date;
    displayDate: string;
    name: string;
    planet: string;
    symbol: string;
    active: boolean;
  };
  isActive: boolean;
  onDaySelect: (date: Date) => void;
}

// 将按钮逻辑分离为单独组件，避免渲染过程中的动态计算
const WeekNavigationButton = React.memo(React.forwardRef<HTMLButtonElement, WeekNavigationButtonProps>(
  ({ day, isActive, onDaySelect }, ref) => {
    // 预先计算所有 className，确保 SSR/CSR 一致性
    const buttonClassName = useMemo(() => {
      const classes = [
        "group relative py-4 transition-all duration-200 ease-in-out",
        "min-w-[4.5rem] md:min-w-0 md:w-full flex-shrink-0",
        "hover:scale-105 transform origin-center active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-purple-500/30",
        isActive
          ? "bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 shadow-sm"
          : "hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:shadow-sm active:bg-gray-100 dark:active:bg-gray-700"
      ];
      return classes.join(" ");
    }, [isActive]);

    const textClassName = useMemo(() => {
      const classes = [
        "text-sm font-medium",
        isActive ? "text-purple-700 dark:text-purple-400" : "text-gray-600 dark:text-gray-300"
      ];
      return classes.join(" ");
    }, [isActive]);

    const dateClassName = useMemo(() => {
      const classes = [
        "text-xs",
        isActive ? "text-purple-600 dark:text-purple-400" : "text-gray-500 dark:text-gray-400"
      ];
      return classes.join(" ");
    }, [isActive]);

    const { planetColorClass, planetColor } = useMemo(() => {
      const colorClass = PLANET_COLOR_CLASSES[day.planet as keyof typeof PLANET_COLOR_CLASSES];
      const color = PLANET_COLOR_HEX[day.planet as keyof typeof PLANET_COLOR_HEX];
      return { planetColorClass: colorClass, planetColor: color };
    }, [day.planet]);

    const iconClassName = useMemo(() => {
      const classes = [
        "text-2xl",
        isActive ? "text-purple-500 dark:text-purple-400" : planetColorClass
      ];
      return classes.join(" ");
    }, [isActive, planetColorClass]);

    const handleClick = useCallback(() => {
      onDaySelect(day.date);
    }, [day.date, onDaySelect]);

    return (
      <button
        ref={ref}
        onClick={handleClick}
        className={buttonClassName}
      >
        <div className="flex flex-col items-center space-y-1.5">
          <span className={textClassName}>
            {day.name.slice(0, 3)}
          </span>
          <div
            className={iconClassName}
            style={{ color: isActive ? undefined : planetColor }}
          >
            <span aria-label={`Planet symbol for ${day.planet}`}>
              {day.symbol}
            </span>
          </div>
          <span className={dateClassName}>
            {day.displayDate}
          </span>
        </div>
      </button>
    );
  }
));

export function WeekNavigation({ onDaySelect }: WeekNavigationProps) {
  const { weekDays, selectedDate, setSelectedDate } = useDateContext();
  const activeButtonRef = useRef<HTMLButtonElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 调试：检查 weekDays 数据
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug('WeekNavigation weekDays:', {
        weekDaysLength: weekDays.length,
        selectedDate: selectedDate.toISOString(),
        weekDays: weekDays.map(day => ({
          name: day.name,
          displayDate: day.displayDate,
          active: day.active,
          planet: day.planet
        }))
      });
    }
  }, [weekDays, selectedDate]);

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
    // 安全检查：确保在客户端环境
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
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

        // 移动端居中逻辑（安全检查：确保在客户端环境）
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
          requestAnimationFrame(() => centerActiveButton());
        }

        // 性能监控（开发环境）
        if (process.env.NODE_ENV === 'development') {
          const duration = performance.now() - startTime;
          if (duration > 100) {
            logger.performance(`[INP Warning] Week navigation took ${duration.toFixed(2)}ms`);
          }
        }
      } catch (error) {
        logger.error('Error in handleDaySelect', error as Error);
      }
    });
  }, [setSelectedDate, onDaySelect]);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden relative">
      {/* 左右渐变遮罩，仅移动端显示 - 使用更窄的宽度避免遮挡首尾内容 */}
      <div className="block md:hidden pointer-events-none">
        {/* 左遮罩 - 减小宽度并降低不透明度 */}
        <div className="absolute left-0 top-0 h-full w-3 z-10 bg-gradient-to-r from-white/90 dark:from-gray-800/90 to-transparent" />
        {/* 右遮罩 - 减小宽度并降低不透明度 */}
        <div className="absolute right-0 top-0 h-full w-3 z-10 bg-gradient-to-l from-white/90 dark:from-gray-800/90 to-transparent" />
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
        <div className="flex md:grid md:grid-cols-7 divide-x divide-gray-100 dark:divide-gray-700 min-w-max md:min-w-0">
          {weekDays.map((day, index) => {
            const isActive = day.active;

            return (
              <WeekNavigationButton
                key={index}
                day={day}
                isActive={isActive}
                onDaySelect={handleDaySelect}
                ref={isActive ? activeButtonRef : null}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
