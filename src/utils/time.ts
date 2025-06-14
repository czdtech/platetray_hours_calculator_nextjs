/*
  时间工具集合：统一从 UTC 时间戳出发，避免直接依赖服务器或客户端本地时区。
  所有时间计算必须先显式指定目标时区，再进行后续 getHours / format 操作。
*/
import { toZonedTime } from "date-fns-tz";

export const NY_TIMEZONE = "America/New_York" as const;

/**
 * 获取当前 UTC 时间（Date 对象）。
 */
export function getCurrentUTCDate(): Date {
  return new Date(Date.now());
}

/**
 * 将给定 UTC 时间戳（或 Date 对象）转换为纽约时区的 Date 对象。
 * @param input - UTC 毫秒值或 Date
 */
export function toNewYorkTime(input: number | Date): Date {
  const date = typeof input === "number" ? new Date(input) : input;
  return toZonedTime(date, NY_TIMEZONE);
}
