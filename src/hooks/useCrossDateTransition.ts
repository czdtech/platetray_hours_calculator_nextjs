/**
 * 跨日边界无缝处理Hook
 *
 * 第三阶段核心功能：
 * - 预测并预取明日行星时数据
 * - 在跨日边界时实现无缝切换
 * - 管理多日数据的内存缓存
 * - 处理时区相关的日期切换逻辑
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { addDays } from 'date-fns';
import { planetaryHoursCalculator, PlanetaryHoursCalculationResult } from '@/services/PlanetaryHoursCalculator';
import { createLogger } from '@/utils/unified-logger';

const logger = createLogger('CrossDateTransition');

export interface CrossDateTransitionConfig {
  /** 当前日期的行星时数据 */
  currentData: PlanetaryHoursCalculationResult | null;
  /** 坐标信息 */
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
  /** 当前使用的日期 */
  currentDate: Date | null;
  /** 是否启用跨日处理 */
  enabled: boolean;
  /** 预取阈值：最后一个行星时的前多少毫秒开始预取 (默认30分钟) */
  prefetchThresholdMs?: number;
}

export interface CrossDateTransitionState {
  /** 明日数据 */
  tomorrowData: PlanetaryHoursCalculationResult | null;
  /** 昨日数据 */
  yesterdayData: PlanetaryHoursCalculationResult | null;
  /** 是否正在预取明日数据 */
  isPrefetchingTomorrow: boolean;
  /** 是否处于跨日敏感期 */
  isCrossDateSensitive: boolean;
  /** 预取状态 */
  prefetchStatus: 'idle' | 'prefetching' | 'success' | 'error';
  /** 错误信息 */
  error: string | null;
  /** 缓存统计 */
  cacheStats: {
    totalDays: number;
    memoryUsage: number; // 估算的内存使用量（KB）
    lastCleanup: Date | null;
  };
}

const DEFAULT_CONFIG = {
  prefetchThresholdMs: 30 * 60 * 1000, // 30分钟
} as const;

// 多日数据缓存
const multiDayCache = new Map<string, {
  data: PlanetaryHoursCalculationResult;
  timestamp: number;
  accessCount: number;
}>();

// 正在进行的请求缓存
const pendingRequests = new Map<string, Promise<PlanetaryHoursCalculationResult | null>>();

/**
 * 生成缓存键
 */
function generateCacheKey(
  date: Date,
  latitude: number,
  longitude: number,
  timezone: string
): string {
  const dateStr = formatInTimeZone(date, timezone, 'yyyy-MM-dd');
  return `${dateStr}_${latitude.toFixed(4)}_${longitude.toFixed(4)}_${timezone}`;
}

/**
 * 清理过期缓存
 */
function cleanupExpiredCache(): void {
  const now = Date.now();
  const maxAge = 48 * 60 * 60 * 1000; // 48小时
  const maxEntries = 7; // 最多保留7天数据

  // 删除过期数据
  for (const [key, entry] of multiDayCache.entries()) {
    if (now - entry.timestamp > maxAge) {
      multiDayCache.delete(key);
      logger.info('清理过期缓存', { key, age: now - entry.timestamp });
    }
  }

  // 如果缓存条目过多，删除访问次数最少的
  if (multiDayCache.size > maxEntries) {
    const sorted = Array.from(multiDayCache.entries())
      .sort((a, b) => a[1].accessCount - b[1].accessCount);

    const toDelete = sorted.slice(0, multiDayCache.size - maxEntries);
    toDelete.forEach(([key]) => {
      multiDayCache.delete(key);
      logger.info('清理LRU缓存', { key });
    });
  }
}

/**
 * 估算缓存内存使用量
 */
function estimateCacheMemoryUsage(): number {
  let totalSize = 0;
  for (const [key, entry] of multiDayCache.entries()) {
    // 粗略估算：每个行星时数据约1KB，每日24个，加上元数据
    const dataSize = entry.data.planetaryHours.length * 1; // KB
    const keySize = key.length / 1024; // 字符串大小
    totalSize += dataSize + keySize;
  }
  return Math.round(totalSize);
}

/**
 * 跨日边界无缝处理Hook
 */
export function useCrossDateTransition(config: CrossDateTransitionConfig): CrossDateTransitionState {
  const {
    currentData,
    coordinates,
    currentDate,
    enabled,
    prefetchThresholdMs = DEFAULT_CONFIG.prefetchThresholdMs
  } = config;

  const [state, setState] = useState<CrossDateTransitionState>({
    tomorrowData: null,
    yesterdayData: null,
    isPrefetchingTomorrow: false,
    isCrossDateSensitive: false,
    prefetchStatus: 'idle',
    error: null,
    cacheStats: {
      totalDays: 0,
      memoryUsage: 0,
      lastCleanup: null
    }
  });

  const lastCleanupRef = useRef<number>(0);
  const prefetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 从缓存或API获取指定日期的数据
   */
  const fetchDateData = useCallback(async (
    targetDate: Date,
    timezone: string
  ): Promise<PlanetaryHoursCalculationResult | null> => {
    if (!coordinates) return null;

    const cacheKey = generateCacheKey(targetDate, coordinates.latitude, coordinates.longitude, timezone);

    // 检查缓存
    const cached = multiDayCache.get(cacheKey);
    if (cached) {
      cached.accessCount++;
      cached.timestamp = Date.now(); // 更新访问时间
      logger.info('从缓存获取数据', {
        date: formatInTimeZone(targetDate, timezone, 'yyyy-MM-dd'),
        accessCount: cached.accessCount
      });
      return cached.data;
    }

    // 检查是否有正在进行的请求
    if (pendingRequests.has(cacheKey)) {
      logger.info('等待正在进行的请求', { cacheKey });
      return await pendingRequests.get(cacheKey)!;
    }

    // 创建新请求
    const requestPromise = planetaryHoursCalculator.calculate(
      targetDate,
      coordinates.latitude,
      coordinates.longitude,
      timezone
    );

    pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;

      if (result) {
        // 存储到缓存
        multiDayCache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
          accessCount: 1
        });

        logger.info('成功获取并缓存数据', {
          date: formatInTimeZone(targetDate, timezone, 'yyyy-MM-dd'),
          cacheSize: multiDayCache.size
        });
      }

      return result;
    } catch (error) {
      logger.error('获取日期数据失败', error instanceof Error ? error : new Error(String(error)));
      return null;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  }, [coordinates]);

  /**
   * 预取明日数据
   */
  const prefetchTomorrowData = useCallback(async (): Promise<void> => {
    if (!currentData || !currentDate || !coordinates) return;

    setState(prev => ({
      ...prev,
      isPrefetchingTomorrow: true,
      prefetchStatus: 'prefetching'
    }));

    try {
      const timezone = currentData.timezone;
      const tomorrowDate = addDays(currentDate, 1);

      logger.info('开始预取明日数据', {
        today: formatInTimeZone(currentDate, timezone, 'yyyy-MM-dd'),
        tomorrow: formatInTimeZone(tomorrowDate, timezone, 'yyyy-MM-dd')
      });

      const tomorrowData = await fetchDateData(tomorrowDate, timezone);

      setState(prev => ({
        ...prev,
        tomorrowData,
        isPrefetchingTomorrow: false,
        prefetchStatus: tomorrowData ? 'success' : 'error',
        error: tomorrowData ? null : '预取明日数据失败'
      }));

      if (tomorrowData) {
        logger.info('明日数据预取成功', {
          tomorrow: formatInTimeZone(tomorrowDate, timezone, 'yyyy-MM-dd'),
          hoursCount: tomorrowData.planetaryHours.length
        });
      }

    } catch (error) {
      setState(prev => ({
        ...prev,
        isPrefetchingTomorrow: false,
        prefetchStatus: 'error',
        error: error instanceof Error ? error.message : '预取失败'
      }));

      logger.error('预取明日数据失败', error instanceof Error ? error : new Error(String(error)));
    }
  }, [currentData, currentDate, coordinates, fetchDateData]);

  /**
   * 预取昨日数据（用于跨日边界前的夜间时段）
   */
  const prefetchYesterdayData = useCallback(async (): Promise<void> => {
    if (!currentData || !currentDate || !coordinates) return;

    try {
      const timezone = currentData.timezone;
      const yesterdayDate = addDays(currentDate, -1);

      const yesterdayData = await fetchDateData(yesterdayDate, timezone);

      setState(prev => ({
        ...prev,
        yesterdayData,
        error: yesterdayData ? prev.error : '预取昨日数据失败'
      }));

      if (yesterdayData) {
        logger.info('昨日数据预取成功', {
          yesterday: formatInTimeZone(yesterdayDate, timezone, 'yyyy-MM-dd'),
          hoursCount: yesterdayData.planetaryHours.length
        });
      }

    } catch (error) {
      logger.error('预取昨日数据失败', error instanceof Error ? error : new Error(String(error)));
    }
  }, [currentData, currentDate, coordinates, fetchDateData]);

  /**
   * 检查是否需要预取数据
   */
  const checkPrefetchTrigger = useCallback((): void => {
    if (!enabled || !currentData || state.isPrefetchingTomorrow) return;

    const now = new Date();
    const { planetaryHours } = currentData;

    if (planetaryHours.length === 0) return;

    // 找到最后一个行星时
    const lastHour = planetaryHours[planetaryHours.length - 1];
    const timeUntilLastHourEnd = lastHour.endTime.getTime() - now.getTime();

    // 检查是否处于跨日敏感期
    const isCrossDateSensitive = timeUntilLastHourEnd <= prefetchThresholdMs && timeUntilLastHourEnd > 0;

    // 更新敏感期状态
    setState(prev => ({ ...prev, isCrossDateSensitive }));

    // 如果进入敏感期且还没有明日数据，开始预取
    if (isCrossDateSensitive && !state.tomorrowData && state.prefetchStatus !== 'prefetching') {
      logger.info('触发明日数据预取', {
        timeUntilEnd: Math.round(timeUntilLastHourEnd / 1000 / 60),
        threshold: Math.round(prefetchThresholdMs / 1000 / 60)
      });
      prefetchTomorrowData();
    }

    // 检查是否需要昨日数据（当前时间在第一个行星时之前）
    const firstHour = planetaryHours[0];
    if (now < firstHour.startTime && !state.yesterdayData) {
      prefetchYesterdayData();
    }

  }, [enabled, currentData, state.isPrefetchingTomorrow, state.tomorrowData, state.yesterdayData, state.prefetchStatus, prefetchThresholdMs, prefetchTomorrowData, prefetchYesterdayData]);

  /**
   * 定期缓存清理
   */
  const performCacheCleanup = useCallback((): void => {
    const now = Date.now();

    // 每小时清理一次
    if (now - lastCleanupRef.current > 60 * 60 * 1000) {
      cleanupExpiredCache();
      lastCleanupRef.current = now;

      const memoryUsage = estimateCacheMemoryUsage();
      setState(prev => ({
        ...prev,
        cacheStats: {
          totalDays: multiDayCache.size,
          memoryUsage,
          lastCleanup: new Date()
        }
      }));

      logger.info('缓存清理完成', {
        totalDays: multiDayCache.size,
        memoryUsage: `${memoryUsage}KB`
      });
    }
  }, []);

  // 定期检查预取触发条件
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!enabled) return;

    // 立即检查一次
    checkPrefetchTrigger();
    performCacheCleanup();

    // 设置定期检查（每分钟检查一次）
    const interval = setInterval(() => {
      checkPrefetchTrigger();
      performCacheCleanup();
    }, 60000);

    return () => {
      clearInterval(interval);
      // 将 ref 的当前值复制到局部变量，避免在 cleanup 执行时引用已变化的 ref
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const timeoutId = prefetchTimeoutRef.current;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [enabled, checkPrefetchTrigger, performCacheCleanup]);

  // 数据变化时清理状态
  useEffect(() => {
    setState(prev => ({
      ...prev,
      tomorrowData: null,
      yesterdayData: null,
      isPrefetchingTomorrow: false,
      isCrossDateSensitive: false,
      prefetchStatus: 'idle',
      error: null
    }));
  }, [currentData, currentDate, coordinates]);

  // 更新缓存统计
  useEffect(() => {
    setState(prev => ({
      ...prev,
      cacheStats: {
        ...prev.cacheStats,
        totalDays: multiDayCache.size,
        memoryUsage: estimateCacheMemoryUsage()
      }
    }));
  }, [state.tomorrowData, state.yesterdayData]);

  return state;
}

/**
 * 获取跨日边界的合并数据
 *
 * 在跨日边界附近，可能需要昨日夜间数据或明日数据
 */
export function useMergedCrossDateData(
  currentData: PlanetaryHoursCalculationResult | null,
  crossDateState: CrossDateTransitionState,
  currentTime: Date = new Date()
): PlanetaryHoursCalculationResult | null {

  if (!currentData) return null;

  const { tomorrowData, yesterdayData } = crossDateState;
  const { planetaryHours } = currentData;

  if (planetaryHours.length === 0) return currentData;

  // 检查当前时间是否在数据范围内
  const firstHour = planetaryHours[0];
  const lastHour = planetaryHours[planetaryHours.length - 1];

  // 如果当前时间在第一个行星时之前，尝试使用昨日数据
  if (currentTime < firstHour.startTime && yesterdayData) {
    const currentInYesterday = planetaryHoursCalculator.getCurrentHour(yesterdayData, currentTime);
    if (currentInYesterday) {
      logger.info('使用昨日数据处理跨日边界', {
        currentTime: currentTime.toISOString(),
        yesterdayHour: currentInYesterday.ruler
      });
      return yesterdayData;
    }
  }

  // 如果当前时间在最后一个行星时之后，尝试使用明日数据
  if (currentTime > lastHour.endTime && tomorrowData) {
    const currentInTomorrow = planetaryHoursCalculator.getCurrentHour(tomorrowData, currentTime);
    if (currentInTomorrow) {
      logger.info('使用明日数据处理跨日边界', {
        currentTime: currentTime.toISOString(),
        tomorrowHour: currentInTomorrow.ruler
      });
      return tomorrowData;
    }
  }

  // 默认返回当前数据
  return currentData;
}
