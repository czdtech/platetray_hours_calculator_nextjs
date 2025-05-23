import SunCalc from "suncalc";
import { fromZonedTime, toZonedTime, formatInTimeZone } from "date-fns-tz";
import { getDay, isValid, addDays, format as formatDate } from "date-fns";

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

export class PlanetaryHoursCalculator {
  private static instance: PlanetaryHoursCalculator;
  private cache: Map<string, PlanetaryHoursCalculationResult>;

  private constructor() {
    this.cache = new Map();
  }

  public static getInstance(): PlanetaryHoursCalculator {
    if (!PlanetaryHoursCalculator.instance) {
      PlanetaryHoursCalculator.instance = new PlanetaryHoursCalculator();
    }
    return PlanetaryHoursCalculator.instance;
  }

  private getCacheKey(
    date: Date,
    latitude: number,
    longitude: number,
    timezone: string,
  ): string {
    const localYear = date.getFullYear();
    const localMonth = date.getMonth() + 1;
    const localDay = date.getDate();
    const dateStringForCache = `${localYear}-${String(localMonth).padStart(2, "0")}-${String(localDay).padStart(2, "0")}`;
    return `${dateStringForCache}_${latitude.toFixed(4)}_${longitude.toFixed(4)}_${timezone}`;
  }

  private getDayRuler(localDate: Date): string {
    const day = getDay(localDate);
    return DAY_RULERS[day as keyof typeof DAY_RULERS];
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
      // 以目标时区解析日期，避免受浏览器本地时区影响
      const localDateString = formatInTimeZone(date, timezone, "yyyy-MM-dd");
      const noonStringInTimezone = `${localDateString}T12:00:00`;

      const baseDateForSunCalc = fromZonedTime(noonStringInTimezone, timezone);

      const dateForDayRuler = toZonedTime(baseDateForSunCalc, timezone);

      // 调试输出
      console.log(
        "[PHCalc] 计算日期(当地):",
        noonStringInTimezone,
        " => UTC:",
        baseDateForSunCalc.toISOString(),
      );

      const dayRuler = this.getDayRuler(dateForDayRuler);

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
        console.error(
          "Invalid sun times received from SunCalc for the given date/location.",
          { date: baseDateForSunCalc, latitude, longitude },
        );
        return null;
      }

      const sunriseLocal = toZonedTime(sunrise, timezone);
      const sunsetLocal = toZonedTime(sunset, timezone);
      const nextSunriseLocal = toZonedTime(actualSunriseTomorrow, timezone);

      const planetaryHours = this.calculateAndSortPlanetaryHours(
        dayRuler,
        sunrise,
        sunset,
        actualSunriseTomorrow,
      );

      if (!planetaryHours || planetaryHours.length === 0) {
        console.error("Failed to calculate planetary hours.");
        return null;
      }

      return {
        dayRuler,
        sunrise,
        sunset,
        nextSunrise: actualSunriseTomorrow,
        sunriseLocal,
        sunsetLocal,
        nextSunriseLocal,
        planetaryHours,
        timezone,
        requestedDate: formatDate(dateForDayRuler, "yyyy-MM-dd"),
        dateUsedForCalculation: dateForDayRuler,
        latitude,
        longitude,
      };
    } catch (error) {
      console.error("Error calculating planetary hours:", error);
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
