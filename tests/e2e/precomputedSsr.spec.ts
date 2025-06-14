// @ts-nocheck
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { formatInTimeZone } from 'date-fns-tz';

// Ensure dev/start server running before executing

test.describe('Precomputed JSON served vs local file', () => {
  test('served /precomputed/ny-YYYY-MM-DD.json matches local file exactly', async ({ request }) => {
    const todayNY = formatInTimeZone(new Date(), 'America/New_York', 'yyyy-MM-dd');
    const filename = `ny-${todayNY}.json`;
    const res = await request.get(`/precomputed/${filename}`);
    expect(res.status()).toBe(200);
    const served = await res.json();

    const localPath = path.resolve(__dirname, '../../public/precomputed', filename);
    const local = JSON.parse(fs.readFileSync(localPath, 'utf-8'));

    // Deep equality check
    expect(served).toEqual(local);
  });
}); 