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

const logger = createLogger('UseCurrentLivePlanetaryHour');

interface UseCurrentLivePlanetaryHourProps {
  planetaryHoursRaw: PlanetaryHoursCalculationResult | null;
  currentCoordinatesForYesterdayCalc: {
    latitude: number;
    longitude: number;
  } | null;
  dateForPlanetaryHoursRaw: Date | null;
  timeFormat: "12h" | "24h";
}

// 前一天数据缓存
const yesterdayCache = new Map<string, PlanetaryHoursCalculationResult>();
const pendingRequests = new Map<string, Promise<PlanetaryHoursCalculationResult | null>>();

/**
 * Hook to manage and update the current live planetary hour.
 * 简化版：使用60秒定时器，移除复杂的精确同步逻辑
 */
export function useCurrentLivePlanetaryHour({
  planetaryHoursRaw,
  currentCoordinatesForYesterdayCalc,
  dateForPlanetaryHoursRaw,
  timeFormat,
}: UseCurrentLivePlanetaryHourProps): FormattedPlanetaryHour | null {
  const [currentLiveHour, setCurrentLiveHour] = useState<FormattedPlanetaryHour | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCalculationRef = useRef<string>("");

  /**
   * 计算当前行星时
   */
  const calculateAndSetCurrentHour = useCallback(
    async (nowUtc: Date) => {
      logger.debug("🧮 开始计算实时当前行星时");
      if (
        !planetaryHoursRaw ||
        !planetaryHoursRaw.timezone ||
        !dateForPlanetaryHoursRaw
      ) {
        logger.debug("⚠️ 缺少必要数据，无法计算", {
          planetaryHoursRawExists: !!planetaryHoursRaw,
          timezone: planetaryHoursRaw?.timezone,
          dateForPlanetaryHoursRaw,
        });
        setCurrentLiveHour(null);
        return;
      }

      const { timezone, sunriseLocal, nextSunriseLocal } = planetaryHoursRaw;

      // 创建计算标识符，避免重复计算
      const calculationKey = `${nowUtc.getTime()}_${timezone}_${sunriseLocal?.getTime()}_${currentCoordinatesForYesterdayCalc?.latitude}_${currentCoordinatesForYesterdayCalc?.longitude}`;
      if (calculationKey === lastCalculationRef.current) {
        logger.debug("⚡ 跳过重复计算");
        return;
      }
      lastCalculationRef.current = calculationKey;

      // 直接尝试在当前数据中寻找正在进行的行星时
      let currentPhysicalHour: PlanetaryHour | null =
        planetaryHoursCalculator.getCurrentHour(planetaryHoursRaw, nowUtc);
      logger.debug("🔍 当前物理行星时: ", currentPhysicalHour);

      // 如果未找到且当前时间在日出前，则尝试用前一天的数据
      if (!currentPhysicalHour && sunriseLocal && nowUtc < sunriseLocal) {
        logger.debug("🌄 当前时间在日出前，尝试计算前一天的夜间小时");
        if (currentCoordinatesForYesterdayCalc) {
          try {
            const yesterdayDate = new Date(sunriseLocal);
            yesterdayDate.setDate(yesterdayDate.getDate() - 1);
            logger.debug("📆 前一天日期: ", yesterdayDate.toISOString());

            // 创建缓存键
            const cacheKey = `${yesterdayDate.toDateString()}_${currentCoordinatesForYesterdayCalc.latitude}_${currentCoordinatesForYesterdayCalc.longitude}_${timezone}`;

            let yesterdayResult: PlanetaryHoursCalculationResult | null = null;

            // 检查缓存
            if (yesterdayCache.has(cacheKey)) {
              yesterdayResult = yesterdayCache.get(cacheKey)!;
              logger.data("使用缓存的前一天数据");
            } else if (pendingRequests.has(cacheKey)) {
              logger.debug("⏳ 等待正在进行的前一天数据请求");
              yesterdayResult = await pendingRequests.get(cacheKey)!;
            } else {
              logger.process("发起新的前一天数据请求");
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
              logger.debug("🔍 前一天计算结果中的当前小时: ", currentPhysicalHour);
            }
          } catch (error) {
            const err = error instanceof Error ? error : new Error('Unknown error calculating previous day planetary hours');
            logger.error("❌ 计算前一天行星时出错:", err);
          }
        } else {
          logger.error("⚠️ 缺少前一天计算所需坐标", new Error('Missing coordinates for yesterday calculation'));
        }
      }

      // 如果依然没有找到，再次尝试当前数据
      if (!currentPhysicalHour && nextSunriseLocal && nowUtc < nextSunriseLocal) {
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
      logger.debug("🎨 格式化后的当前行星时: ", formatted);
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
   * 设置定时器进行定期更新
   */
  useEffect(() => {
    // 清理之前的interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // 如果没有基本数据，设为null并返回
    if (!planetaryHoursRaw || !dateForPlanetaryHoursRaw) {
      setCurrentLiveHour(null);
      return;
    }

    const nowUtc = new Date();
    calculateAndSetCurrentHour(nowUtc); // 初始调用

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
  }, [planetaryHoursRaw, dateForPlanetaryHoursRaw, calculateAndSetCurrentHour]);

  return currentLiveHour;
}