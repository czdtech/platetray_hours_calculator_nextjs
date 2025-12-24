import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

/**
 * 在不依赖运行环境本地时区的前提下，对 yyyy-MM-dd 做日历加减。
 * 这里用 UTC 纯日期做运算，避免 DST/本地时区造成的偏移。
 */
export function addDaysToISODate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map((n) => Number(n));
  if (!y || !m || !d) {
    throw new Error(`Invalid ISO date string: ${dateStr}`);
  }

  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);

  const yyyy = String(dt.getUTCFullYear()).padStart(4, "0");
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * 时区变更时，将 selectedDate(UTC) 重新锚定到新时区的“同一天”：
 * - 若用户原本选的是“旧时区的今天”，则跟随新时区的“今天”；
 * - 否则保留用户所选的日历日期（旧时区看到的 yyyy-MM-dd），映射到新时区中午 12:00。
 *
 * 统一固定到本地中午 12:00，避免 UTC<->Local 转换导致日期回退/前进。
 */
export function reanchorSelectedDateOnTimezoneChange(params: {
  selectedDateUtc: Date;
  oldTimezone: string;
  newTimezone: string;
  baseTimeUtc: Date;
}): Date {
  const { selectedDateUtc, oldTimezone, newTimezone, baseTimeUtc } = params;

  const selectedOldStr = formatInTimeZone(selectedDateUtc, oldTimezone, "yyyy-MM-dd");
  const todayOldStr = formatInTimeZone(baseTimeUtc, oldTimezone, "yyyy-MM-dd");

  const targetStr =
    selectedOldStr === todayOldStr
      ? formatInTimeZone(baseTimeUtc, newTimezone, "yyyy-MM-dd")
      : selectedOldStr;

  return fromZonedTime(`${targetStr}T12:00:00`, newTimezone);
}

