import { planetaryHoursCalculator } from "../services/PlanetaryHoursCalculator";
import { formatSingleHour } from "./planetaryHourFormatters";
import { formatInTimeZone } from "date-fns-tz";

/**
 * 此脚本用于调试行星时间计算
 * 可以通过 `node -r ts-node/register src/utils/debug-planetary.ts` 运行
 */
async function debugPlanetaryHours() {
  // 模拟纽约的坐标
  const latitude = 40.7128;
  const longitude = -74.006;
  const timezone = "America/New_York";

  // 使用指定时间 - 2025-05-13，为星期二
  const testDate = new Date("2025-05-13T23:47:00");

  console.log(
    "测试日期:",
    formatInTimeZone(testDate, timezone, "yyyy-MM-dd HH:mm:ss"),
  );
  console.log("星期几:", testDate.getDay()); // 应该返回2，代表星期二

  const result = await planetaryHoursCalculator.calculate(
    testDate,
    latitude,
    longitude,
    timezone,
  );

  if (!result) {
    console.error("计算失败");
    return;
  }

  console.log("日期:", result.requestedDate);
  console.log("Day Ruler:", result.dayRuler); // 应该是 Mars

  // 获取当前时间的行星时
  const currentHour = planetaryHoursCalculator.getCurrentHour(result, testDate);
  console.log("当前行星时数据:", currentHour);

  if (currentHour) {
    // 格式化为UI显示的格式
    const formattedHour = formatSingleHour(currentHour, timezone, "24h");
    console.log("格式化后的当前行星时:");
    console.log("- 行星:", formattedHour?.planet); // 应该是 Venus
    console.log("- 时间范围:", formattedHour?.timeRange);
    console.log("- 类型:", formattedHour?.type);
    console.log("- 适合做:", formattedHour?.goodFor);
    console.log("- 避免做:", formattedHour?.avoid);
  }

  // 输出完整的行星时列表
  console.log("\n所有行星时:");
  result.planetaryHours.forEach((hour, index) => {
    console.log(
      `${index + 1}. ${hour.ruler} (${hour.type}): ${formatInTimeZone(hour.startTime, timezone, "HH:mm")} - ${formatInTimeZone(hour.endTime, timezone, "HH:mm")}`,
    );
  });
}

console.log("开始调试行星时间计算...");
debugPlanetaryHours().catch(console.error);
