import { beforeEach, describe, expect, test } from "bun:test";
import { backupAge, markExported, readLastExport, STALE_AFTER_DAYS } from "./backupReminder";

const DAY = 86_400_000;

describe("backupAge", () => {
  test("never exported", () => {
    expect(backupAge(null)).toEqual({ kind: "never" });
  });

  test("fresh until the threshold, stale from it", () => {
    const now = 100 * DAY;
    expect(backupAge(now - 2 * DAY, now)).toEqual({ kind: "ok", days: 2 });
    expect(backupAge(now - (STALE_AFTER_DAYS - 1) * DAY, now).kind).toBe("ok");
    expect(backupAge(now - STALE_AFTER_DAYS * DAY, now)).toEqual({ kind: "stale", days: STALE_AFTER_DAYS });
  });

  test("a clock moved back never gives a negative age", () => {
    expect(backupAge(10 * DAY, 5 * DAY)).toEqual({ kind: "ok", days: 0 });
  });
});

describe("last export storage", () => {
  beforeEach(() => localStorage.clear());

  test("round trip and junk is ignored", () => {
    expect(readLastExport()).toBeNull();
    markExported(1234);
    expect(readLastExport()).toBe(1234);
    localStorage.setItem("canto.lastExport", "lixo");
    expect(readLastExport()).toBeNull();
  });
});
