/**
 * DateService
 *
 * 提供日期计算、格式化和验证的服务
 * 集中管理所有日期相关的操作，确保一致性
 */

import { isValid, addDays, subDays, addWeeks, subWeeks } from "date-fns";
import { timeZoneService } from "./TimeZoneService";

export interface DateValidationResult {
  isValid: boolean;
  message?: string;
}

export interface WeekDay {
  date: Date;
  displayDate: string;
  name: string;
  planet: string;
  symbol: string;
  active: boolean;
}

// 行星与星期的对应关系
export const DAY_RULERS = {
  0: { planet: "Sun", name: "Sunday" },
  1: { planet: "Moon", name: "Monday" },
  2: { planet: "Mars", name: "Tuesday" },
  3: { planet: "Mercury", name: "Wednesday" },
  4: { planet: "Jupiter", name: "Thursday" },
  5: { planet: "Venus", name: "Friday" },
  6: { planet: "Saturn", name: "Saturday" },
};

// 行星符号
export const PLANET_SYMBOLS = {
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
};

export class DateService {
  private static instance: DateService;
  // 添加缓存机制优化性能
  private weekDaysCache = new Map<string, WeekDay[]>();
  private formattedDateCache = new Map<string, string>();
  private readonly CACHE_SIZE_LIMIT = 100; // 限制缓存大小防止内存泄漏

  private constructor() { }

  /**
   * 获取单例实例
   */
  public static getInstance(): DateService {
    if (!DateService.instance) {
      DateService.instance = new DateService();
    }
    return DateService.instance;
  }

  /**
   * 清理缓存
   */
  private clearOldCache(cache: Map<string, any>) {
    if (cache.size > this.CACHE_SIZE_LIMIT) {
      // 保留最近的一半缓存项
      const entries = Array.from(cache.entries());
      cache.clear();
      entries.slice(-Math.floor(this.CACHE_SIZE_LIMIT / 2)).forEach(([key, value]) => {
        cache.set(key, value);
      });
    }
  }

  /**
   * 清理所有缓存（用于调试和故障排除）
   */
  public clearAllCache() {
    this.weekDaysCache.clear();
    this.formattedDateCache.clear();
    console.log('📦 [DateService] All caches cleared');
  }

  /**
   * 获取缓存统计信息（用于调试）
   */
  public getCacheStats() {
    return {
      weekDaysCache: this.weekDaysCache.size,
      formattedDateCache: this.formattedDateCache.size,
      limit: this.CACHE_SIZE_LIMIT
    };
  }

  /**
   * 验证日期是否有效
   * @param date 日期对象
   * @param options 验证选项
   * @returns 验证结果
   */
  public validateDate(
    date: Date,
    options: {
      allowPast?: boolean;
      allowFuture?: boolean;
      maxDaysInPast?: number;
      maxDaysInFuture?: number;
    } = {},
  ): DateValidationResult {
    if (!(date instanceof Date) || !isValid(date)) {
      return { isValid: false, message: "无效的日期" };
    }

    const now = new Date();
    const {
      allowPast = true,
      allowFuture = true,
      maxDaysInPast = 365,
      maxDaysInFuture = 365,
    } = options;

    if (!allowPast && date < now) {
      return { isValid: false, message: "不允许过去的日期" };
    }

    if (!allowFuture && date > now) {
      return { isValid: false, message: "不允许未来的日期" };
    }

    if (allowPast && maxDaysInPast > 0) {
      const earliestAllowed = subDays(now, maxDaysInPast);
      if (date < earliestAllowed) {
        return {
          isValid: false,
          message: `日期不能早于 ${maxDaysInPast} 天前`,
        };
      }
    }

    if (allowFuture && maxDaysInFuture > 0) {
      const latestAllowed = addDays(now, maxDaysInFuture);
      if (date > latestAllowed) {
        return {
          isValid: false,
          message: `日期不能晚于 ${maxDaysInFuture} 天后`,
        };
      }
    }

    return { isValid: true };
  }

  /**
   * 生成一周的日期数据
   * @param baseDate 基准日期 (UTC), 代表用户在日历上选中的那一天
   * @param timezone 目标时区
   * @param selectedDateForHighlight 当前选中的日期 (UTC), 用于高亮显示
   * @returns 一周的日期数据
   */
  public generateWeekDays(
    baseDate: Date,
    timezone: string,
    selectedDateForHighlight: Date,
  ): WeekDay[] {
    // 修复缓存键生成：使用日期字符串而不是时间戳，确保相同日期的不同时间不会产生不同的缓存键
    const baseDateStr = timeZoneService.formatInTimeZone(baseDate, timezone, "yyyy-MM-dd");
    const selectedDateStr = timeZoneService.formatInTimeZone(selectedDateForHighlight, timezone, "yyyy-MM-dd");
    const cacheKey = `${baseDateStr}-${timezone}-${selectedDateStr}`;

    // 检查缓存
    if (this.weekDaysCache.has(cacheKey)) {
      return this.weekDaysCache.get(cacheKey)!;
    }

    // 如果没有缓存，进行计算
    const startTime = performance.now();

    // 1. 确定 baseDate 在目标时区的 YYYY-MM-DD 字符串表示
    const baseDateInTimezoneStr = timeZoneService.formatInTimeZone(
      baseDate,
      timezone,
      "yyyy-MM-dd",
    );

    // 2. 获取一个 Date 对象，它代表 baseDate 在目标时区的午夜0点，并表示为 UTC 时间戳
    const baseDateAtMidnightUtc = timeZoneService.zonedTimeToUtc(
      `${baseDateInTimezoneStr}T00:00:00`,
      timezone,
    );

    // 3. 为了准确获取 baseDateAtMidnightUtc 在目标时区的星期几，先将其转换为目标时区的 Date 对象
    const baseDateInTimezoneForDayCalculation = timeZoneService.utcToZonedTime(
      baseDateAtMidnightUtc,
      timezone,
    );
    const dayOfWeekForBase = baseDateInTimezoneForDayCalculation.getDay(); // 0 代表周日, 1 代表周一 ...

    // 4. 计算包含 baseDate 的那一周的周日午夜0点 (在目标时区) 的 UTC 时间戳
    //    subDays 直接操作 Date 对象的内部 UTC 值
    const sundayAtMidnightUtc = subDays(
      baseDateAtMidnightUtc,
      dayOfWeekForBase,
    );

    const weekDaysArray: WeekDay[] = [];

    // 5. 为了高亮显示，获取 selectedDateForHighlight 在目标时区的 YYYY-MM-DD 字符串
    const selectedDateForHighlightStr = timeZoneService.formatInTimeZone(
      selectedDateForHighlight,
      timezone,
      "yyyy-MM-dd",
    );

    for (let i = 0; i < 7; i++) {
      // currentIterationDayUtc 是当前迭代日的午夜0点 (在目标时区) 的 UTC 时间戳
      const currentIterationDayUtc = addDays(sundayAtMidnightUtc, i);

      // 为了获取显示名称和格式化日期，将当前迭代日的 UTC 时间戳转换为目标时区的 Date 对象
      const currentIterationDayInTimezone = timeZoneService.utcToZonedTime(
        currentIterationDayUtc,
        timezone,
      );

      const displayFormat = "MMM d"; // 与 formatDate 中的 'short' 格式一致
      const displayDate = timeZoneService.formatInTimeZone(
        currentIterationDayUtc,
        timezone,
        displayFormat,
      );

      const dayIndex = currentIterationDayInTimezone.getDay();
      const rulerInfo = DAY_RULERS[dayIndex as keyof typeof DAY_RULERS];

      // 比较当前迭代日和高亮选择日在目标时区的 YYYY-MM-DD 字符串
      const currentIterationDayInTimezoneStr = timeZoneService.formatInTimeZone(
        currentIterationDayUtc,
        timezone,
        "yyyy-MM-dd",
      );
      const isActive =
        currentIterationDayInTimezoneStr === selectedDateForHighlightStr;

      weekDaysArray.push({
        date: currentIterationDayUtc, // 存储代表目标时区当日零点的 UTC 时间戳
        displayDate: displayDate,
        name: rulerInfo.name,
        planet: rulerInfo.planet,
        symbol: PLANET_SYMBOLS[rulerInfo.planet as keyof typeof PLANET_SYMBOLS],
        active: isActive,
      });
    }

    // 保存到缓存
    this.weekDaysCache.set(cacheKey, weekDaysArray);
    this.clearOldCache(this.weekDaysCache);

    // 性能监控
    const duration = performance.now() - startTime;
    if (duration > 50) {
      console.warn(`⚡ [Performance] generateWeekDays took ${duration.toFixed(2)}ms`);
    }

    return weekDaysArray;
  }

  /**
   * 获取上一周的日期 (基于输入的UTC日期)
   * @param date 当前日期 (UTC)
   * @returns 上一周同一天的日期 (UTC)
   */
  public getPreviousWeek(date: Date): Date {
    return subWeeks(date, 1);
  }

  /**
   * 获取下一周的日期 (基于输入的UTC日期)
   * @param date 当前日期 (UTC)
   * @returns 下一周同一天的日期 (UTC)
   */
  public getNextWeek(date: Date): Date {
    return addWeeks(date, 1);
  }

  /**
   * 格式化日期为显示字符串
   * @param date 日期 (UTC)
   * @param timezone 时区
   * @param format 格式（'short', 'medium', 'long'）
   * @returns 格式化后的日期字符串
   */
  public formatDate(
    date: Date,
    timezone: string,
    format: "short" | "medium" | "long" = "medium",
  ): string {
    // 修复缓存键生成：使用日期字符串而不是时间戳
    const dateStr = timeZoneService.formatInTimeZone(date, timezone, "yyyy-MM-dd");
    const cacheKey = `${dateStr}-${timezone}-${format}`;

    // 检查缓存
    if (this.formattedDateCache.has(cacheKey)) {
      return this.formattedDateCache.get(cacheKey)!;
    }

    const formatMap = {
      short: "MMM d",
      medium: "MMMM d, yyyy",
      long: "EEEE, MMMM d, yyyy",
    };

    const result = timeZoneService.formatInTimeZone(date, timezone, formatMap[format]);

    // 保存到缓存
    this.formattedDateCache.set(cacheKey, result);
    this.clearOldCache(this.formattedDateCache);

    return result;
  }
}

// 导出单例实例
export const dateService = DateService.getInstance();

// 在开发环境中将 dateService 暴露到全局 window 对象，方便调试
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).dateService = dateService;
  // 添加全局缓存清理函数，方便调试
  (window as any).clearAllCaches = () => {
    dateService.clearAllCache();
    console.log('🧹 [Debug] All DateService caches cleared');
  };
  console.log('🔧 [Debug] dateService available at window.dateService');
  console.log('🔧 [Debug] clearAllCaches() available at window.clearAllCaches()');
}
