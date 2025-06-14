// @ts-nocheck
import { test, expect } from '@playwright/test';

test.describe('Location selection', () => {
  test('selects London preset and shows coordinates', async ({ page }) => {
    await page.goto('/');

    // 点击热门城市 London 按钮
    await page.getByRole('button', { name: 'London' }).click();

    // 坐标行应显示伦敦经纬度 (51.5074, -0.1278) 近似
    await expect(page.locator('text=latitude: 51.')).toBeVisible();
    await expect(page.locator('text=longitude: -0.')).toBeVisible();
  });
}); 