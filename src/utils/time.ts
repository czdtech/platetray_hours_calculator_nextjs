/*
  时间工具集合：统一从 UTC 时间戳出发，避免直接依赖服务器或客户端本地时区。
  所有时间计算必须先显式指定目标时区，再进行后续 getHours / format 操作。
*/
import { formatInTimeZone } from "date-fns-tz";

export const NY_TIMEZONE = "America/New_York" as const;

/**
 * 获取当前 UTC 时间（Date 对象）。
 */
export function getCurrentUTCDate(): Date {
  return new Date(Date.now());
}

/**
 * 获取当前时间的统一入口，优先使用传入的基准时间，用于确保 SSR/CSR 一致性
 * @param baseTime - 可选的基准时间（通常来自服务端）
 * @returns 当前时间的 Date 对象
 */
export function getCurrentTime(baseTime?: string | Date): Date {
  if (baseTime) {
    return typeof baseTime === 'string' ? new Date(baseTime) : baseTime;
  }
  return getCurrentUTCDate();
}

/**
 * 将给定 UTC 时间戳（或 Date 对象）转换为纽约时区的 Date 对象。
 * @param input - UTC 毫秒值或 Date
 */
export function toNewYorkTime(input: number | Date): Date {
  const date = typeof input === "number" ? new Date(input) : input;
  // 使用 formatInTimeZone 输出带时区偏移的字符串，再由 Date 解析为对应时间点
  const zoned = formatInTimeZone(date, NY_TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
  return new Date(zoned);
}
