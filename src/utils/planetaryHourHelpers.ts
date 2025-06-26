import { formatHoursToList, FormattedPlanetaryHour } from '@/utils/planetaryHourFormatters';
import { PlanetaryHoursCalculationResult } from '@/services/PlanetaryHoursCalculator';

export interface ServerCurrentHourPayload {
  currentHour: FormattedPlanetaryHour | null;
  dayRuler: string | null;
  sunrise: Date | null;
}

/**
 * 根据预计算结果返回“当前小时 + Day Ruler + 日出时间”信息，
 * 让服务器组件可直接渲染完整 Current Planetary Hour 区块。
 */
export function getCurrentHourPayload(
  data: PlanetaryHoursCalculationResult,
  timeFormat: '12h' | '24h' = '24h'
): ServerCurrentHourPayload {
  const { planetaryHours, sunrise, timezone } = data;
  const now = new Date();

  // 找出当前小时索引
  const idx = planetaryHours.findIndex(h => now >= h.startTime && now < h.endTime);
  const formatted = idx !== -1
    ? formatHoursToList([
        planetaryHours[idx]
      ], timezone, timeFormat)[0]
    : null;

  const dayRuler = planetaryHours.length ? planetaryHours[0].ruler : null;

  return {
    currentHour: formatted,
    dayRuler,
    sunrise,
  };
}
