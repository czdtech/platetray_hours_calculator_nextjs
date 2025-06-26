import fs from "fs/promises";
import path from "path";
import { formatInTimeZone } from "date-fns-tz";
import { NY_TIMEZONE, getCurrentUTCDate } from "@/utils/time";
import CalculatorClient from "@/components/Calculator/CalculatorClient";
import { getCurrentHourPayload } from "@/utils/planetaryHourHelpers";

import { planetaryHoursCalculator, PlanetaryHoursCalculationResult } from "@/services/PlanetaryHoursCalculator";

// 纽约坐标常量
const LATITUDE_NY = 40.7128;
const LONGITUDE_NY = -74.0060;

const ISO_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

function reviveDates<T>(data: T): T {
  return JSON.parse(JSON.stringify(data), (_key, value) => {
    if (typeof value === "string" && ISO_REGEX.test(value)) {
      return new Date(value);
    }
    return value;
  });
}

async function loadPrecomputed(key: string): Promise<PlanetaryHoursCalculationResult | null> {
  // 1) 尝试从本地文件读取 (public/precomputed)
  try {
    const filePath = path.resolve(process.cwd(), "public", "precomputed", `${key}.json`);
    const json = await fs.readFile(filePath, "utf-8");
    const raw = JSON.parse(json);
    return reviveDates(raw) as PlanetaryHoursCalculationResult;
  } catch {
    // ignore
  }
  // 2) 未来可加入 Vercel KV 读取逻辑 (边缘运行时除外)
  return null;
}

export default async function CalculatorServer() {
  const nowUTC = getCurrentUTCDate();
  // 直接基于 UTC 时间格式化到纽约日期，避免重复时区转换导致跨天错误
  const todayStr = formatInTimeZone(nowUTC, NY_TIMEZONE, "yyyy-MM-dd");
  const cacheKey = `ny-${todayStr}`;

  let precomputed: PlanetaryHoursCalculationResult | null = await loadPrecomputed(cacheKey);

  // 若预计算文件存在但日期不一致（可能因缓存过期或生成错误），则忽略并重新计算
  if (precomputed && precomputed.requestedDate !== todayStr) {
    console.warn(
      `[Warning] 预计算文件 ${cacheKey}.json 的 requestedDate=${precomputed.requestedDate} 与今日 ${todayStr} 不符，执行重新计算`,
    );
    precomputed = null;
  }

  if (!precomputed) {
    // 回退即时计算
    precomputed = await planetaryHoursCalculator.calculate(
      nowUTC,
      LATITUDE_NY,
      LONGITUDE_NY,
      NY_TIMEZONE,
    );
    // 开发模式将结果写入本地，方便下次复用
    if (process.env.NODE_ENV === "development" && precomputed) {
      try {
        const dir = path.resolve(process.cwd(), "public", "precomputed");
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(path.join(dir, `${cacheKey}.json`), JSON.stringify(precomputed), "utf-8");
      } catch {
        // Ignore file write errors in development
      }
    }
  }

  // 预热计算器缓存，减少客户端重新计算
  if (precomputed) {
    await planetaryHoursCalculator.calculate(
      precomputed.dateUsedForCalculation,
      precomputed.latitude,
      precomputed.longitude,
      precomputed.timezone,
    );
  }

  const payload = precomputed ? getCurrentHourPayload(precomputed, '24h') : null;

  return (
    <>
      <CalculatorClient precomputed={precomputed} initialHour={payload} />
    </>
  );
}
