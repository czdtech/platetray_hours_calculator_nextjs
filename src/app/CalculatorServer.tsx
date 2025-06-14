import fs from "fs/promises";
import path from "path";
import { formatInTimeZone } from "date-fns-tz";
import { NY_TIMEZONE, getCurrentUTCDate, toNewYorkTime } from "@/utils/time";
import CalculatorClient from "@/components/Calculator/CalculatorClient";
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
  } catch (_) {
    // ignore
  }
  // 2) 未来可加入 Vercel KV 读取逻辑 (边缘运行时除外)
  return null;
}

export default async function CalculatorServer() {
  const nowUTC = getCurrentUTCDate();
  const nowInNY = toNewYorkTime(nowUTC);
  const todayStr = formatInTimeZone(nowInNY, NY_TIMEZONE, "yyyy-MM-dd");
  const cacheKey = `ny-${todayStr}`;

  let precomputed: PlanetaryHoursCalculationResult | null = await loadPrecomputed(cacheKey);

  if (!precomputed) {
    // 回退即时计算
    precomputed = await planetaryHoursCalculator.calculate(
      nowInNY,
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
      } catch (_) {}
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

  return <CalculatorClient precomputed={precomputed} />;
}
