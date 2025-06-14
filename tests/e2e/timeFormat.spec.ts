// @ts-nocheck
import { test, expect } from '@playwright/test';

// 测试时间格式切换 12h / 24h

test.describe('Time format toggle', () => {
  test('switches between 24h and 12h formats', async ({ page }) => {
    await page.goto('/');

    // 切换到 12h
    await page.getByRole('button', { name: '12h' }).click();

    // 至少出现一个包含 AM/PM 的时间
    const ampmLocator = page.locator('text=/\\b(?:AM|PM)\\b/');
    await expect.poll(async () => await ampmLocator.count(), {
      message: 'AM/PM text should appear after switching to 12h',
      timeout: 5000,
    }).toBeGreaterThan(0);

    // 切换回 24h
    await page.getByRole('button', { name: '24h' }).click();

    // AM/PM 文本应全部消失
    await expect(await ampmLocator.count()).toBe(0);
  });
}); 