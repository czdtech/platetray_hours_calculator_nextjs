/**
 * 动态TTL缓存策略
 *
 * 根据行星时的动态切换特性，计算合适的缓存时间
 * 确保页面缓存在行星时切换前及时更新
 */

import { PlanetaryHoursCalculationResult } from '@/services/PlanetaryHoursCalculator';
import { createLogger } from '@/utils/unified-logger';

const logger = createLogger('DynamicTTL');

export interface TTLCalculationResult {
  /** 建议的TTL秒数 */
  ttlSeconds: number;
  /** 下一个行星时切换的时间戳 */
  nextSwitchTime: number;
  /** 距离下次切换的剩余毫秒数 */
  remainingMs: number;
  /** 是否处于切换敏感期（切换前5分钟内） */
  isSensitivePeriod: boolean;
  /** 计算详情，用于调试 */
  details: {
    currentTime: number;
    currentHourIndex: number;
    nextHourStartTime: number;
    safetyMarginMs: number;
    maxCacheTimeMs: number;
  };
}

/**
 * 缓存配置常量
 */
const CACHE_CONFIG = {
  /** 安全边际时间：提前3分钟过期缓存 */
  SAFETY_MARGIN_MS: 3 * 60 * 1000,

  /** 敏感期阈值：切换前5分钟内 */
  SENSITIVE_PERIOD_MS: 5 * 60 * 1000,

  /** 敏感期内的短TTL：30秒 */
  SENSITIVE_TTL_SECONDS: 30,

  /** 最大缓存时间：2小时 */
  MAX_CACHE_MS: 2 * 60 * 60 * 1000,

  /** 最小缓存时间：30秒 */
  MIN_CACHE_SECONDS: 30,

  /** 跨日边界前的保守TTL：10分钟 */
  CROSS_DAY_TTL_SECONDS: 10 * 60,

  /** 默认TTL（计算失败时的后备方案）：15分钟 */
  FALLBACK_TTL_SECONDS: 15 * 60,
} as const;

/**
 * 根据行星时数据计算动态TTL
 *
 * @param planetaryData 行星时计算结果
 * @param targetTime 目标时间，默认为当前时间
 * @returns TTL计算结果
 */
export function calculateDynamicTTL(
  planetaryData: PlanetaryHoursCalculationResult,
  targetTime: Date = new Date()
): TTLCalculationResult {
  const currentTime = targetTime.getTime();
  const { planetaryHours } = planetaryData;

  try {
    // 找到当前的行星时索引
    const currentHourIndex = planetaryHours.findIndex(
      hour => currentTime >= hour.startTime.getTime() && currentTime < hour.endTime.getTime()
    );

    if (currentHourIndex === -1) {
      // 如果没有找到当前行星时，可能是跨日情况
      logger.warn('未找到当前行星时，使用保守TTL策略', {
        currentTime: new Date(currentTime).toISOString(),
        firstHourStart: planetaryHours[0]?.startTime.toISOString(),
        lastHourEnd: planetaryHours[planetaryHours.length - 1]?.endTime.toISOString()
      });

      return {
        ttlSeconds: CACHE_CONFIG.CROSS_DAY_TTL_SECONDS,
        nextSwitchTime: currentTime + CACHE_CONFIG.CROSS_DAY_TTL_SECONDS * 1000,
        remainingMs: CACHE_CONFIG.CROSS_DAY_TTL_SECONDS * 1000,
        isSensitivePeriod: true,
        details: {
          currentTime,
          currentHourIndex,
          nextHourStartTime: 0,
          safetyMarginMs: CACHE_CONFIG.SAFETY_MARGIN_MS,
          maxCacheTimeMs: CACHE_CONFIG.MAX_CACHE_MS
        }
      };
    }

    // 确定下一个切换时间点
    let nextSwitchTime: number;
    if (currentHourIndex < planetaryHours.length - 1) {
      // 还有下一个行星时
      nextSwitchTime = planetaryHours[currentHourIndex + 1].startTime.getTime();
    } else {
      // 当前是最后一个行星时，切换到第二天第一个行星时
      // 使用保守策略，假设第二天第一个行星时在6小时后开始
      nextSwitchTime = currentTime + 6 * 60 * 60 * 1000;
      logger.info('当前是最后一个行星时，使用保守的跨日TTL策略');
    }

    // 计算剩余时间
    const remainingMs = nextSwitchTime - currentTime;

    // 计算建议的TTL
    const safetyMarginMs = CACHE_CONFIG.SAFETY_MARGIN_MS;
    const safeTTLMs = Math.max(remainingMs - safetyMarginMs, 0);

    // 限制TTL在合理范围内
    const cappedTTLMs = Math.min(safeTTLMs, CACHE_CONFIG.MAX_CACHE_MS);
    const finalTTLSeconds = Math.max(
      Math.floor(cappedTTLMs / 1000),
      CACHE_CONFIG.MIN_CACHE_SECONDS
    );

    // 检查是否处于敏感期
    const isSensitivePeriod = remainingMs <= CACHE_CONFIG.SENSITIVE_PERIOD_MS;
    const ttlSeconds = isSensitivePeriod ?
      CACHE_CONFIG.SENSITIVE_TTL_SECONDS :
      finalTTLSeconds;

    const result: TTLCalculationResult = {
      ttlSeconds,
      nextSwitchTime,
      remainingMs,
      isSensitivePeriod,
      details: {
        currentTime,
        currentHourIndex,
        nextHourStartTime: nextSwitchTime,
        safetyMarginMs,
        maxCacheTimeMs: CACHE_CONFIG.MAX_CACHE_MS
      }
    };

    logger.info('动态TTL计算完成', {
      ttlSeconds: result.ttlSeconds,
      nextSwitchTime: new Date(result.nextSwitchTime).toISOString(),
      remainingMinutes: Math.round(result.remainingMs / 1000 / 60),
      isSensitivePeriod: result.isSensitivePeriod,
      currentHourIndex: result.details.currentHourIndex
    });

    return result;

  } catch (error) {
    logger.error('动态TTL计算失败，使用后备TTL', error instanceof Error ? error : new Error(String(error)));

    return {
      ttlSeconds: CACHE_CONFIG.FALLBACK_TTL_SECONDS,
      nextSwitchTime: currentTime + CACHE_CONFIG.FALLBACK_TTL_SECONDS * 1000,
      remainingMs: CACHE_CONFIG.FALLBACK_TTL_SECONDS * 1000,
      isSensitivePeriod: false,
      details: {
        currentTime,
        currentHourIndex: -1,
        nextHourStartTime: 0,
        safetyMarginMs: CACHE_CONFIG.SAFETY_MARGIN_MS,
        maxCacheTimeMs: CACHE_CONFIG.MAX_CACHE_MS
      }
    };
  }
}

/**
 * 生成适用于ISR的revalidate值
 *
 * @param planetaryData 行星时计算结果
 * @param targetTime 目标时间，默认为当前时间
 * @returns revalidate秒数
 */
export function getISRRevalidateTime(
  planetaryData: PlanetaryHoursCalculationResult,
  targetTime?: Date
): number {
  const ttlResult = calculateDynamicTTL(planetaryData, targetTime);
  return ttlResult.ttlSeconds;
}

/**
 * 为HTTP响应头生成Cache-Control值
 *
 * @param planetaryData 行星时计算结果
 * @param targetTime 目标时间，默认为当前时间
 * @returns Cache-Control字符串
 */
export function generateCacheControlHeader(
  planetaryData: PlanetaryHoursCalculationResult,
  targetTime?: Date
): string {
  const ttlResult = calculateDynamicTTL(planetaryData, targetTime);
  const maxAge = ttlResult.ttlSeconds;

  if (ttlResult.isSensitivePeriod) {
    // 敏感期：短缓存 + 必须重新验证
    return `public, max-age=${maxAge}, must-revalidate, stale-while-revalidate=10`;
  } else {
    // 正常期：标准缓存策略
    return `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=60`;
  }
}

/**
 * 获取缓存键，包含切换时间戳确保版本唯一性
 *
 * @param planetaryData 行星时计算结果
 * @param additionalKeys 额外的缓存键组件
 * @returns 缓存键字符串
 */
export function generateCacheKey(
  planetaryData: PlanetaryHoursCalculationResult,
  additionalKeys: string[] = []
): string {
  const ttlResult = calculateDynamicTTL(planetaryData);
  const switchTimestamp = Math.floor(ttlResult.nextSwitchTime / 1000);
  const baseKeys = [
    planetaryData.requestedDate,
    planetaryData.timezone,
    `switch-${switchTimestamp}`
  ];

  return [...baseKeys, ...additionalKeys].join('-');
}
