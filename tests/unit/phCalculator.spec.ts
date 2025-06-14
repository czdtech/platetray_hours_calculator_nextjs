import { describe, it, expect, vi, beforeAll } from 'vitest';
import { planetaryHoursCalculator } from '@/services/PlanetaryHoursCalculator';
import { NY_TIMEZONE } from '@/utils/time';

const LAT_NY = 40.7128;
const LON_NY = -74.0060;

// Helper tolerance 1 minute
function minutesBetween(a: Date, b: Date) {
  return Math.abs((a.getTime() - b.getTime()) / 60000);
}

describe('PlanetaryHoursCalculator basics', () => {
  beforeAll(() => {
    planetaryHoursCalculator.clearCache();
  });

  it('calculate returns 24 planetary hours summing ~24h', async () => {
    const date = new Date('2025-03-20T12:00:00Z'); // Spring equinox
    const result = await planetaryHoursCalculator.calculate(date, LAT_NY, LON_NY, NY_TIMEZONE);
    expect(result).not.toBeNull();
    if (!result) return;
    expect(result.planetaryHours).toHaveLength(24);

    const first = result.planetaryHours[0];
    const last = result.planetaryHours[23];
    const totalMinutes = minutesBetween(first.startTime, last.endTime);
    // near 24h (<=3 min tolerance)
    expect(totalMinutes).toBeGreaterThanOrEqual(24 * 60 - 3);
    expect(totalMinutes).toBeLessThanOrEqual(24 * 60 + 3);
  });

  it('getCurrentHour returns correct hour for given time', async () => {
    const date = new Date('2025-03-20T12:00:00Z');
    const calc = await planetaryHoursCalculator.calculate(date, LAT_NY, LON_NY, NY_TIMEZONE);
    if (!calc) throw new Error('calc failed');
    const testTime = calc.planetaryHours[5].startTime; // 6th hour start
    const current = planetaryHoursCalculator.getCurrentHour(calc, testTime);
    expect(current?.hourNumberOverall).toBe(calc.planetaryHours[5].hourNumberOverall);
  });
}); 