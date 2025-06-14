import { describe, it, expect, beforeEach } from 'vitest';
import { planetaryHoursCalculator } from '@/services/PlanetaryHoursCalculator';
import { fromZonedTime } from 'date-fns-tz';

async function calc(dateISO: string, lat: number, lon: number, tz: string) {
  const date = new Date(dateISO);
  return await planetaryHoursCalculator.calculate(date, lat, lon, tz);
}

describe('High-latitude (polar day/night) handling', () => {
  beforeEach(() => {
    planetaryHoursCalculator.clearCache();
  });

  it('Alert, Canada (82.5°N) midsummer returns null due to polar day', async () => {
    // June 14 2025 local noon in Alert (UTC-04)
    const localNoon = fromZonedTime('2025-06-14T12:00:00', 'America/Iqaluit');
    const res = await calc(localNoon.toISOString(), 82.5018, -62.3481, 'America/Iqaluit');
    expect(res).toBeNull();
  });

  it('Tromsø, Norway mid-winter returns null due to polar night', async () => {
    const localNoon = fromZonedTime('2025-12-14T12:00:00', 'Europe/Oslo');
    const res = await calc(localNoon.toISOString(), 69.6492, 18.9553, 'Europe/Oslo');
    expect(res).toBeNull();
  });
}); 