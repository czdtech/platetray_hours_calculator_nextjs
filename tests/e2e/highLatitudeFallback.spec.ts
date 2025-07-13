// @ts-nocheck
import { test, expect } from '@playwright/test';

test.describe('Polar region fallback', () => {
  test('shows graceful fallback message for Alert, Canada', async ({ page }) => {
    // Stub timezone API to avoid external call
    await page.route('/api/maps/timezone*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'OK', timeZoneId: 'Etc/GMT+4' }),
      });
    });

    await page.goto('/');

    // 输入坐标触发计算
    const locationInput = page.getByTestId('location-input');
    await expect(locationInput).toBeVisible({ timeout: 15000 });
    await locationInput.fill('82.5018,-62.3481');
    await locationInput.press('Enter');

    // 等待错误提示出现
    await expect(page.getByText('Planetary hours data is not available', { exact: false })).toBeVisible({ timeout: 15000 });
  });
}); 