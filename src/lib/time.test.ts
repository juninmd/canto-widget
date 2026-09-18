import { expect, test } from "bun:test";
import { timeAgo } from "./time";

const now = new Date("2026-09-17T12:00:00Z");

test("relative time in minutes, hours and days", () => {
  expect(timeAgo("2026-09-17T11:59:40Z", now)).toBe("agora");
  expect(timeAgo("2026-09-17T11:55:00Z", now)).toBe("há 5 min");
  expect(timeAgo("2026-09-17T09:00:00Z", now)).toBe("há 3 h");
  expect(timeAgo("2026-09-15T11:00:00Z", now)).toBe("há 2 d");
});

test("an invalid or future date (clock skew) becomes 'agora' instead of NaN", () => {
  expect(timeAgo("lixo", now)).toBe("agora");
  expect(timeAgo("2026-09-17T13:00:00Z", now)).toBe("agora");
});

test("accepts epoch milliseconds, as stored by the clipboard", () => {
  expect(timeAgo(now.getTime() - 2 * 60_000, now)).toBe("há 2 min");
});
