import { expect, test } from "bun:test";
import { daysBetween, isWorkday, localDayOf, periodBounds } from "./period";

test("the week runs from Monday to today and ends at the next local midnight", () => {
  // 2026-09-24 is a Thursday.
  expect(periodBounds("week", "2026-09-24")).toEqual({
    fromDay: "2026-09-21",
    toDay: "2026-09-24",
    fromMs: new Date(2026, 8, 21).getTime(),
    toMs: new Date(2026, 8, 25).getTime(),
  });
});

test("on Sunday the week still starts on the Monday before, and on Monday it is just today", () => {
  expect(periodBounds("week", "2026-09-27").fromDay).toBe("2026-09-21");
  expect(periodBounds("week", "2026-09-21").fromDay).toBe("2026-09-21");
});

test("a week crossing a month and a year boundary goes back into the previous one", () => {
  // 2027-01-01 is a Friday.
  expect(periodBounds("week", "2027-01-01").fromDay).toBe("2026-12-28");
});

test("the month starts on the 1st, and today alone is the day summary's own bounds", () => {
  expect(periodBounds("month", "2026-09-27")).toMatchObject({ fromDay: "2026-09-01", fromMs: new Date(2026, 8, 1).getTime() });
  expect(periodBounds("day", "2026-09-27")).toMatchObject({ fromDay: "2026-09-27", fromMs: new Date(2026, 8, 27).getTime() });
  expect(periodBounds("month", "2026-12-31").toMs).toBe(new Date(2027, 0, 1).getTime());
});

test("every day of the period is listed once, and workdays skip the weekend", () => {
  const days = daysBetween("2026-09-25", "2026-10-02");
  expect(days).toEqual(["2026-09-25", "2026-09-26", "2026-09-27", "2026-09-28", "2026-09-29", "2026-09-30", "2026-10-01", "2026-10-02"]);
  expect(days.filter(isWorkday)).toEqual(["2026-09-25", "2026-09-28", "2026-09-29", "2026-09-30", "2026-10-01", "2026-10-02"]);
});

test("an agenda start lands on its local day, all-day dates as they are", () => {
  expect(localDayOf(new Date(2026, 8, 22, 23, 30).toISOString())).toBe("2026-09-22");
  expect(localDayOf("2026-09-22")).toBe("2026-09-22");
});
