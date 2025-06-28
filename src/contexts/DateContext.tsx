"use client"; // Next.js App Router requires client components for Context

/**
 * DateContext
 *
 * 提供全局可访问的日期上下文
 * 包含当前日期、时区等状态和修改方法
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { dateService, WeekDay } from "../services/DateService";
import { timeZoneService } from "../services/TimeZoneService";

import { createLogger } from '@/utils/unified-logger';

interface DateContextType {
  // 当前选中的日期（UTC）
  selectedDate: Date;
  // 当前时区
  timezone: string;
  // 一周的日期数据
  weekDays: WeekDay[];
  // 设置日期
  setSelectedDate: (date: Date) => void;
  // 设置时区
  setTimezone: (timezone: string) => void;
  // 获取上一周
  goToPreviousWeek: () => void;
  // 获取下一周
  goToNextWeek: () => void;
  // 格式化日期
  formatDate: (date: Date, format?: "short" | "medium" | "long") => string;
  // 格式化日期，如果是今天则添加前缀
  formatDateWithTodayPrefix: (date: Date, format?: "short" | "medium" | "long") => string;
  // 检查是否为今天
  isToday: (date: Date) => boolean;
  // 将UTC日期转换为时区日期
  utcToZonedTime: (date: Date) => Date;
  // 将时区日期转换为UTC日期
  zonedTimeToUtc: (date: Date) => Date;
  // 使用自定义模式格式化日期
  formatDateWithPattern: (date: Date, pattern: string) => string;
}

// 创建上下文
const DateContext = createContext<DateContextType | undefined>(undefined);

// Provider 组件
interface DateProviderProps {
  children: ReactNode;
  initialDate?: Date;
  initialTimezone?: string;
}

export function DateProvider({
  children,
  initialDate = new Date(),
  initialTimezone = "America/New_York", // 默认时区可以后续调整或从配置读取
}: DateProviderProps) {
  const logger = createLogger('DateContext');

  // 状态
  const [selectedDate, setSelectedDateState] = useState<Date>(initialDate);
  const [timezone, setTimezoneState] = useState<string>(initialTimezone);

  // 当时区变化时，保持选中日期在新时区的相同时间点
  useEffect(() => {
    // 不需要特殊处理，因为我们存储的是UTC日期
    // 显示时会根据当前时区进行转换
  }, [timezone]);

  // 计算一周的日期
  const weekDays = useMemo(() => {
    return dateService.generateWeekDays(selectedDate, timezone, selectedDate);
  }, [selectedDate, timezone]);

  // 设置日期（确保是UTC日期）
  const setSelectedDate = (date: Date) => {
    // 确保日期是有效的
    const validation = dateService.validateDate(date);
    if (validation.isValid) {
      setSelectedDateState(date);
    } else {
      logger.error(validation.message || 'Invalid date');
    }
  };

  // 设置时区（确保是有效的时区）
  const setTimezone = (newTimezone: string) => {
    const validation = timeZoneService.validateTimeZone(newTimezone);
    if (validation.isValid) {
      setTimezoneState(newTimezone);
    } else {
      logger.error('无效时区', new Error(validation.message || 'Invalid timezone'));
    }
  };

  // 获取上一周
  const goToPreviousWeek = () => {
    const previousWeek = dateService.getPreviousWeek(selectedDate);
    setSelectedDate(previousWeek);
  };

  // 获取下一周
  const goToNextWeek = () => {
    const nextWeek = dateService.getNextWeek(selectedDate);
    setSelectedDate(nextWeek);
  };

  // 格式化日期
  const formatDate = (
    date: Date,
    format: "short" | "medium" | "long" = "medium",
  ) => {
    return dateService.formatDate(date, timezone, format);
  };

  // 将UTC日期转换为时区日期
  const utcToZonedTime = (date: Date) => {
    return timeZoneService.utcToZonedTime(date, timezone);
  };

  // 将时区日期转换为UTC日期
  const zonedTimeToUtc = (date: Date) => {
    return timeZoneService.zonedTimeToUtc(date, timezone);
  };

  // 使用自定义模式格式化日期
  const formatDateWithPattern = (date: Date, pattern: string) => {
    return timeZoneService.formatInTimeZone(date, timezone, pattern);
  };

  // 检查是否为今天（使用初始时间作为基准，确保 SSR/CSR 一致性）
  const isToday = (date: Date) => {
    const todayInTimezone = timeZoneService.formatInTimeZone(initialDate, timezone, "yyyy-MM-dd");
    const dateInTimezone = timeZoneService.formatInTimeZone(date, timezone, "yyyy-MM-dd");
    return todayInTimezone === dateInTimezone;
  };

  // 格式化日期，如果是今天则添加前缀
  const formatDateWithTodayPrefix = (date: Date, format: "short" | "medium" | "long" = "medium") => {
    const formattedDate = dateService.formatDate(date, timezone, format);
    if (isToday(date)) {
      return `planetary hours today, ${formattedDate}`;
    }
    return formattedDate;
  };

  // 上下文值
  const value = {
    selectedDate,
    timezone,
    weekDays,
    setSelectedDate,
    setTimezone,
    goToPreviousWeek,
    goToNextWeek,
    formatDate,
    formatDateWithTodayPrefix,
    isToday,
    utcToZonedTime,
    zonedTimeToUtc,
    formatDateWithPattern,
  };

  return <DateContext.Provider value={value}>{children}</DateContext.Provider>;
}

// 自定义钩子，用于访问上下文
export function useDateContext() {
  const context = useContext(DateContext);
  if (context === undefined) {
    throw new Error("useDateContext must be used within a DateProvider");
  }
  return context;
}
