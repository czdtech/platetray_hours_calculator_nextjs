import { formatInTimeZone } from "date-fns-tz";
import { PlanetaryHour } from "../services/PlanetaryHoursCalculator";
// 导入全局行星颜色常量
import { PLANET_COLOR_CLASSES } from "@/constants/planetColors";

// 定义格式化后的行星时间接口
export interface FormattedPlanetaryHour {
  planet: string;
  timeRange: string;
  planetColor: string;
  type: "day" | "night";
  durationMinutes: number;
  goodFor: string;
  avoid: string;
  current: boolean;
}

// 移除本地的行星颜色映射
// export const PLANET_COLORS = { ... };
// 记录上一次高亮的行星时，避免每次渲染都打印
let lastHighlightedKey: string | null = null;

/**
 * 格式化行星小时列表
 * 将原始行星小时数据数组转换为UI友好的格式
 * @param hours - PlanetaryHour 对象数组
 * @param calculationTimezone - 计算时区
 * @param timeFormat - 时间格式 ('12h' 或 '24h')
 * @param currentHourForHighlighting - 可选的当前小时，用于设置 'current' 标志
 * @param highlightAllowed - 是否允许高亮
 * @returns FormattedPlanetaryHour 对象数组
 */
export function formatHoursToList(
  hours: PlanetaryHour[],
  calculationTimezone: string,
  timeFormat: "12h" | "24h",
  currentHourForHighlighting?: FormattedPlanetaryHour | null,
  highlightAllowed: boolean = true,
): FormattedPlanetaryHour[] {
  if (!hours?.length || !calculationTimezone) return [];

  const formatPattern = timeFormat === "24h" ? "HH:mm" : "h:mm aa";
  const nowUtc = new Date();

  return hours.map((hour) => {
    const startTimeFormatted = formatInTimeZone(
      hour.startTime,
      calculationTimezone,
      formatPattern,
    );
    const endTimeFormatted = formatInTimeZone(
      hour.endTime,
      calculationTimezone,
      formatPattern,
    );
    const timeRange = `${startTimeFormatted} - ${endTimeFormatted}`;

    // 改进的高亮判断逻辑
    let isCurrent = false;

    // 方法1：使用currentHourForHighlighting（如果有）
    if (currentHourForHighlighting) {
      isCurrent =
        currentHourForHighlighting.planet === hour.ruler &&
        currentHourForHighlighting.timeRange === timeRange;
    }
    // 方法2：直接检查当前时间是否在此小时范围内
    else {
      const nowTs = nowUtc.getTime();
      const hourStartTs = hour.startTime.getTime();
      const hourEndTs = hour.endTime.getTime();
      isCurrent = nowTs >= hourStartTs && nowTs < hourEndTs;
    }

    if (isCurrent) {
      const key = `${hour.ruler}_${timeRange}`;
      if (key !== lastHighlightedKey) {
        console.log(`Highlighting hour in list: ${hour.ruler}, ${timeRange}`);
        lastHighlightedKey = key;
      }
    }

    return {
      planet: hour.ruler,
      timeRange: timeRange,
      // 使用全局常量替换本地常量
      planetColor:
        PLANET_COLOR_CLASSES[hour.ruler as keyof typeof PLANET_COLOR_CLASSES] ||
        "text-gray-500",
      type: hour.type,
      durationMinutes: hour.durationMinutes,
      goodFor: hour.goodFor || "",
      avoid: hour.avoid || "",
      current: highlightAllowed ? isCurrent : false,
    };
  });
}

/**
 * 格式化单个行星小时
 * 将单个 PlanetaryHour 对象转换为UI友好的格式
 * @param hour - 单个 PlanetaryHour 对象
 * @param calculationTimezone - 计算时区
 * @param timeFormat - 时间格式 ('12h' 或 '24h')
 * @param isActuallyCurrent - 是否这个小时就是当前正在发生的行星小时
 * @returns FormattedPlanetaryHour 对象，如果输入为 null 则返回 null
 */
export function formatSingleHour(
  hour: PlanetaryHour | null,
  calculationTimezone: string,
  timeFormat: "12h" | "24h",
  isActuallyCurrent: boolean = true, // 默认认为是当前，除非被覆盖
): FormattedPlanetaryHour | null {
  if (!hour || !calculationTimezone) return null;

  const formatPattern = timeFormat === "24h" ? "HH:mm" : "h:mm aa";
  const startTimeFormatted = formatInTimeZone(
    hour.startTime,
    calculationTimezone,
    formatPattern,
  );
  const endTimeFormatted = formatInTimeZone(
    hour.endTime,
    calculationTimezone,
    formatPattern,
  );

  return {
    planet: hour.ruler,
    timeRange: `${startTimeFormatted} - ${endTimeFormatted}`,
    // 使用全局常量替换本地常量
    planetColor:
      PLANET_COLOR_CLASSES[hour.ruler as keyof typeof PLANET_COLOR_CLASSES] ||
      "text-gray-500",
    type: hour.type,
    durationMinutes: hour.durationMinutes,
    goodFor: hour.goodFor || "",
    avoid: hour.avoid || "",
    current: isActuallyCurrent,
  };
}
