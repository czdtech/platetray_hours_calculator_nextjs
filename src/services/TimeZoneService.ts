/**
 * TimeZoneService
 *
 * 提供时区转换和验证的服务
 * 集中管理所有时区相关的操作，确保一致性
 */

import { toZonedTime, fromZonedTime, formatInTimeZone } from "date-fns-tz";

export interface TimeZoneValidationResult {
  isValid: boolean;
  message?: string;
}

export class TimeZoneService {
  private static instance: TimeZoneService;

  private constructor() {}

  /**
   * 获取单例实例
   */
  public static getInstance(): TimeZoneService {
    if (!TimeZoneService.instance) {
      TimeZoneService.instance = new TimeZoneService();
    }
    return TimeZoneService.instance;
  }

  /**
   * 验证时区字符串是否有效
   * @param timezone 时区字符串 (例如 'America/New_York')
   * @returns 验证结果
   */
  public validateTimeZone(timezone: string): TimeZoneValidationResult {
    if (!timezone) {
      return { isValid: false, message: "时区是必需的" };
    }

    try {
      // 尝试使用时区
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return { isValid: true };
    } catch {
      return { isValid: false, message: "无效的时区标识符" };
    }
  }

  /**
   * 将UTC日期转换为指定时区的日期
   * @param date UTC日期
   * @param timezone 目标时区
   * @returns 目标时区的日期
   */
  public utcToZonedTime(date: Date, timezone: string): Date {
    this.validateTimeZoneOrThrow(timezone);
    return toZonedTime(date, timezone);
  }

  /**
   * 将指定时区的日期转换为UTC日期
   * @param date 指定时区的日期
   * @param timezone 源时区
   * @returns UTC日期
   */
  public zonedTimeToUtc(date: Date | string, timezone: string): Date {
    this.validateTimeZoneOrThrow(timezone);
    return fromZonedTime(date, timezone);
  }

  /**
   * 在指定时区格式化日期
   * @param date 要格式化的日期
   * @param timezone 时区
   * @param format 格式字符串
   * @returns 格式化后的日期字符串
   */
  public formatInTimeZone(
    date: Date,
    timezone: string,
    format: string,
  ): string {
    this.validateTimeZoneOrThrow(timezone);
    return formatInTimeZone(date, timezone, format);
  }

  /**
   * 获取当前日期在指定时区的表示
   * @param timezone 时区
   * @returns 指定时区的当前日期
   */
  public getCurrentDateInTimeZone(timezone: string): Date {
    this.validateTimeZoneOrThrow(timezone);
    return this.utcToZonedTime(new Date(), timezone);
  }

  /**
   * 获取时区缩写
   * @param date 日期
   * @param timezone 时区
   * @param locale 语言代码，默认为 'en'
   * @returns 时区缩写
   */
  public getTimeZoneAbbreviation(
    date: Date,
    timezone: string,
    locale: string = "en",
  ): string {
    // 验证时区合法性
    this.validateTimeZoneOrThrow(timezone);
    // 使用 Intl.DateTimeFormat 获取短时区名称 (如 EDT / EST)
    const parts = new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      timeZoneName: "short",
    }).formatToParts(date);

    const tzPart = parts.find((part) => part.type === "timeZoneName");
    return tzPart ? tzPart.value : "";
  }

  /**
   * 验证时区，如果无效则抛出错误
   * @param timezone 时区字符串
   * @throws 如果时区无效
   */
  private validateTimeZoneOrThrow(timezone: string): void {
    const validation = this.validateTimeZone(timezone);
    if (!validation.isValid) {
      throw new Error(validation.message);
    }
  }
}

// 导出单例实例
export const timeZoneService = TimeZoneService.getInstance();
