import { describe, it, expect, beforeEach } from 'vitest';
import { planetaryHoursCalculator } from '@/services/PlanetaryHoursCalculator';
import { fromZonedTime } from 'date-fns-tz';

// Helper to run calculation and extract dayRuler
async function getDayRuler(dateISO: string, lat: number, lon: number, tz: string) {
  const date = new Date(dateISO);
  const result = await planetaryHoursCalculator.calculate(date, lat, lon, tz);
  if (!result) throw new Error('Calculation failed');
  return result.dayRuler;
}

describe('Planetary day ruler across multiple time-zones', () => {
  beforeEach(() => {
    // 清理内部缓存，确保每个测试独立
    planetaryHoursCalculator.clearCache();
  });

  it('New York 2025-06-14 → Saturn', async () => {
    const ruler = await getDayRuler('2025-06-14T12:00:00Z', 40.7128, -74.0060, 'America/New_York');
    expect(ruler).toBe('Saturn');
  });

  it('Sydney 2025-06-14 → Saturn', async () => {
    const ruler = await getDayRuler('2025-06-14T12:00:00Z', -33.8688, 151.2093, 'Australia/Sydney');
    expect(ruler).toBe('Saturn');
  });

  it('Kiritimati (UTC+14) 2025-06-14 → Saturn', async () => {
    const localNoon = fromZonedTime('2025-06-14T12:00:00', 'Pacific/Kiritimati');
    const ruler = await getDayRuler(localNoon.toISOString(), 1.8721, -157.4278, 'Pacific/Kiritimati');
    expect(ruler).toBe('Saturn');
  });

  it('Honolulu (UTC-10) 2025-06-14 → Saturn', async () => {
    const localNoon = fromZonedTime('2025-06-14T12:00:00', 'Pacific/Honolulu');
    const ruler = await getDayRuler(localNoon.toISOString(), 21.3069, -157.8583, 'Pacific/Honolulu');
    expect(ruler).toBe('Saturn');
  });
}); 