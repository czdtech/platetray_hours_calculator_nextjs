"use client";

import { useRef, useId, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./DateTimeInput.css"; // 导入自定义样式
import { useDateContext } from "@/contexts/DateContext";

interface DateTimeInputProps {
  defaultDate: string;
  onDateChange: (date: Date) => void;
  selectedDate: Date;
}

export function DateTimeInput({
  defaultDate,
  onDateChange,
  selectedDate,
}: DateTimeInputProps) {
  const { utcToZonedTime, zonedTimeToUtc, timezone } = useDateContext();
  const [isOpen, setIsOpen] = useState(false);

  const datePickerRef = useRef<DatePicker>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  // Convert UTC date to zoned date for DatePicker
  const zonedDate = utcToZonedTime(selectedDate);

  const handleDateChange = (date: Date | null) => {
    if (date) {
      // Convert selected date to UTC date
      const utcDate = zonedTimeToUtc(date);
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
  }: any) => (
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
        
        {/* 快捷选择按钮 - 一直显示以保持UI一致性 */}
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => {
              // 获取当前时区的今天日期
              const now = new Date();
              const todayInTimezone = utcToZonedTime(now);
              // 设置为当天的开始时间 (00:00:00)
              todayInTimezone.setHours(0, 0, 0, 0);
              // 转换回 UTC 时间
              const utcToday = zonedTimeToUtc(todayInTimezone);
              onDateChange(utcToday);
            }}
            className="px-2.5 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-md transition-all duration-200 border border-purple-200 dark:border-purple-700 hover:scale-105 active:scale-95 hover:shadow-md active:shadow-sm transform"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => {
              // 获取当前时区的今天日期
              const now = new Date();
              const todayInTimezone = utcToZonedTime(now);
              // 设置为昨天的开始时间
              todayInTimezone.setDate(todayInTimezone.getDate() - 1);
              todayInTimezone.setHours(0, 0, 0, 0);
              // 转换回 UTC 时间
              const utcYesterday = zonedTimeToUtc(todayInTimezone);
              onDateChange(utcYesterday);
            }}
            className="px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-all duration-200 border border-gray-200 dark:border-gray-600 hover:scale-105 active:scale-95 hover:shadow-md active:shadow-sm transform"
          >
            Yesterday
          </button>
          <button
            type="button"
            onClick={() => {
              // 获取当前时区的今天日期
              const now = new Date();
              const todayInTimezone = utcToZonedTime(now);
              // 设置为明天的开始时间
              todayInTimezone.setDate(todayInTimezone.getDate() + 1);
              todayInTimezone.setHours(0, 0, 0, 0);
              // 转换回 UTC 时间
              const utcTomorrow = zonedTimeToUtc(todayInTimezone);
              onDateChange(utcTomorrow);
            }}
            className="px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-all duration-200 border border-gray-200 dark:border-gray-600 hover:scale-105 active:scale-95 hover:shadow-md active:shadow-sm transform"
          >
            Tomorrow
          </button>
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
            const today = new Date();
            const isToday = date.toDateString() === today.toDateString();
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
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none transition-colors duration-200 ${
            isOpen 
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