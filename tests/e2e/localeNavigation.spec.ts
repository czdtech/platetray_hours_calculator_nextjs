// @ts-nocheck
import { test, expect } from '@playwright/test';

test.describe('locale navigation regression', () => {
  test('locale pages do not leak calculator CTA to EN root', async ({ page }) => {
    await page.goto('/es');
    await expect(page.locator('a[href="/"]')).toHaveCount(0);
    await expect(page.locator('a[href="/es"]').first()).toBeVisible();

    await page.goto('/pt');
    await expect(page.locator('a[href="/"]')).toHaveCount(0);
    await expect(page.locator('a[href="/pt"]').first()).toBeVisible();
  });

  test('city index locale calculator CTA stays localized', async ({ page }) => {
    await page.goto('/es/planetary-hours');
    await expect(page.locator('a[href="/"]')).toHaveCount(0);
    await expect(page.locator('a[href="/es"]').first()).toBeVisible();

    await page.goto('/pt/planetary-hours');
    await expect(page.locator('a[href="/"]')).toHaveCount(0);
    await expect(page.locator('a[href="/pt"]').first()).toBeVisible();
  });

  test('blog navigation from localized home remains in locale', async ({ page }) => {
    await page.goto('/es');
    await page.getByRole('link', { name: 'Blog' }).first().click();
    await expect(page).toHaveURL(/\/es\/blog$/);

    await page.goto('/pt');
    await page.getByRole('link', { name: 'Blog' }).first().click();
    await expect(page).toHaveURL(/\/pt\/blog$/);
  });
});
