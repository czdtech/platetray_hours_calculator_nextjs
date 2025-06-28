import { formatInTimeZone } from "date-fns-tz";
import { NY_TIMEZONE, getCurrentUTCDate } from "@/utils/time";
import CalculatorClient from "@/components/Calculator/CalculatorClient";
import { getCurrentHourPayload } from "@/utils/planetaryHourHelpers";
import { generateCacheControlHeader } from "@/utils/cache/dynamicTTL";
import { createLogger } from '@/utils/unified-logger';

import { planetaryHoursCalculator, PlanetaryHoursCalculationResult } from "@/services/PlanetaryHoursCalculator";

const logger = createLogger('CalculatorServer');

// 纽约坐标常量
const LATITUDE_NY = 40.7128;
const LONGITUDE_NY = -74.0060;

/**
 * 设置动态缓存响应头
 * 注意：在App Router中，我们通过传递信息给客户端的方式来实现缓存策略
 */
async function setDynamicCacheHeaders(cacheControl: string, ttlSeconds: number) {
  // 在App Router中，我们无法直接设置响应头
  // 但我们可以通过其他方式实现缓存控制
  logger.info('动态缓存策略', {
    cacheControl,
    ttlSeconds,
    hint: '在App Router中通过客户端和ISR策略实现'
  });
}

/**
 * 服务端组件：负责实时计算纽约行星时数据并计算缓存策略
 *
 * 该组件将在每次请求时执行，根据当前时间和行星时状态
 * 动态计算最优的缓存时间，确保用户看到准确的当前行星时
 */
export default async function CalculatorServer() {
  // 获取当前服务端时间 - 这是关键的时间基准
  const nowUTC = getCurrentUTCDate();
  const todayStr = formatInTimeZone(nowUTC, NY_TIMEZONE, "yyyy-MM-dd");

  logger.info('服务端渲染开始', {
    serverTime: nowUTC.toISOString(),
    todayString: todayStr,
    timestamp: Date.now()
  });

  let calculationResult: PlanetaryHoursCalculationResult | null = null;

  try {
    // 实时计算纽约行星时数据
    logger.info('开始实时计算纽约行星时数据');
    calculationResult = await planetaryHoursCalculator.calculate(
      nowUTC,
      LATITUDE_NY,
      LONGITUDE_NY,
      NY_TIMEZONE
    );

    if (!calculationResult) {
      throw new Error('实时计算失败');
    }

    // 基于当前服务端时间计算当前行星时和TTL信息
    const payload = getCurrentHourPayload(calculationResult, '24h', nowUTC);

    logger.info('当前行星时状态', {
      currentHour: payload.currentHour?.planet || 'none',
      nextSwitchIn: Math.round(payload.ttlInfo.remainingMs / 1000 / 60),
      isSensitive: payload.ttlInfo.isSensitivePeriod,
      recommendedTTL: payload.ttlInfo.ttlSeconds,
      serverTime: nowUTC.toISOString()
    });

    // 设置动态缓存响应头
    const cacheControl = generateCacheControlHeader(calculationResult, nowUTC);
    await setDynamicCacheHeaders(cacheControl, payload.ttlInfo.ttlSeconds);

    return (
      <CalculatorClient
        calculationResult={calculationResult}
        initialHourPayload={payload}
        serverTime={nowUTC.toISOString()}
        cacheControl={cacheControl}
        ttlInfo={payload.ttlInfo}
      />
    );

  } catch (error) {
    logger.error('服务端渲染失败', error instanceof Error ? error : new Error(String(error)));

    // 降级处理：返回基础组件，让客户端处理
    return (
      <CalculatorClient
        calculationResult={null}
        initialHourPayload={null}
        serverTime={nowUTC.toISOString()}
        error="服务端数据加载失败，将使用客户端计算"
      />
    );
  }
}
