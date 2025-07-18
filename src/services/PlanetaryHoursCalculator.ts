import SunCalc from "suncalc";
import {
  fromZonedTime,
  formatInTimeZone,
} from "date-fns-tz";
import { addDays, isValid } from "date-fns";

import { createLogger } from '@/utils/unified-logger';

const logger = createLogger('PlanetaryHoursCalculator');

// 迦勒底行星顺序 (传统顺序)
const PLANETARY_ORDER = [
  "Saturn",
  "Jupiter",
  "Mars",
  "Sun",
  "Venus",
  "Mercury",
  "Moon",
];

// 星期主宰行星 (0: 星期日, 1: 星期一, ..., 6: 星期六)
// 这与 JavaScript Date.getDay() 的返回值一致
const DAY_RULERS: { [key: number]: string } = {
  0: "Sun", // Sunday
  1: "Moon", // Monday
  2: "Mars", // Tuesday
  3: "Mercury", // Wednesday
  4: "Jupiter", // Thursday
  5: "Venus", // Friday
  6: "Saturn", // Saturday
};

const PLANET_ATTRIBUTES = {
  Sun: {
    goodFor: "Leadership, success, vitality, authority",
    avoid: "Humility, staying in the background, passive activities",
  },
  Moon: {
    goodFor: "Emotions, intuition, domestic matters, public affairs",
    avoid: "Major decisions, confrontations, risky ventures",
  },
  Mercury: {
    goodFor: "Communication, learning, writing, trade, travel",
    avoid: "Silence, isolation, physical labor",
  },
  Venus: {
    goodFor: "Love, beauty, art, social activities, pleasure",
    avoid: "Conflict, hard work, isolation",
  },
  Mars: {
    goodFor: "Energy, courage, action, competition",
    avoid: "Peace negotiations, gentle activities, meditation",
  },
  Jupiter: {
    goodFor: "Growth, expansion, abundance, wisdom, finances",
    avoid: "Restriction, limitation, pessimism",
  },
  Saturn: {
    goodFor: "Discipline, responsibility, long-term projects",
    avoid: "New ventures, spontaneity, risk-taking",
  },
};

export interface PlanetaryHour {
  hourNumberOverall: number;
  startTime: Date;
  endTime: Date;
  ruler: string;
  type: "day" | "night";
  durationMinutes: number;
  goodFor: string;
  avoid: string;
}

export interface PlanetaryHoursCalculationResult {
  requestedDate: string;
  timezone: string;
  dayRuler: string;
  sunrise: Date;
  sunset: Date;
  nextSunrise: Date;
  sunriseLocal: Date;
  sunsetLocal: Date;
  nextSunriseLocal: Date;
  planetaryHours: PlanetaryHour[];
  dateUsedForCalculation: Date;
  latitude: number;
  longitude: number;
  message?: string;
}

// 内存缓存：缓存当天的计算结果
interface CacheEntry {
  data: PlanetaryHoursCalculationResult;
  calculatedAt: Date;
  cacheKey: string;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry>();
  private readonly maxEntries = 10; // 最多缓存10个不同位置的数据
  private readonly cacheValidityMs = 6 * 60 * 60 * 1000; // 6小时有效期

  generateKey(date: Date, latitude: number, longitude: number, timezone: string): string {
    const dateStr = date.toISOString().split('T')[0];
    // 坐标精确到小数点后3位（约100米精度）
    const latRounded = Math.round(latitude * 1000) / 1000;
    const lonRounded = Math.round(longitude * 1000) / 1000;
    return `${dateStr}_${latRounded}_${lonRounded}_${timezone}`;
  }

  get(key: string): PlanetaryHoursCalculationResult | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // 检查缓存是否过期
    const now = new Date();
    const ageMs = now.getTime() - entry.calculatedAt.getTime();
    if (ageMs > this.cacheValidityMs) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: PlanetaryHoursCalculationResult): void {
    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      calculatedAt: new Date(),
      cacheKey: key
    });
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// 全局内存缓存实例
const memoryCache = new MemoryCache();

export class PlanetaryHoursCalculator {
  private static instance: PlanetaryHoursCalculator;
  private readonly MAX_CACHE_SIZE = 50; // 限制缓存大小防止内存泄漏

  private constructor() {
  }

  public static getInstance(): PlanetaryHoursCalculator {
    if (!PlanetaryHoursCalculator.instance) {
      PlanetaryHoursCalculator.instance = new PlanetaryHoursCalculator();
    }
    return PlanetaryHoursCalculator.instance;
  }

  /**
   * 清理缓存（用于调试）
   */
  public clearCache(): void {
    memoryCache.clear();
    logger.debug('🧹 PlanetaryHoursCalculator 缓存已清空');
  }

  /**
   * 获取缓存统计信息（用于调试）
   */
  public getCacheStats(): { size: number; keys: string[] } {
    return memoryCache.getStats();
  }

  /**
   * 管理缓存大小，防止内存无限增长
   */
  private manageCacheSize(): void {
    const stats = memoryCache.getStats();
    if (stats.size > this.MAX_CACHE_SIZE) {
      // 如果缓存超过限制，清空缓存
      // 注意：MemoryCache类内部已经有LRU逻辑，这里简化处理
      memoryCache.clear();
      logger.cache(`缓存大小管理: 缓存已清空，超过限制 ${this.MAX_CACHE_SIZE}`);
    }
  }

  private getCacheKey(
    date: Date,
    latitude: number,
    longitude: number,
    timezone: string,
  ): string {
    // 修复：使用目标时区的日期字符串，而不是本地时区
    // 这确保不同UTC日期在目标时区产生不同的缓存键
    const dateStringForCache = formatInTimeZone(date, timezone, "yyyy-MM-dd");
    const cacheKey = `${dateStringForCache}_${latitude.toFixed(4)}_${longitude.toFixed(4)}_${timezone}`;

    logger.key(`生成缓存键: ${cacheKey} (UTC日期: ${date.toISOString()})`);
    return cacheKey;
  }

  private getDayRuler(localDate: Date, timezone: string): string {
    // 使用目标时区确定星期，而不是依赖运行环境时区
    // formatInTimeZone('e') 返回 1(周一) - 7(周日)
    const isoDayStr = formatInTimeZone(localDate, timezone, "i");
    const isoDay = parseInt(isoDayStr, 10); // 1-7
    // 将 ISO Day 转换为 JS Day: Sunday=0, Monday=1, ...
    const jsDay = isoDay % 7;
    return DAY_RULERS[jsDay as keyof typeof DAY_RULERS];
  }

  private getNextPlanet(currentPlanet: string): string {
    const currentIndex = PLANETARY_ORDER.indexOf(currentPlanet);
    return PLANETARY_ORDER[(currentIndex + 1) % PLANETARY_ORDER.length];
  }

  private generateHourRulers(dayRuler: string): string[] {
    const rulers: string[] = [];
    let currentPlanet = dayRuler;
    for (let i = 0; i < 24; i++) {
      rulers.push(currentPlanet);
      currentPlanet = this.getNextPlanet(currentPlanet);
    }
    return rulers;
  }

  public async calculate(
    date: Date,
    latitude: number,
    longitude: number,
    timezone: string,
    elevation: number = 0,
  ): Promise<PlanetaryHoursCalculationResult | null> {
    try {
      // 1. 检查内存缓存
      const cacheKey = memoryCache.generateKey(date, latitude, longitude, timezone);
      const cached = memoryCache.get(cacheKey);
      if (cached) {
        logger.info('命中内存缓存', { cacheKey });
        return cached;
      }

      const startTime = Date.now();
      logger.info('开始行星时计算', {
        date: date.toISOString(),
        latitude,
        longitude,
        timezone,
        cacheKey
      });

      // 以目标时区解析日期，避免受浏览器本地时区影响
      const localDateString = formatInTimeZone(date, timezone, "yyyy-MM-dd");
      const noonStringInTimezone = `${localDateString}T12:00:00`;

      const baseDateForSunCalc = fromZonedTime(noonStringInTimezone, timezone);

      // 直接使用 baseDateForSunCalc 即可，它已经代表了目标时区的正午对应的 UTC 时间点。
      // 不再额外调用 toZonedTime，否则在极端时区（如 UTC-10 的夏威夷）会因再次转换而回退到前一天，
      // 导致 dayRuler 计算错误（例如本应为 Saturday 却得到 Friday -> Venus）。
      const dateForDayRuler = baseDateForSunCalc;

      // 调试输出
      logger.debug(
        `[PHCalc] 计算日期(当地): ${noonStringInTimezone} => UTC: ${baseDateForSunCalc.toISOString()}`,
      );

      const dayRuler = this.getDayRuler(dateForDayRuler, timezone);

      const sunTimesToday = SunCalc.getTimes(
        baseDateForSunCalc,
        latitude,
        longitude,
        elevation,
      );

      const nextDayUTCDateForSunCalc = addDays(baseDateForSunCalc, 1);
      const sunTimesTomorrow = SunCalc.getTimes(
        nextDayUTCDateForSunCalc,
        latitude,
        longitude,
        elevation,
      );

      const { sunrise, sunset } = sunTimesToday;
      const actualSunriseTomorrow = sunTimesTomorrow.sunrise;

      if (
        !isValid(sunrise) ||
        !isValid(sunset) ||
        !isValid(actualSunriseTomorrow)
      ) {
        logger.error(
          `Invalid sun times received from SunCalc for the given date/location. Date: ${baseDateForSunCalc}, Lat: ${latitude}, Lng: ${longitude}`,
          new Error("Invalid sun times from SunCalc")
        );
        return null;
      }

      // 直接使用 UTC 时间作为本地时间基准，避免 toZonedTime 导致日期错位
      const sunriseLocal = new Date(sunrise.getTime());
      const sunsetLocal = new Date(sunset.getTime());
      const nextSunriseLocal = new Date(actualSunriseTomorrow.getTime());

      const planetaryHours = this.calculateAndSortPlanetaryHours(
        dayRuler,
        sunrise,
        sunset,
        actualSunriseTomorrow,
      );

      if (!planetaryHours || planetaryHours.length === 0) {
        logger.error("Failed to calculate planetary hours.");
        return null;
      }

      const result = {
        dayRuler,
        sunrise,
        sunset,
        nextSunrise: actualSunriseTomorrow,
        sunriseLocal,
        sunsetLocal,
        nextSunriseLocal,
        planetaryHours,
        timezone,
        requestedDate: formatInTimeZone(dateForDayRuler, timezone, "yyyy-MM-dd"),
        dateUsedForCalculation: dateForDayRuler,
        latitude,
        longitude,
      };

      // 2. 存入内存缓存
      memoryCache.set(cacheKey, result);
      this.manageCacheSize(); // 管理缓存大小
      logger.cache(`结果已缓存: ${cacheKey}`);

      const duration = Date.now() - startTime;
      logger.info('行星时计算完成并缓存', {
        duration: `${duration}ms`,
        cacheKey,
        cacheStats: memoryCache.getStats()
      });

      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error during planetary hours calculation');
      logger.error("Error calculating planetary hours", err);
      return null;
    }
  }

  private calculateAndSortPlanetaryHours(
    dayRuler: string,
    sunrise: Date,
    sunset: Date,
    nextSunrise: Date,
  ): PlanetaryHour[] {
    const hourRulers = this.generateHourRulers(dayRuler);

    const planetaryHours: PlanetaryHour[] = [];
    let overallHourCount = 0;

    if (
      isValid(sunrise) &&
      isValid(sunset) &&
      sunset.getTime() > sunrise.getTime()
    ) {
      const daylightDurationMs = sunset.getTime() - sunrise.getTime();
      const dayPlanetaryHourDurationMs = daylightDurationMs / 12;
      const dayPlanetaryHourDurationMinutes =
        dayPlanetaryHourDurationMs / (1000 * 60);
      let currentDayHourStartTime = sunrise;

      for (let i = 0; i < 12; i++) {
        if (hourRulers.length === 0) break; // Should not happen with 24 rulers
        overallHourCount++;
        const startTime = currentDayHourStartTime;
        const endTime = new Date(
          startTime.getTime() + dayPlanetaryHourDurationMs,
        );
        const ruler = hourRulers[i];
        const attributes =
          PLANET_ATTRIBUTES[ruler as keyof typeof PLANET_ATTRIBUTES];

        planetaryHours.push({
          hourNumberOverall: overallHourCount,
          startTime,
          endTime,
          ruler,
          type: "day",
          durationMinutes: parseFloat(
            dayPlanetaryHourDurationMinutes.toFixed(2),
          ),
          goodFor: attributes.goodFor,
          avoid: attributes.avoid,
        });
        currentDayHourStartTime = endTime;
      }
      // Correct the end time of the last day hour to exactly sunset
      if (planetaryHours.length > 0) {
        const lastDayHourIndex = planetaryHours.findIndex(
          (h, idx, arr) =>
            h.type === "day" &&
            (idx === arr.length - 1 ||
              (arr[idx + 1] && arr[idx + 1].type === "night")),
        );
        if (lastDayHourIndex !== -1 && isValid(sunset)) {
          planetaryHours[lastDayHourIndex].endTime = sunset;
        }
      }
    }

    if (
      isValid(sunset) &&
      isValid(nextSunrise) &&
      nextSunrise.getTime() > sunset.getTime()
    ) {
      const nightDurationMs = nextSunrise.getTime() - sunset.getTime();
      const nightPlanetaryHourDurationMs = nightDurationMs / 12;
      const nightPlanetaryHourDurationMinutes =
        nightPlanetaryHourDurationMs / (1000 * 60);
      let currentNightHourStartTime = sunset;

      for (let i = 0; i < 12; i++) {
        if (hourRulers.length <= 12 + i) break; // Should not happen with 24 rulers
        overallHourCount++;
        const startTime = currentNightHourStartTime;
        const endTime = new Date(
          startTime.getTime() + nightPlanetaryHourDurationMs,
        );
        const ruler = hourRulers[12 + i]; // Use the next 12 rulers for night
        const attributes =
          PLANET_ATTRIBUTES[ruler as keyof typeof PLANET_ATTRIBUTES];

        planetaryHours.push({
          hourNumberOverall: overallHourCount,
          startTime,
          endTime,
          ruler,
          type: "night",
          durationMinutes: parseFloat(
            nightPlanetaryHourDurationMinutes.toFixed(2),
          ),
          goodFor: attributes.goodFor,
          avoid: attributes.avoid,
        });
        currentNightHourStartTime = endTime;
      }
      // Correct the end time of the last night hour to exactly next sunrise
      if (planetaryHours.length > 0) {
        const lastNightHourIndex = planetaryHours.findIndex(
          (h, idx, arr) =>
            h.type === "night" &&
            (idx === arr.length - 1 ||
              (arr[idx + 1] && arr[idx + 1].type === "day")),
        );
        if (lastNightHourIndex !== -1 && isValid(nextSunrise)) {
          planetaryHours[lastNightHourIndex].endTime = nextSunrise;
        }
      }
    }

    // Sort by start time just in case, though they should be in order
    planetaryHours.sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime(),
    );
    return planetaryHours;
  }

  /**
   * Finds the planetary hour that is currently active at the given target time.
   * @param calculationResult The result from a previous `calculate` call.
   * @param targetTime The specific time (UTC) for which to find the current hour. Defaults to now.
   * @returns The current PlanetaryHour object, or null if not found or if data is invalid.
   */
  public getCurrentHour(
    calculationResult: PlanetaryHoursCalculationResult,
    targetTime: Date = new Date(), // targetTime should be UTC
  ): PlanetaryHour | null {
    if (
      !calculationResult ||
      !calculationResult.planetaryHours ||
      !isValid(targetTime)
    ) {
      return null;
    }
    const targetTimestamp = targetTime.getTime();
    return (
      calculationResult.planetaryHours.find(
        (hour) =>
          targetTimestamp >= hour.startTime.getTime() &&
          targetTimestamp < hour.endTime.getTime(),
      ) || null
    );
  }
}

export const planetaryHoursCalculator = PlanetaryHoursCalculator.getInstance();

// 在开发环境中暴露到全局，方便调试
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  interface WindowWithPHCalculator extends Window {
    planetaryHoursCalculator: PlanetaryHoursCalculator;
    clearAllCaches?: () => void;
  }

  const w = window as unknown as WindowWithPHCalculator;
  w.planetaryHoursCalculator = planetaryHoursCalculator;
  // 扩展全局缓存清理函数
  const originalClearAllCaches = w.clearAllCaches;
  w.clearAllCaches = () => {
    if (originalClearAllCaches) originalClearAllCaches();
    planetaryHoursCalculator.clearCache();
    logger.debug('All caches cleared including PlanetaryHoursCalculator');
  };
  logger.debug('planetaryHoursCalculator available at window.planetaryHoursCalculator');
}
