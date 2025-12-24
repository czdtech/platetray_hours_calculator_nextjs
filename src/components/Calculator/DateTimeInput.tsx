"use client";

import { useRef, useId, useState, useCallback, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./DateTimeInput.css"; // 导入自定义样式
import { useDateContext } from "@/contexts/DateContext";
import { createLogger } from '@/utils/unified-logger';
import { getCurrentTime } from '@/utils/time';

const logger = createLogger('DateTimeInput');

interface DateTimeInputProps {
  defaultDate: string;
  onDateChange: (date: Date) => void;
  selectedDate: Date;
  serverTime?: string; // 用于确保 SSR/CSR 一致性
}

export function DateTimeInput({
  defaultDate,
  onDateChange,
  selectedDate,
  serverTime,
}: DateTimeInputProps) {
  const { utcToZonedTime, zonedTimeToUtc } = useDateContext();
  const [isOpen, setIsOpen] = useState(false);

  const datePickerRef = useRef<DatePicker>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  // 使用统一时间源初始化，挂载后切换到实时更新时间（避免缓存/时区切换导致“Today/Tomorrow”错位）
  const [now, setNow] = useState<Date>(() => getCurrentTime(serverTime));
  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Convert UTC date to zoned date for DatePicker
  const zonedDate = utcToZonedTime(selectedDate);

  // 计算哪个日期按钮应该被选中
  const getSelectedDateType = useCallback(() => {
    const todayInTimezone = utcToZonedTime(now);
    const selectedInTimezone = utcToZonedTime(selectedDate);

    // 比较日期部分（忽略时间）
    const todayDateStr = todayInTimezone.toDateString();
    const selectedDateStr = selectedInTimezone.toDateString();

    // 计算昨天
    const yesterday = new Date(todayInTimezone);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDateStr = yesterday.toDateString();

    // 计算明天
    const tomorrow = new Date(todayInTimezone);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDateStr = tomorrow.toDateString();

    if (selectedDateStr === todayDateStr) {
      return 'today';
    } else if (selectedDateStr === yesterdayDateStr) {
      return 'yesterday';
    } else if (selectedDateStr === tomorrowDateStr) {
      return 'tomorrow';
    }

    return null;
  }, [selectedDate, utcToZonedTime, now]);

  // 优化快捷选择按钮的性能处理
  const handleQuickSelect = useCallback((days: number) => {
    const startTime = performance.now();

    // 使用 requestAnimationFrame 进行异步处理，避免阻塞主线程
    requestAnimationFrame(() => {
      try {
        // 获取当前时区的今天日期
        const todayInTimezone = utcToZonedTime(now);

        // 设置为指定天数后的日期，并固定到本地中午 12:00，
        // 避免在 UTC <-> Local 转换时因负时区造成日期回退
        todayInTimezone.setDate(todayInTimezone.getDate() + days);
        todayInTimezone.setHours(12, 0, 0, 0);

        // 转换回 UTC 时间（此时确保仍处于同一"本地日"）
        const utcDate = zonedTimeToUtc(todayInTimezone);

        // 使用异步调用来避免阻塞
        setTimeout(() => {
          onDateChange(utcDate);

          // 性能监控（开发环境）
          if (process.env.NODE_ENV === 'development') {
            const duration = performance.now() - startTime;
            if (duration > 100) {
              logger.performance(`[INP Warning] Quick select took ${duration.toFixed(2)}ms`);
            }
          }
        }, 0);

      } catch (error) {
        logger.error('Error in handleQuickSelect', error as Error);
      }
    });
  }, [utcToZonedTime, zonedTimeToUtc, onDateChange, now]);

  const handleDateChange = (date: Date | null) => {
    if (date) {
      // 将选中日期固定到本地中午 12:00 再转换，避免跨 UTC 日期错位
      const localMidday = new Date(date);
      localMidday.setHours(12, 0, 0, 0);

      // Convert selected date to UTC date
      const utcDate = zonedTimeToUtc(localMidday);
      // Call the callback function
      onDateChange(utcDate);
      setIsOpen(false);
    }
  };

  const handleInputClick = () => {
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const handleCalendarClose = () => {
    setIsOpen(false);
  };

  const handleCalendarOpen = () => {
    setIsOpen(true);
  };

  // 自定义导航组件
  const CustomHeader = ({
    date,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
  }: {
    date: Date;
    decreaseMonth: () => void;
    increaseMonth: () => void;
    prevMonthButtonDisabled: boolean;
    nextMonthButtonDisabled: boolean;
  }) => (
    <div className="flex items-center justify-between px-2 py-1">
      <button
        type="button"
        onClick={decreaseMonth}
        disabled={prevMonthButtonDisabled}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-95 transform hover:shadow-sm"
        aria-label="Previous month"
      >
        <ChevronLeft size={16} className="text-gray-600 dark:text-gray-300" />
      </button>

      <div className="font-semibold text-gray-900 dark:text-gray-100">
        {date.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric'
        })}
      </div>

      <button
        type="button"
        onClick={increaseMonth}
        disabled={nextMonthButtonDisabled}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-95 transform hover:shadow-sm"
        aria-label="Next month"
      >
        <ChevronRight size={16} className="text-gray-600 dark:text-gray-300" />
      </button>
    </div>
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Date
        </label>

        {/* 快捷选择按钮 - 优化性能和响应式 */}
        <div className="flex gap-1 sm:gap-1.5 flex-shrink-0">
          {[
            { days: 0, label: 'Today', shortLabel: 'Tod', type: 'today' },
            { days: -1, label: 'Yesterday', shortLabel: 'Yes', type: 'yesterday' },
            { days: 1, label: 'Tomorrow', shortLabel: 'Tom', type: 'tomorrow' }
          ].map((dateButton) => {
            const isSelected = getSelectedDateType() === dateButton.type;
            const isToday = dateButton.type === 'today';

            return (
              <button
                key={dateButton.type}
                type="button"
                onClick={() => handleQuickSelect(dateButton.days)}
                className={`px-1.5 sm:px-2.5 py-1 text-[10px] sm:text-xs font-medium rounded-md transition-all duration-200 ease-in-out border hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 transform whitespace-nowrap ${isSelected
                  ? 'text-white bg-purple-600 dark:bg-purple-500 border-purple-600 dark:border-purple-500 shadow-md ring-2 ring-purple-400 dark:ring-purple-300'
                  : isToday
                    ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 border-purple-200 dark:border-purple-700 hover:scale-105 active:scale-95'
                    : 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600 hover:scale-105 active:scale-95'
                  }`}
                aria-label={`Select ${dateButton.label.toLowerCase()}`}
                aria-pressed={isSelected}
              >
                {/* 在<640px屏幕显示缩写，>=640px显示完整文本 */}
                <span className="inline sm:hidden">{dateButton.shortLabel}</span>
                <span className="hidden sm:inline">{dateButton.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="relative">
        <DatePicker
          ref={datePickerRef}
          id={inputId}
          name="date"
          selected={zonedDate}
          onChange={handleDateChange}
          onCalendarClose={handleCalendarClose}
          onCalendarOpen={handleCalendarOpen}
          dateFormat="MMMM d, yyyy"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 pl-4 pr-10 cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transform"
          wrapperClassName="w-full"
          popperClassName="z-[100]"
          popperPlacement="bottom-start"
          open={isOpen}
          renderCustomHeader={CustomHeader}
          showPopperArrow={false}
          customInput={
            <input
              ref={inputRef}
              id={inputId}
              name="date"
              type="text"
              aria-label="Select date"
              value={defaultDate}
              placeholder="Select date..."
              readOnly
              onClick={handleInputClick}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 pl-4 pr-10 cursor-pointer shadow-sm hover:shadow-md focus:outline-none hover:scale-[1.02] active:scale-[0.98] transform"
            />
          }
          dayClassName={(date) => {
            const isToday = date.toDateString() === now.toDateString();
            const isSelected = date.toDateString() === zonedDate.toDateString();
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            let classes = "react-datepicker__day";

            if (isSelected) {
              classes += " react-datepicker__day--selected";
            }

            if (isToday) {
              classes += " react-datepicker__day--today";
            }

            if (isWeekend) {
              classes += " react-datepicker__day--weekend";
            }

            return classes;
          }}
        />

        {/* 日历图标 */}
        <div
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none transition-colors duration-200 ${isOpen
            ? "text-purple-500"
            : "text-gray-400 dark:text-gray-500"
            }`}
          aria-hidden="true"
        >
          <Calendar size={18} />
        </div>

        {/* 焦点指示器 */}
        {isOpen && (
          <div className="absolute inset-0 rounded-lg ring-2 ring-purple-500/30 pointer-events-none" />
        )}
      </div>

    </div>
  );
}
