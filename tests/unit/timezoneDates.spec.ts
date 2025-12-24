import { describe, it, expect } from "vitest";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { addDaysToISODate, reanchorSelectedDateOnTimezoneChange } from "@/utils/timezoneDates";

describe("timezoneDates", () => {
  it("addDaysToISODate handles month/year boundaries", () => {
    expect(addDaysToISODate("2025-12-24", -1)).toBe("2025-12-23");
    expect(addDaysToISODate("2025-12-24", 1)).toBe("2025-12-25");
    expect(addDaysToISODate("2025-12-31", 1)).toBe("2026-01-01");
    expect(addDaysToISODate("2026-01-01", -1)).toBe("2025-12-31");
  });

  it("reanchorSelectedDateOnTimezoneChange follows 'today' across timezones", () => {
    const baseTimeUtc = new Date("2025-12-24T09:30:00Z"); // 17:30 in Asia/Shanghai, 04:30 in New York
    const oldTimezone = "America/New_York";
    const newTimezone = "Asia/Shanghai";

    // 用户在纽约“今天”页面（12:00 本地）对应的 UTC
    const selectedDateUtc = fromZonedTime("2025-12-24T12:00:00", oldTimezone);

    const reanchored = reanchorSelectedDateOnTimezoneChange({
      selectedDateUtc,
      oldTimezone,
      newTimezone,
      baseTimeUtc,
    });

    expect(formatInTimeZone(reanchored, newTimezone, "yyyy-MM-dd")).toBe("2025-12-24");
  });

  it("reanchorSelectedDateOnTimezoneChange preserves non-today selected day", () => {
    const baseTimeUtc = new Date("2025-12-24T09:30:00Z");
    const oldTimezone = "America/New_York";
    const newTimezone = "Asia/Shanghai";

    const selectedDateUtc = fromZonedTime("2025-12-20T12:00:00", oldTimezone);

    const reanchored = reanchorSelectedDateOnTimezoneChange({
      selectedDateUtc,
      oldTimezone,
      newTimezone,
      baseTimeUtc,
    });

    expect(formatInTimeZone(reanchored, newTimezone, "yyyy-MM-dd")).toBe("2025-12-20");
  });
});

