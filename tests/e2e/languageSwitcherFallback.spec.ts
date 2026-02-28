// @ts-nocheck
import { test, expect } from '@playwright/test';

async function switchLanguage(page, targetLabel: RegExp) {
  await page.getByRole('button', { name: 'Select language' }).click();
  await page.getByRole('button', { name: targetLabel }).click();
}

test.describe('language switcher blog fallback', () => {
  test('language switch keeps translated blog slug', async ({ page }) => {
    await page.goto('/blog/venus-hour-guide');
    await switchLanguage(page, /Español/i);
    await expect(page).toHaveURL(/\/es\/blog\/venus-hour-guide$/);
  });

  test('language switch falls back for untranslated blog slug', async ({ page }) => {
    await page.goto('/blog/what-are-planetary-hours');
    await switchLanguage(page, /Português/i);
    await expect(page).toHaveURL(/\/pt\/blog$/);
  });

  test('language switch back to EN keeps translated blog slug path', async ({ page }) => {
    await page.goto('/es/blog/venus-hour-guide');
    await switchLanguage(page, /English/i);
    await expect(page).toHaveURL(/\/blog\/venus-hour-guide$/);
  });
});
