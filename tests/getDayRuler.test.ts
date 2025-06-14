import { describe, it, expect } from 'vitest';
import { planetaryHoursCalculator } from '@/services/PlanetaryHoursCalculator';

const LAT_NY = 40.7128;
const LON_NY = -74.0060;
const TZ_NY = 'America/New_York';

/**
 * Helper to get day ruler for a given date string (local date in target timezone)
 */
async function getDayRuler(dateISO: string) {
  const date = new Date(dateISO);
  const result = await planetaryHoursCalculator.calculate(date, LAT_NY, LON_NY, TZ_NY);
  if (!result) throw new Error('Calculation failed');
  return result.dayRuler;
}

describe('getDayRuler timezone correctness', () => {
  it('returns Saturn for 2025-06-14 (Saturday) in New York', async () => {
    const ruler = await getDayRuler('2025-06-14T12:00:00Z');
    expect(ruler).toBe('Saturn');
  });

  it('returns Sun for 2025-06-15 (Sunday) in New York', async () => {
    const ruler = await getDayRuler('2025-06-15T12:00:00Z');
    expect(ruler).toBe('Sun');
  });
});
