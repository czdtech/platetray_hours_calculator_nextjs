"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth } from "date-fns";
import { timeZoneService } from "@/services/TimeZoneService";
import { createLogger } from '@/utils/unified-logger';
import { getCurrentTime } from '@/utils/time';

const logger = createLogger('EnhancedDatePicker');

interface EnhancedDatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  timezone?: string;
  className?: string;
  placeholder?: string;
  label?: string;
  serverTime?: string; // 用于确保 SSR/CSR 一致性
}

export function EnhancedDatePicker({
  selectedDate,
  onDateChange,
  timezone = "UTC",
  className = "",
  placeholder = "Select date...",
  label = "Date",
  serverTime,
}: EnhancedDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  // 使用统一时间源，确保 SSR/CSR 一致性
  const [now] = useState<Date>(() => getCurrentTime(serverTime));

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 关闭日历当点击外部
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case "Escape":
          setIsOpen(false);
          inputRef.current?.focus();
          break;
        case "ArrowLeft":
          event.preventDefault();
          onDateChange(subDays(selectedDate, 1));
          break;
        case "ArrowRight":
          event.preventDefault();
          onDateChange(addDays(selectedDate, 1));
          break;
        case "ArrowUp":
          event.preventDefault();
          onDateChange(subDays(selectedDate, 7));
          break;
        case "ArrowDown":
          event.preventDefault();
          onDateChange(addDays(selectedDate, 7));
          break;
        case "Enter":
          event.preventDefault();
          if (hoveredDate) {
            onDateChange(hoveredDate);
            setIsOpen(false);
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedDate, hoveredDate, onDateChange]);

  const handleDateSelect = (date: Date) => {
    onDateChange(date);
    setIsOpen(false);
  };

  const handleQuickSelect = (days: number) => {
    const startTime = performance.now();

    // 使用 requestAnimationFrame 进行异步处理，避免阻塞主线程
    requestAnimationFrame(() => {
      try {
        // 获取当前时区的今天日期
        const todayInTimezone = timeZoneService.utcToZonedTime(now, timezone);
        // 设置为指定天数后的开始时间
        todayInTimezone.setDate(todayInTimezone.getDate() + days);
        todayInTimezone.setHours(0, 0, 0, 0);
        // 转换回 UTC 时间
        const utcDate = timeZoneService.zonedTimeToUtc(todayInTimezone, timezone);

        // 使用异步调用来避免阻塞
        setTimeout(() => {
          onDateChange(utcDate);

          // 性能监控（开发环境）
          if (process.env.NODE_ENV === 'development') {
            const duration = performance.now() - startTime;
            if (duration > 100) {
              logger.performance(`[INP Warning] Date picker quick select took ${duration.toFixed(2)}ms`);
            }
          }
        }, 0);

      } catch (error) {
        logger.error('Error in handleQuickSelect', error as Error);
      }
    });
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = direction === "prev"
      ? subDays(currentMonth, 30)
      : addDays(currentMonth, 30);
    setCurrentMonth(newMonth);
  };

  const generateCalendarDays = () => {
    const start = startOfWeek(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1));
    const end = endOfWeek(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0));
    return eachDayOfInterval({ start, end });
  };

  const formatDisplayDate = (date: Date) => {
    return format(date, "MMMM d, yyyy");
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* 标签 */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      {/* 输入框 */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={formatDisplayDate(selectedDate)}
          placeholder={placeholder}
          readOnly
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98] ${isOpen ? "ring-2 ring-purple-500/30 border-purple-500" : ""
            }`}
        />

        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <Calendar
            size={20}
            className={`transition-colors duration-200 ${isOpen ? "text-purple-500" : "text-gray-400 dark:text-gray-500"
              }`}
          />
        </div>
      </div>

      {/* 日历弹出层 */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
          {/* 快捷选择 - 只在选中今天时显示 */}
          {(() => {
            // 检查选中的日期是否为用户时区的今天
            const todayInTimezone = timeZoneService.utcToZonedTime(now, timezone);
            const selectedInTimezone = timeZoneService.utcToZonedTime(selectedDate, timezone);

            // 比较日期部分（忽略时间）
            const isSelectedToday =
              todayInTimezone.getFullYear() === selectedInTimezone.getFullYear() &&
              todayInTimezone.getMonth() === selectedInTimezone.getMonth() &&
              todayInTimezone.getDate() === selectedInTimezone.getDate();

            return isSelectedToday ? (
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleQuickSelect(0)}
                    className="px-3 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg transition-colors duration-150 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => handleQuickSelect(-1)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors duration-150 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500/30"
                  >
                    Yesterday
                  </button>
                  <button
                    onClick={() => handleQuickSelect(1)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors duration-150 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500/30"
                  >
                    Tomorrow
                  </button>
                </div>
              </div>
            ) : null;
          })()}

          {/* 日历头部 */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth("prev")}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 active:scale-95 transform hover:shadow-sm"
              >
                <ChevronLeft size={18} className="text-gray-600 dark:text-gray-400" />
              </button>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {format(currentMonth, "MMMM yyyy")}
              </h3>

              <button
                onClick={() => navigateMonth("next")}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 active:scale-95 transform hover:shadow-sm"
              >
                <ChevronRight size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* 星期标题 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="h-8 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 日期网格 */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date) => {
                const isSelected = isSameDay(date, selectedDate);
                // 使用时区来判断是否为今天
                const todayInTimezone = timeZoneService.utcToZonedTime(now, timezone);
                const isTodayDate = isSameDay(date, todayInTimezone);
                const isCurrentMonth = isSameMonth(date, currentMonth);
                const isHovered = hoveredDate && isSameDay(date, hoveredDate);
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => handleDateSelect(date)}
                    onMouseEnter={() => setHoveredDate(date)}
                    onMouseLeave={() => setHoveredDate(null)}
                    className={`
                      h-10 w-10 rounded-lg text-sm font-medium transition-all duration-200 relative transform
                      ${isSelected
                        ? "bg-purple-600 text-white shadow-lg scale-105"
                        : isHovered
                          ? "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 scale-105 shadow-md"
                          : isTodayDate
                            ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-2 border-amber-400 hover:scale-105"
                            : isCurrentMonth
                              ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105 hover:shadow-sm"
                              : "text-gray-400 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 hover:scale-105"
                      }
                      ${isWeekend && isCurrentMonth ? "text-red-600 dark:text-red-400" : ""}
                      active:scale-95
                    `}
                  >
                    {format(date, "d")}

                    {/* 今天指示器 */}
                    {isTodayDate && !isSelected && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-amber-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 底部信息 */}
          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>Timezone: {timezone}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={12} />
                <span>Use arrow keys to navigate</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
