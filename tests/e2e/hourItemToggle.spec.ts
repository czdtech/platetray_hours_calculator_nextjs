// @ts-nocheck
import { test, expect } from '@playwright/test';

test.describe('Hour item toggle', () => {
  test('expands and collapses hour item', async ({ page }) => {
    await page.goto('/');

    const buttonsLocator = page.locator('button[aria-expanded]:not([data-nextjs-dev-tools-button])');

    // 等待至少一个 HourItem 渲染出来
    await expect.poll(async () => await buttonsLocator.count(), { timeout: 8000 }).toBeGreaterThan(0);

    const firstBtn = buttonsLocator.first();
    await firstBtn.waitFor({ state: 'visible' });

    // 展开
    await firstBtn.click();
    await expect(firstBtn).toHaveAttribute('aria-expanded', 'true', { timeout: 3000 });

    // 折叠
    await firstBtn.click();
    await expect(firstBtn).toHaveAttribute('aria-expanded', 'false', { timeout: 3000 });
  });
}); 