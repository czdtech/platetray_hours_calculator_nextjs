import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import {
  planetaryHoursCalculator,
  PlanetaryHoursCalculationResult,
  PlanetaryHour,
} from "../services/PlanetaryHoursCalculator";
import {
  timeZoneService,
  TimeZoneValidationResult,
} from "../services/TimeZoneService";
import {
  formatHoursToList,
  FormattedPlanetaryHour,
} from "../utils/planetaryHourFormatters";
import { useCurrentLivePlanetaryHour } from "./useCurrentLivePlanetaryHour";
import { useNetworkOptimization } from "./usePerformanceOptimization";

import { createLogger } from '@/utils/unified-logger';

// 将 logger 创建移到组件外部，避免每次渲染时重新创建
const logger = createLogger('UsePlanetaryHours');

// 定义钩子返回的结果接口
export interface UsePlanetaryHoursResult {
  planetaryHoursRaw: PlanetaryHoursCalculationResult | null;
  currentHour: FormattedPlanetaryHour | null;
  daytimeHours: FormattedPlanetaryHour[];
  nighttimeHours: FormattedPlanetaryHour[];
  isLoading: boolean;
  error: string | null;
  calculate: (
    latitude: number,
    longitude: number,
    date: Date,
    timezone: string,
  ) => Promise<void>;
}

/**
 * 行星时间钩子
 * 用于计算和管理行星时间数据
 * @param timeFormat 时间格式，12小时制或24小时制
 * @returns 行星时间数据和相关方法
 */
export function usePlanetaryHours(
  timeFormat: "12h" | "24h" = "24h",
  initialData: PlanetaryHoursCalculationResult | null = null,
): UsePlanetaryHoursResult {
  const [planetaryHoursRaw, setPlanetaryHoursRaw] =
    useState<PlanetaryHoursCalculationResult | null>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCoordinates, setCurrentCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedDateForCalc, setSelectedDateForCalc] = useState<Date | null>(
    null,
  );

  const lastParamsRef = useRef<string | null>(null);
  const initialDataProcessedRef = useRef(false);
  const { dedupeRequest: networkDedupe } = useNetworkOptimization();

  // 若提供 initialData，在 useEffect 中设定 lastParamsRef，避免在渲染期间修改 ref
  useEffect(() => {
    if (initialData && !initialDataProcessedRef.current) {
      const initialKey = `${initialData.latitude.toFixed(6)}_${initialData.longitude.toFixed(6)}_${initialData.requestedDate}_${initialData.timezone}`;
      lastParamsRef.current = initialKey;
      initialDataProcessedRef.current = true;

      // 使用预计算数据初始化原始数据和坐标
      setPlanetaryHoursRaw(initialData);
      setCurrentCoordinates({
        latitude: initialData.latitude,
        longitude: initialData.longitude,
      });
      setSelectedDateForCalc(initialData.dateUsedForCalculation);
    }
  }, [initialData]);

  // 使用新的 Hook 获取实时当前行星时
  const currentHour = useCurrentLivePlanetaryHour({
    planetaryHoursRaw,
    currentCoordinatesForYesterdayCalc: currentCoordinates,
    dateForPlanetaryHoursRaw: selectedDateForCalc,
    timeFormat,
  });

  const calculate = useCallback(
    async (
      latitude: number,
      longitude: number,
      date: Date,
      timezoneInput: string,
    ) => {
      try {
        const standardizedLatitude = Number(latitude.toFixed(6));
        const standardizedLongitude = Number(longitude.toFixed(6));
        const clonedDate = new Date(date);

        // 修复：使用日期字符串而不是完整时间戳来创建参数键，避免缓存问题
        const dateStr = timeZoneService.formatInTimeZone(clonedDate, timezoneInput, "yyyy-MM-dd");
        const paramKey = `${standardizedLatitude}_${standardizedLongitude}_${dateStr}_${timezoneInput}`;

        // 若与上一次计算参数完全一致，则直接跳过
        if (paramKey === lastParamsRef.current) {
          logger.debug("⚡ [Performance] 跳过重复计算，参数未变化");
          return;
        }

        setIsLoading(true);
        setError(null);
        // 保持旧数据直到新数据计算完成，避免闪烁

        logger.debug(
          `计算行星时: 日期=${dateStr}, 时区=${timezoneInput}, 坐标=[${latitude}, ${longitude}]`,
        );

        // 使用网络请求去重
        const result = await networkDedupe(paramKey, async () => {
          const timeZoneValidation: TimeZoneValidationResult =
            timeZoneService.validateTimeZone(timezoneInput);
          if (!timeZoneValidation.isValid) {
            throw new Error(
              timeZoneValidation.message || "Invalid timezone provided",
            );
          }
          // 如果时区验证通过，直接使用输入的时区
          const validTimezone = timezoneInput;

          // 确保使用的是原始日期进行计算，不要在这里做时区转换
          return await planetaryHoursCalculator.calculate(
            clonedDate,
            standardizedLatitude,
            standardizedLongitude,
            validTimezone,
          );
        });

        // Add null check for result before accessing its properties
        if (result) {
          logger.debug(
            `计算结果: 日出=${result.sunrise?.toISOString()}, 日落=${result.sunset?.toISOString()}, 行星时数量=${result.planetaryHours?.length || 0}, 请求日期=${result.requestedDate}`,
          );

          // 同时更新所有相关状态，避免中间状态触发useCurrentLivePlanetaryHour
          setPlanetaryHoursRaw(result);
          setCurrentCoordinates({
            latitude: standardizedLatitude,
            longitude: standardizedLongitude,
          });
          setSelectedDateForCalc(clonedDate);
          lastParamsRef.current = paramKey;
        } else {
          // Handle the case where result is null, perhaps set an error or clear existing data
          setError("Planetary hours data is not available for this date and location (polar day/night or invalid sunrise/sunset).");
          setPlanetaryHoursRaw(null);
          setCurrentCoordinates(null);
          setSelectedDateForCalc(null);
          lastParamsRef.current = null; // Clear last params if calculation failed
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error calculating planetary hours');
        logger.error("计算行星时出错:", err);
        setError(
          err.message || "计算出错，请重试"
        );
        setPlanetaryHoursRaw(null);
        setCurrentCoordinates(null);
        setSelectedDateForCalc(null);
        lastParamsRef.current = null;
      } finally {
        setIsLoading(false);
      }
    },
    [networkDedupe],
  );

  // 优化格式化计算 - 移除currentHour依赖，避免重复计算
  const daytimeHours = useMemo(() => {
    if (!planetaryHoursRaw?.planetaryHours || !planetaryHoursRaw.timezone) {
      return [];
    }

    logger.process("[Formatting] 重新计算白天行星时列表");
    return formatHoursToList(
      planetaryHoursRaw.planetaryHours.filter(
        (h: PlanetaryHour) => h.type === "day",
      ),
      planetaryHoursRaw.timezone,
      timeFormat,
      undefined, // 不传递currentHour，让formatHoursToList内部计算高亮
      true, // 允许高亮
    );
  }, [planetaryHoursRaw, timeFormat]);

  const nighttimeHours = useMemo(() => {
    if (!planetaryHoursRaw?.planetaryHours || !planetaryHoursRaw.timezone) {
      return [];
    }

    logger.process("[Formatting] 重新计算夜间行星时列表");
    return formatHoursToList(
      planetaryHoursRaw.planetaryHours.filter(
        (h: PlanetaryHour) => h.type === "night",
      ),
      planetaryHoursRaw.timezone,
      timeFormat,
      undefined, // 不传递currentHour，让formatHoursToList内部计算高亮
      true, // 允许高亮
    );
  }, [planetaryHoursRaw, timeFormat]);

  return {
    planetaryHoursRaw,
    currentHour,
    daytimeHours,
    nighttimeHours,
    isLoading,
    error,
    calculate,
  };
}
