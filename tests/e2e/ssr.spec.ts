// @ts-nocheck
import { test, expect } from '@playwright/test';

// E2E: Basic SSR verification for home page
// Pre-condition: Next.js dev or start server is running on http://localhost:3000
// You can set PLAYWRIGHT_BASE_URL to point elsewhere.

test.describe('Home page SSR', () => {
  test('renders Planetary Hours link and returns 200', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    // The brand link is rendered by Header server-side, so it must be present immediately.
    const brandLink = page.locator('a', { hasText: 'Planetary Hours' }).first();
    await expect(brandLink).toBeVisible();
  });
}); 