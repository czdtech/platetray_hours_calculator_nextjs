import { useState, useCallback, useRef } from 'react';
import { planetaryHoursCalculator, PlanetaryHoursCalculationResult, PlanetaryHour } from '../services/PlanetaryHoursCalculator';
import { timeZoneService, TimeZoneValidationResult } from '../services/TimeZoneService';
import { formatHoursToList, FormattedPlanetaryHour } from '../utils/planetaryHourFormatters';
import { useCurrentLivePlanetaryHour } from './useCurrentLivePlanetaryHour';

// 定义钩子返回的结果接口
export interface UsePlanetaryHoursResult {
  planetaryHoursRaw: PlanetaryHoursCalculationResult | null;
  currentHour: FormattedPlanetaryHour | null;
  daytimeHours: FormattedPlanetaryHour[];
  nighttimeHours: FormattedPlanetaryHour[];
  isLoading: boolean;
  error: string | null;
  calculate: (latitude: number, longitude: number, date: Date, timezone: string) => Promise<void>;
}

/**
 * 行星时间钩子
 * 用于计算和管理行星时间数据
 * @param timeFormat 时间格式，12小时制或24小时制
 * @returns 行星时间数据和相关方法
 */
export function usePlanetaryHours(timeFormat: '12h' | '24h' = '24h'): UsePlanetaryHoursResult {
  const [planetaryHoursRaw, setPlanetaryHoursRaw] = useState<PlanetaryHoursCalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCoordinates, setCurrentCoordinates] = useState<{ latitude: number, longitude: number } | null>(null);
  const [selectedDateForCalc, setSelectedDateForCalc] = useState<Date | null>(null);

  const lastParamsRef = useRef<string | null>(null);

  // 使用新的 Hook 获取实时当前行星时
  const currentHour = useCurrentLivePlanetaryHour({
    planetaryHoursRaw,
    currentCoordinatesForYesterdayCalc: currentCoordinates,
    dateForPlanetaryHoursRaw: selectedDateForCalc,
    timeFormat,
  });

  const calculate = useCallback(async (
    latitude: number,
    longitude: number,
    date: Date,
    timezoneInput: string
  ) => {
    try {
      const standardizedLatitude = Number(latitude.toFixed(6));
      const standardizedLongitude = Number(longitude.toFixed(6));
      const clonedDate = new Date(date);

      const paramKey = `${standardizedLatitude}_${standardizedLongitude}_${clonedDate.toISOString()}_${timezoneInput}`;

      // 若与上一次计算参数完全一致，则直接跳过
      if (paramKey === lastParamsRef.current) {
        return;
      }

      setIsLoading(true);
      setError(null);

      console.log(`计算行星时: 日期=${date.toISOString()}, 时区=${timezoneInput}, 坐标=[${latitude}, ${longitude}]`);

      const timeZoneValidation: TimeZoneValidationResult = timeZoneService.validateTimeZone(timezoneInput);
      if (!timeZoneValidation.isValid) {
        throw new Error(timeZoneValidation.message || 'Invalid timezone provided');
      }
      // 如果时区验证通过，直接使用输入的时区
      const validTimezone = timezoneInput;

      // 保存用于计算的原始日期和坐标（不要修改日期对象）
      setCurrentCoordinates({ latitude: standardizedLatitude, longitude: standardizedLongitude });
      setSelectedDateForCalc(clonedDate);

      // 确保使用的是原始日期进行计算，不要在这里做时区转换
      const result = await planetaryHoursCalculator.calculate(
        clonedDate,
        standardizedLatitude,
        standardizedLongitude,
        validTimezone
      );

      // Add null check for result before accessing its properties
      if (result) {
        console.log(`计算结果: 日出=${result.sunrise?.toISOString()}, 日落=${result.sunset?.toISOString()}, 行星时数量=${result.planetaryHours?.length || 0}`);
        setPlanetaryHoursRaw(result);
        lastParamsRef.current = paramKey;
      } else {
        // Handle the case where result is null, perhaps set an error or clear existing data
        setError('Failed to calculate planetary hours: No result returned.');
        setPlanetaryHoursRaw(null);
        setCurrentCoordinates(null);
        setSelectedDateForCalc(null);
        lastParamsRef.current = null; // Clear last params if calculation failed
      }
    } catch (err) {
      console.error('计算行星时出错:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate planetary hours');
      setPlanetaryHoursRaw(null);
      setCurrentCoordinates(null);
      setSelectedDateForCalc(null);
      lastParamsRef.current = null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 格式化白天和夜晚的行星时间列表
  const daytimeHours = planetaryHoursRaw?.planetaryHours && planetaryHoursRaw.timezone
    ? formatHoursToList(
      planetaryHoursRaw.planetaryHours.filter((h: PlanetaryHour) => h.type === 'day'),
      planetaryHoursRaw.timezone,
      timeFormat,
      currentHour
    )
    : [];

  const nighttimeHours = planetaryHoursRaw?.planetaryHours && planetaryHoursRaw.timezone
    ? formatHoursToList(
      planetaryHoursRaw.planetaryHours.filter((h: PlanetaryHour) => h.type === 'night'),
      planetaryHoursRaw.timezone,
      timeFormat,
      currentHour
    )
    : [];

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