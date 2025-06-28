import { formatHoursToList, FormattedPlanetaryHour } from '@/utils/planetaryHourFormatters';
import { PlanetaryHoursCalculationResult } from '@/services/PlanetaryHoursCalculator';
import { calculateDynamicTTL, TTLCalculationResult } from '@/utils/cache/dynamicTTL';

export interface ServerCurrentHourPayload {
  currentHour: FormattedPlanetaryHour | null;
  dayRuler: string | null;
  sunrise: Date | null;
  /** TTL计算结果，用于缓存策略 */
  ttlInfo: TTLCalculationResult;
}

/**
 * 根据预计算结果返回"当前小时 + Day Ruler + 日出时间"信息，
 * 让服务器组件可直接渲染完整 Current Planetary Hour 区块。
 *
 * @param data 行星时计算结果
 * @param timeFormat 时间格式
 * @param targetTime 目标时间，用于计算TTL（默认当前时间）
 */
export function getCurrentHourPayload(
  data: PlanetaryHoursCalculationResult,
  timeFormat: '12h' | '24h' = '24h',
  targetTime: Date = new Date()
): ServerCurrentHourPayload {
  const { planetaryHours, sunrise, timezone } = data;

  // 找出当前小时索引
  const idx = planetaryHours.findIndex(h => targetTime >= h.startTime && targetTime < h.endTime);
  const formatted = idx !== -1
    ? formatHoursToList([
        planetaryHours[idx]
      ], timezone, timeFormat)[0]
    : null;

  const dayRuler = planetaryHours.length ? planetaryHours[0].ruler : null;

  // 计算动态TTL信息
  const ttlInfo = calculateDynamicTTL(data, targetTime);

  return {
    currentHour: formatted,
    dayRuler,
    sunrise,
    ttlInfo,
  };
}
