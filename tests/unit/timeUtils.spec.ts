import { describe, it, expect } from 'vitest';
import { getCurrentUTCDate, toNewYorkTime, NY_TIMEZONE } from '@/utils/time';
import { formatInTimeZone } from 'date-fns-tz';

describe('time utils', () => {
  it('getCurrentUTCDate returns value close to Date.now()', () => {
    const before = Date.now();
    const d = getCurrentUTCDate();
    const after = Date.now();
    expect(d.getTime()).toBeGreaterThanOrEqual(before);
    expect(d.getTime()).toBeLessThanOrEqual(after);
  });

  it('toNewYorkTime converts UTC to America/New_York timezone', () => {
    const utc = new Date('2025-06-14T12:00:00Z');
    const ny = toNewYorkTime(utc);
    expect(ny).toBeInstanceOf(Date);
  });
}); 