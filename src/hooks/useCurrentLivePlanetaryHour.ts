import { useState, useEffect, useCallback } from 'react';
import { planetaryHoursCalculator, PlanetaryHour, PlanetaryHoursCalculationResult } from '../services/PlanetaryHoursCalculator';
import { FormattedPlanetaryHour, formatSingleHour } from '../utils/planetaryHourFormatters';

interface UseCurrentLivePlanetaryHourProps {
  planetaryHoursRaw: PlanetaryHoursCalculationResult | null;
  // 明确需要用于昨日计算的坐标，因为 planetaryHoursRaw 可能对应不同的日期/位置
  currentCoordinatesForYesterdayCalc: { latitude: number; longitude: number } | null;
  // 用于确定 planetaryHoursRaw 是否对应"今天"的日期
  dateForPlanetaryHoursRaw: Date | null;
  timeFormat: '12h' | '24h';
}

/**
 * Hook to manage and update the current live planetary hour.
 * It determines if the provided planetaryHoursRaw data is for "today" in its timezone,
 * and if so, calculates and provides the current planetary hour, updating it every minute.
 * It also handles pre-sunrise logic by checking the previous day if necessary.
 */
export function useCurrentLivePlanetaryHour({
  planetaryHoursRaw,
  currentCoordinatesForYesterdayCalc,
  dateForPlanetaryHoursRaw, // 传入用于计算 planetaryHoursRaw 的原始Date对象
  timeFormat,
}: UseCurrentLivePlanetaryHourProps): FormattedPlanetaryHour | null {
  const [currentLiveHour, setCurrentLiveHour] = useState<FormattedPlanetaryHour | null>(null);

  const calculateAndSetCurrentHour = useCallback(async (nowUtc: Date) => {
    console.log('🧮 [LiveHour] 开始计算实时当前行星时');
    if (!planetaryHoursRaw || !planetaryHoursRaw.timezone || !dateForPlanetaryHoursRaw) {
      console.log('⚠️ [LiveHour] 缺少必要数据，无法计算', { planetaryHoursRawExists: !!planetaryHoursRaw, timezone: planetaryHoursRaw?.timezone, dateForPlanetaryHoursRaw });
      setCurrentLiveHour(null);
      return;
    }

    const { timezone, sunriseLocal, nextSunriseLocal } = planetaryHoursRaw as PlanetaryHoursCalculationResult;

    // 直接尝试在当前数据中寻找正在进行的行星时
    let currentPhysicalHour: PlanetaryHour | null = planetaryHoursCalculator.getCurrentHour(planetaryHoursRaw, nowUtc);
    console.log('🔍 [LiveHour] 当前物理行星时: ', currentPhysicalHour);

    // 如果未找到且当前时间在 "日出前" 的夜间，则尝试用前一天的数据再算一次
    if (!currentPhysicalHour && sunriseLocal && nowUtc < sunriseLocal) {
      console.log('🌄 [LiveHour] 当前时间在日出前，尝试计算前一天的夜间小时');
      if (currentCoordinatesForYesterdayCalc) {
        try {
          const yesterdayDate = new Date(sunriseLocal);
          yesterdayDate.setDate(yesterdayDate.getDate() - 1);
          console.log('📆 [LiveHour] 前一天日期: ', yesterdayDate.toISOString());

          const yesterdayResult = await planetaryHoursCalculator.calculate(
            yesterdayDate,
            currentCoordinatesForYesterdayCalc.latitude,
            currentCoordinatesForYesterdayCalc.longitude,
            timezone
          );

          if (yesterdayResult) {
            currentPhysicalHour = planetaryHoursCalculator.getCurrentHour(yesterdayResult, nowUtc);
            console.log('🔍 [LiveHour] 前一天计算结果中的当前小时: ', currentPhysicalHour);
          }
        } catch (err: unknown) {
          console.error('❌ [LiveHour] 计算前一天行星时出错:', err);
        }
      } else {
        console.warn('⚠️ [LiveHour] 缺少前一天计算所需坐标');
      }
    }

    // 如果依然没有找到，但当前时间落在 planetaryHoursRaw 的夜晚时段尾巴（日落后到 nextSunrise）
    // 且 nextSunriseLocal 存在且 nowUtc < nextSunriseLocal，则 currentPhysicalHour 仍应在当前数据范围，
    // 这里再次尝试。
    if (!currentPhysicalHour && nextSunriseLocal && nowUtc < nextSunriseLocal) {
      currentPhysicalHour = planetaryHoursCalculator.getCurrentHour(planetaryHoursRaw, nowUtc);
    }

    const formatted = formatSingleHour(currentPhysicalHour, timezone, timeFormat, true);
    console.log('🎨 [LiveHour] 格式化后的当前行星时: ', formatted);
    setCurrentLiveHour(formatted);
  }, [planetaryHoursRaw, currentCoordinatesForYesterdayCalc, dateForPlanetaryHoursRaw, timeFormat]);

  useEffect(() => {
    // 只有当有基本数据时才执行计算，避免初始化时的无意义警告
    if (!planetaryHoursRaw || !dateForPlanetaryHoursRaw) {
      return;
    }

    const nowUtc = new Date();
    calculateAndSetCurrentHour(nowUtc); // Initial call

    let interval: NodeJS.Timeout | undefined = undefined;

    if (planetaryHoursRaw && planetaryHoursRaw.timezone && dateForPlanetaryHoursRaw) {
      interval = setInterval(() => {
        calculateAndSetCurrentHour(new Date());
      }, 60000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
    // The dependencies of this useEffect should correctly trigger re-runs 
    // when calculateAndSetCurrentHour changes (due to its own dependencies changing).
  }, [calculateAndSetCurrentHour, planetaryHoursRaw, dateForPlanetaryHoursRaw]);

  return currentLiveHour;
} 