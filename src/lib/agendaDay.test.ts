import { expect, test } from "bun:test";
import type { AgendaItem } from "./api";
import { clockFor, relativeDay, shiftDay, windowOf } from "./agendaDay";

test("shiftDay crosses months and years", () => {
  expect(shiftDay("2026-03-01", -1)).toBe("2026-02-28");
  expect(shiftDay("2026-12-31", 1)).toBe("2027-01-01");
});

test("relativeDay names yesterday, today and tomorrow only", () => {
  expect(relativeDay("2026-09-09", "2026-09-10")).toBe("yesterday");
  expect(relativeDay("2026-09-10", "2026-09-10")).toBe("today");
  expect(relativeDay("2026-09-11", "2026-09-10")).toBe("tomorrow");
  expect(relativeDay("2026-09-20", "2026-09-10")).toBeNull();
});

test("clockFor: real clock today, end of a past day, start of a future day", () => {
  const real = new Date(2026, 8, 10, 14, 30);
  expect(clockFor("2026-09-10", "2026-09-10", real)).toBe(real);
  expect(clockFor("2026-09-09", "2026-09-10", real).getHours()).toBe(23);
  const future = clockFor("2026-09-11", "2026-09-10", real);
  expect([future.getDate(), future.getHours()]).toEqual([11, 8]);
  const early = { id: "e", start: new Date(2026, 8, 11, 6, 30).toISOString(), all_day: false } as AgendaItem;
  expect(clockFor("2026-09-11", "2026-09-10", real, [early]).getHours()).toBe(6);
});

test("windowOf covers the local day asked for", () => {
  const w = windowOf("2026-09-11");
  expect(new Date(w.timeMin).getDate()).toBe(11);
  expect(new Date(w.timeMax).getDate()).toBe(11);
});
