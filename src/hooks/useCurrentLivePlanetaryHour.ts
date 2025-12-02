import { useState, useEffect, useCallback, useRef } from "react";
import { createLogger } from '@/utils/unified-logger';
import {
  planetaryHoursCalculator,
  PlanetaryHour,
  PlanetaryHoursCalculationResult,
} from "../services/PlanetaryHoursCalculator";
import {
  FormattedPlanetaryHour,
  formatSingleHour,
} from "../utils/planetaryHourFormatters";

// 将 logger 创建移到组件外部，避免每次渲染时重新创建
const logger = createLogger('UseCurrentLivePlanetaryHour');

interface UseCurrentLivePlanetaryHourProps {
  planetaryHoursRaw: PlanetaryHoursCalculationResult | null;
  // 明确需要用于昨日计算的坐标，因为 planetaryHoursRaw 可能对应不同的日期/位置
  currentCoordinatesForYesterdayCalc: {
    latitude: number;
    longitude: number;
  } | null;
  // 用于确定 planetaryHoursRaw 是否对应"今天"的日期
  dateForPlanetaryHoursRaw: Date | null;
  timeFormat: "12h" | "24h";
  /** 是否启用精确同步模式（第二阶段功能）默认启用 */
  enablePreciseSync?: boolean;
}

// 前一天数据缓存（带大小限制）
const MAX_CACHE_SIZE = 20;
const yesterdayCache = new Map<string, PlanetaryHoursCalculationResult>();
const pendingRequests = new Map<string, Promise<PlanetaryHoursCalculationResult | null>>();

// 缓存清理函数
function cleanupOldCache() {
  if (yesterdayCache.size > MAX_CACHE_SIZE) {
    // 删除最早添加的条目（Map 保持插入顺序）
    const keysToDelete = Array.from(yesterdayCache.keys()).slice(0, yesterdayCache.size - MAX_CACHE_SIZE);
    keysToDelete.forEach(key => yesterdayCache.delete(key));
  }
}

/**
 * Hook to manage and update the current live planetary hour.
 *
 * 🚀 第二阶段升级功能：
 * - 精确模式：使用 useUnifiedPlanetaryTime 提供毫秒级精确切换
 * - 兼容模式：保持原有60秒轮询作为fallback
 * - 智能检测：根据数据可用性自动选择最优模式
 *
 * 原有功能保持：
 * - 判断 planetaryHoursRaw 数据是否为"今天"
 * - 计算并提供当前行星时，自动更新
 * - 处理日出前逻辑，检查前一天数据
 */
export function useCurrentLivePlanetaryHour({
  planetaryHoursRaw,
  currentCoordinatesForYesterdayCalc,
  dateForPlanetaryHoursRaw, // 传入用于计算 planetaryHoursRaw 的原始Date对象
  timeFormat,
  enablePreciseSync: _enablePreciseSync = false, // 保留参数以兼容第二阶段配置，当前简化版本未使用
}: UseCurrentLivePlanetaryHourProps): FormattedPlanetaryHour | null {
  const [currentLiveHour, setCurrentLiveHour] =
    useState<FormattedPlanetaryHour | null>(null);

  // 简化版本：移除复杂的精确同步，只保留兼容模式
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCalculationRef = useRef<string>("");

  /**
   * 简化的计算逻辑（保持原有逻辑）
   */
  const calculateAndSetCurrentHour = useCallback(
    async (nowUtc: Date) => {
      logger.debug("🧮 [LiveHour] 开始计算实时当前行星时（兼容模式）");
      if (
        !planetaryHoursRaw ||
        !planetaryHoursRaw.timezone ||
        !dateForPlanetaryHoursRaw
      ) {
        logger.debug("⚠️ [LiveHour] 缺少必要数据，无法计算", {
          planetaryHoursRawExists: !!planetaryHoursRaw,
          timezone: planetaryHoursRaw?.timezone,
          dateForPlanetaryHoursRaw,
        });
        setCurrentLiveHour(null);
        return;
      }

      const { timezone, sunriseLocal } =
        planetaryHoursRaw as PlanetaryHoursCalculationResult;

      // 创建计算标识符，避免重复计算
      const calculationKey = `${nowUtc.getTime()}_${timezone}_${sunriseLocal?.getTime()}_${currentCoordinatesForYesterdayCalc?.latitude}_${currentCoordinatesForYesterdayCalc?.longitude}`;
      if (calculationKey === lastCalculationRef.current) {
        logger.debug("⚡ [LiveHour] 跳过重复计算");
        return;
      }
      lastCalculationRef.current = calculationKey;

      // 直接尝试在当前数据中寻找正在进行的行星时
      let currentPhysicalHour: PlanetaryHour | null =
        planetaryHoursCalculator.getCurrentHour(planetaryHoursRaw, nowUtc);
      logger.debug("🔍 [LiveHour] 当前物理行星时: ", currentPhysicalHour);

      // 如果未找到且当前时间在 "日出前" 的夜间，则尝试用前一天的数据再算一次
      if (!currentPhysicalHour && sunriseLocal && nowUtc < sunriseLocal) {
        logger.debug("🌄 [LiveHour] 当前时间在日出前，尝试计算前一天的夜间小时");
        if (currentCoordinatesForYesterdayCalc) {
          try {
            const yesterdayDate = new Date(sunriseLocal);
            yesterdayDate.setDate(yesterdayDate.getDate() - 1);
            logger.debug(
              "📆 [LiveHour] 前一天日期: ",
              yesterdayDate.toISOString(),
            );

            // 创建缓存键
            const cacheKey = `${yesterdayDate.toDateString()}_${currentCoordinatesForYesterdayCalc.latitude}_${currentCoordinatesForYesterdayCalc.longitude}_${timezone}`;

            let yesterdayResult: PlanetaryHoursCalculationResult | null = null;

            // 检查缓存
            if (yesterdayCache.has(cacheKey)) {
              yesterdayResult = yesterdayCache.get(cacheKey)!;
              logger.data("[LiveHour] 使用缓存的前一天数据");
            } else if (pendingRequests.has(cacheKey)) {
              // 如果有正在进行的请求，等待它完成
              logger.debug("⏳ [LiveHour] 等待正在进行的前一天数据请求");
              yesterdayResult = await pendingRequests.get(cacheKey)!;
            } else {
              // 创建新的请求
              logger.process("[LiveHour] 发起新的前一天数据请求");
              const requestPromise = planetaryHoursCalculator.calculate(
                yesterdayDate,
                currentCoordinatesForYesterdayCalc.latitude,
                currentCoordinatesForYesterdayCalc.longitude,
                timezone,
              );

              pendingRequests.set(cacheKey, requestPromise);

              try {
                yesterdayResult = await requestPromise;
                if (yesterdayResult) {
                  yesterdayCache.set(cacheKey, yesterdayResult);
                  cleanupOldCache(); // 检查并清理超出限制的缓存
                  // 设置缓存过期时间（24小时后清理）
                  setTimeout(() => {
                    yesterdayCache.delete(cacheKey);
                  }, 24 * 60 * 60 * 1000);
                }
              } finally {
                pendingRequests.delete(cacheKey);
              }
            }

            if (yesterdayResult) {
              currentPhysicalHour = planetaryHoursCalculator.getCurrentHour(
                yesterdayResult,
                nowUtc,
              );
              logger.debug(
                "🔍 [LiveHour] 前一天计算结果中的当前小时: ",
                currentPhysicalHour,
              );
            }
          } catch (error) {
            const err = error instanceof Error ? error : new Error('Unknown error calculating previous day planetary hours');
            logger.error("❌ [LiveHour] 计算前一天行星时出错:", err);
          }
        } else {
          logger.error("⚠️ [LiveHour] 缺少前一天计算所需坐标", new Error('Missing coordinates for yesterday calculation'));
        }
      }

      // 如果依然没有找到，但当前时间落在 planetaryHoursRaw 的夜晚时段尾巴（日落后到 nextSunrise）
      // 且 nextSunriseLocal 存在且 nowUtc < nextSunriseLocal，则 currentPhysicalHour 仍应在当前数据范围，
      // 这里再次尝试。
      if (
        !currentPhysicalHour &&
        nextSunriseLocal &&
        nowUtc < nextSunriseLocal
      ) {
        currentPhysicalHour = planetaryHoursCalculator.getCurrentHour(
          planetaryHoursRaw,
          nowUtc,
        );
      }

      const formatted = formatSingleHour(
        currentPhysicalHour,
        timezone,
        timeFormat,
        true,
      );
      logger.debug("🎨 [LiveHour] 格式化后的当前行星时: ", formatted);
      setCurrentLiveHour(formatted);
    },
    [
      planetaryHoursRaw,
      currentCoordinatesForYesterdayCalc,
      dateForPlanetaryHoursRaw,
      timeFormat,
    ],
  );

  /**
   * 简化的状态更新 - 只使用60秒轮询
   */
  useEffect(() => {
    logger.info("✨ [LiveHour] 启用简化同步模式", {
      currentPlanet: currentLiveHour?.planet,
      syncStatus: 'synced',
      remainingMs: 0
    });

    // 清理之前的interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // 只有当有基本数据时才执行计算
    if (!planetaryHoursRaw || !dateForPlanetaryHoursRaw) {
      setCurrentLiveHour(null);
      return;
    }

    const nowUtc = new Date();
    calculateAndSetCurrentHour(nowUtc); // Initial call

    // 启动60秒定时器
    intervalRef.current = setInterval(() => {
      const nowUtc = new Date();
      calculateAndSetCurrentHour(nowUtc);
    }, 60000); // 每60秒更新一次

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    planetaryHoursRaw,
    dateForPlanetaryHoursRaw,
    calculateAndSetCurrentHour,
    currentLiveHour?.planet,
  ]);

  // 🎯 返回最终结果
  // 精确模式会通过useEffect自动设置，兼容模式也会设置
  return currentLiveHour;
}
