/*
  纽约行星时预计算验证脚本
  每天纽约时间 23:00-23:59 之间运行。若 KV / 本地文件缺失，则立即补偿计算。
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

async function readFromKV(key: string): Promise<string | null> {
  const { kvUrl, kvToken } = getKvCreds();
  if (!kvUrl || !kvToken) return null;
  const resp = await fetch(`${kvUrl}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${kvToken}` },
  });
  if (resp.status === 404) return null;
  if (!resp.ok) {
    throw new Error(`KV 读取失败: ${resp.status} ${await resp.text()}`);
  }
  return await resp.text();
}

async function readFromLocalFile(key: string): Promise<string | null> {
  const filePath = path.resolve(__dirname, `../public/precomputed/${key}.json`);
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}

async function writeLocalFile(key: string, json: string) {
  const destDir = path.resolve(__dirname, "../public/precomputed");
  await fs.mkdir(destDir, { recursive: true });
  const destPath = path.join(destDir, `${key}.json`);
  await fs.writeFile(destPath, json, "utf-8");
  console.log("[Local] 补偿写入", destPath);
}

export async function verifyTask() {
  const nowUTC = getCurrentUTCDate();
  const nowInNY = toNewYorkTime(nowUTC);

  // 如设置 FORCE_RUN=true，则忽略 23:00 时间窗口限制；否则仅在 23:00 运行
  if (!process.env.FORCE_RUN) {
    if (nowInNY.getHours() !== 23) {
      console.log("[Skip] 当前并非纽约时间 23:00，直接退出。设置 FORCE_RUN=true 可强制执行");
      return;
    }
  }

  const tomorrowInNY = addDays(nowInNY, 1);
  const tomorrowStr = formatInTimeZone(tomorrowInNY, NY_TIMEZONE, "yyyy-MM-dd");
  const cacheKey = `ny-${tomorrowStr}`;

  console.log(`[Verify] 检查 ${cacheKey}`);

  let data: string | null = await readFromKV(`${cacheKey}.json`);
  if (!data) {
    data = await readFromLocalFile(cacheKey);
  }

  if (data) {
    console.log("[OK] 预计算数据存在，无需补偿");
    return;
  }

  console.warn("[Miss] 未找到预计算数据，进行补偿计算");
  const calcResult = await planetaryHoursCalculator.calculate(
    tomorrowInNY,
    LATITUDE_NY,
    LONGITUDE_NY,
    NY_TIMEZONE,
  );
  if (!calcResult) {
    console.error("[Error] 补偿计算失败");
    process.exitCode = 1;
    return;
  }
  const json = JSON.stringify(calcResult);
  const { kvUrl, kvToken } = getKvCreds();
  if (kvUrl && kvToken) {
    try {
      const resp = await fetch(`${kvUrl}/set/${encodeURIComponent(cacheKey + ".json")}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${kvToken}`,
          "Content-Type": "application/json",
        },
        body: json,
      });
      if (!resp.ok) throw new Error(`KV 写入失败: ${resp.status}`);
      console.log("[KV] 补偿写入成功");
    } catch (err) {
      console.error(err);
      process.exitCode = 1;
    }
  } else {
    await writeLocalFile(cacheKey, json);
  }
}

// 仅当脚本被直接执行（如 yarn verify:newyork）时才运行
if (process.argv[1]?.includes("verify-newyork")) {
  verifyTask().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
