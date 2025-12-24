// @ts-nocheck
import { test, expect } from "@playwright/test";

test.describe("Location → timezone → date re-anchor", () => {
  test("coordinate input triggers timezone switch without shifting to tomorrow, and current hour is visible", async ({
    page,
  }) => {
    // 固定到一个确定的时刻：
    // - New York: 2025-12-24 04:30
    // - Chongqing(Asia/Shanghai): 2025-12-24 17:30
    // 预期：切换到 Asia/Shanghai 后仍然是 12/24（不会变成 12/25 / Tomorrow）
    const fixedNowMs = new Date("2025-12-24T09:30:00.000Z").getTime();

    await page.addInitScript(({ nowMs }) => {
      const OriginalDate = Date;
      class MockDate extends OriginalDate {
        constructor(...args) {
          if (args.length === 0) super(nowMs);
          else super(...args);
        }
        static now() {
          return nowMs;
        }
      }
      // 保留静态方法
      MockDate.parse = OriginalDate.parse;
      MockDate.UTC = OriginalDate.UTC;
      // @ts-ignore
      window.Date = MockDate;
    }, { nowMs: fixedNowMs });

    // 拦截会话令牌（避免缺少 Google Key 导致组件进入 error 状态）
    await page.route("**/api/maps/session/start", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ sessionToken: "pw-session-token" }),
      });
    });

    // 坐标输入不需要 autocomplete，但 onChange 可能触发一次；返回空列表即可
    await page.route("**/api/maps/autocomplete**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ predictions: [] }),
      });
    });

    // 关键：拦截 timezone API，强制返回 Asia/Shanghai
    await page.route("**/api/maps/timezone**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          dstOffset: 0,
          rawOffset: 28800,
          timeZoneId: "Asia/Shanghai",
          timeZoneName: "China Standard Time",
          status: "OK",
        }),
      });
    });

    await page.goto("/");

    const locationInput = page.locator("#location");
    await expect(locationInput).toBeVisible();

    // 输入重庆坐标（触发时区 API -> Asia/Shanghai）
    await locationInput.fill("29.5657,106.5512");
    await locationInput.press("Enter");

    // 等待时区 UI 变更
    await expect(page.locator("text=Asia/Shanghai")).toBeVisible({ timeout: 10_000 });

    // 确认不会“跳到 Tomorrow”
    const todayBtn = page.getByRole("button", { name: "Today" });
    const tomorrowBtn = page.getByRole("button", { name: "Tomorrow" });
    await expect(todayBtn).toHaveAttribute("aria-pressed", "true", { timeout: 10_000 });
    await expect(tomorrowBtn).toHaveAttribute("aria-pressed", "false");

    // 日期输入应仍是 2025-12-24（不会变成 2025-12-25）
    const dateInput = page.locator('input[aria-label="Select date"]');
    await expect(dateInput).toHaveValue("December 24, 2025", { timeout: 10_000 });

    // 当前行星时应可见（不是仅 Day Ruler）
    await expect(page.locator("text=Current Planetary Hour")).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("#current-hour")).toContainText("-", { timeout: 10_000 }); // timeRange 形如 "HH:mm - HH:mm"
  });
});

