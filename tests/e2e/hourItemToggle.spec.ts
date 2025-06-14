// @ts-nocheck
import { test, expect, devices } from '@playwright/test';

// 使用移动视口，确保点击即可展开

test.use(devices['Pixel 5']);

test.describe('Hour item mobile toggle', () => {
  test('expands and collapses first hour item', async ({ page }) => {
    await page.addInitScript(() => {
      window.matchMedia = (query) => ({
        matches: query.includes('(pointer: coarse)'),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList;
    });

    await page.goto('/');

    const buttonsLocator = page.locator('button[aria-expanded]:not([data-nextjs-dev-tools-button])');

    // 等待至少一个 HourItem 渲染出来
    await expect.poll(async () => await buttonsLocator.count(), { timeout: 8000 }).toBeGreaterThan(0);

    const firstBtn = buttonsLocator.first();
    // 将元素滚动到可见范围，并确保附着
    await firstBtn.evaluate(el => el.scrollIntoView({ block: 'center' }));
    await firstBtn.waitFor({ state: 'visible' });

    // 展开
    await firstBtn.click();
    await expect(firstBtn).toHaveAttribute('aria-expanded', 'true', { timeout: 3000 });

    // 折叠
    await firstBtn.click();
    await expect(firstBtn).toHaveAttribute('aria-expanded', 'false', { timeout: 3000 });
  });
}); 