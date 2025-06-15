/*
  纽约行星时预计算脚本
  每天纽约时间 22:00-22:59 之间触发，计算次日数据并写入 Vercel KV。
  开发模式下（无 KV 环境变量）写入 public/precomputed 目录，供本地 SSR 读取。
*/

import path from "path";
import fs from "fs/promises";

import { addDays } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { NY_TIMEZONE, getCurrentUTCDate, toNewYorkTime } from "../src/utils/time";
import { planetaryHoursCalculator } from "../src/services/PlanetaryHoursCalculator";

const LATITUDE_NY = 40.7128;
const LONGITUDE_NY = -74.0060;

function getKvCreds() {
  return {
    kvUrl:
      process.env.VERCEL_KV_REST_API_URL ||
      process.env.UPSTASH_REDIS_REST_URL ||
      process.env.KV_REST_API_URL,
    kvToken:
      process.env.VERCEL_KV_REST_API_TOKEN ||
      process.env.UPSTASH_REDIS_REST_TOKEN ||
      process.env.KV_REST_API_TOKEN,
  } as { kvUrl: string | undefined; kvToken: string | undefined };
}

async function writeToKV(key: string, json: string) {
  const { kvUrl, kvToken } = getKvCreds();
  if (!kvUrl || !kvToken) {
    throw new Error("Vercel KV 环境变量缺失");
  }
  const resp = await fetch(`${kvUrl}/set/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${kvToken}`,
      "Content-Type": "application/json",
    },
    body: json,
  });
  if (!resp.ok) {
    throw new Error(`KV 写入失败: ${resp.status} ${await resp.text()}`);
  }
}

async function readFromKV(key: string): Promise<boolean> {
  const { kvUrl, kvToken } = getKvCreds();
  if (!kvUrl || !kvToken) return false;
  const resp = await fetch(`${kvUrl}/get/${encodeURIComponent(key)}?metadata=true`, {
    headers: { Authorization: `Bearer ${kvToken}` },
  });
  return resp.ok;
}

async function readFromLocalFile(key: string): Promise<boolean> {
  const filePath = path.resolve(__dirname, `../public/precomputed/${key}.json`);
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function checkExisting(key: string): Promise<boolean> {
  return (await readFromKV(`${key}.json`)) || (await readFromLocalFile(key));
}

async function writeToLocalFile(key: string, json: string) {
  // 写入 public/precomputed/key.json
  const destDir = path.resolve(__dirname, "../public/precomputed");
  await fs.mkdir(destDir, { recursive: true });
  const destPath = path.join(destDir, `${key}.json`);
  await fs.writeFile(destPath, json, "utf-8");
  console.log("[Local] 已写入", destPath);
}

export async function precomputeTask() {
  const nowUTC = getCurrentUTCDate();
  // 基于 UTC -> 纽约时间一次性转换
  const nowInNY = toNewYorkTime(nowUTC);

  // 如果设置了 FORCE_RUN=true，则忽略时间判断；否则仅在 22:00 运行。
  if (!process.env.FORCE_RUN) {
    if (nowInNY.getHours() !== 22) {
      console.log("[Skip] 当前并非纽约时间 22:00，直接退出。设置 FORCE_RUN=true 可强制执行");
      return;
    }
  }

  const tomorrowUTC = addDays(nowUTC, 1);
  const tomorrowStr = formatInTimeZone(tomorrowUTC, NY_TIMEZONE, "yyyy-MM-dd");
  const cacheKey = `ny-${tomorrowStr}`;

  // 若缓存已存在则跳过（除非 FORCE_RUN）
  if (!process.env.FORCE_RUN) {
    const exists = await checkExisting(cacheKey);
    if (exists) {
      console.log(`[Skip] ${cacheKey}.json 已存在，跳过计算`);
      return;
    }
  }

  console.log(`[Start] 计算 ${cacheKey}`);
  const calcResult = await planetaryHoursCalculator.calculate(
    tomorrowUTC,
    LATITUDE_NY,
    LONGITUDE_NY,
    NY_TIMEZONE,
  );

  if (!calcResult) {
    console.error("[Error] 计算结果为空，终止");
    process.exitCode = 1;
    return;
  }

  const json = JSON.stringify(calcResult);

  const { kvUrl, kvToken } = getKvCreds();
  if (kvUrl && kvToken) {
    try {
      await writeToKV(`${cacheKey}.json`, json);
      console.log("[KV] 写入成功");
    } catch (err) {
      console.error(err);
      process.exitCode = 1;
    }
  } else {
    await writeToLocalFile(cacheKey, json);
  }
}

// 仅当脚本被直接执行（如 yarn precompute:newyork）时才运行
if (process.argv[1]?.includes("precompute-newyork")) {
  precomputeTask().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
