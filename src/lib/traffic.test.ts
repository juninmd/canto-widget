import { expect, test } from "bun:test";
import { bestDeparture, filterIncidents, project, slowLevel, todayHistory, tripLevel } from "./traffic";
import type { TrafficIncident } from "./api";

test("the projection puts a point in the same tile Rust downloads", () => {
  const [x, y] = project(-23.5505, -46.6333, 14);
  expect([Math.floor(x / 256), Math.floor(y / 256)]).toEqual([6069, 9295]);
});

test("a trip's level grows with the share of extra time", () => {
  expect(tripLevel(15, 15)).toBe("free");
  expect(tripLevel(19, 15)).toBe("slow");
  expect(tripLevel(24, 15)).toBe("jam");
  expect(tripLevel(30, 15)).toBe("stop");
  expect(slowLevel(5)).toBe("free");
  expect(slowLevel(38)).toBe("jam");
});

test("the best departure is the fastest and the earliest on a tie", () => {
  expect(bestDeparture([{ at: 1, minutes: 24 }, { at: 2, minutes: 15 }, { at: 3, minutes: 15 }])).toBe(1);
  expect(bestDeparture([])).toBe(-1);
});

test("filters and today's history", () => {
  const inc = (kind: TrafficIncident["kind"]): TrafficIncident => ({ kind, text: "", road: "", delay_s: 0, km: 1, lat: 0, lon: 0, magnitude: 1 });
  expect(filterIncidents([inc("jam"), inc("accident")], "jam")).toHaveLength(1);
  expect(filterIncidents([inc("jam"), inc("accident")], "all")).toHaveLength(2);
  const now = new Date(2026, 9, 23, 18, 0).getTime();
  const yesterday = new Date(2026, 9, 22, 23, 0).getTime();
  expect(todayHistory([[yesterday, 10], [now, 30]], now)).toEqual([[now, 30]]);
});
