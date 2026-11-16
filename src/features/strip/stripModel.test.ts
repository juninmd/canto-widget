import { expect, test } from "bun:test";
import { inLabel, levelOf, pillText } from "./stripModel";
import type { StripSnapshot } from "../../lib/api";

const base: StripSnapshot = {
  cpu: 20,
  memory: 50,
  disk: null,
  network: [0, 0],
  gpu: null,
  temp: null,
  market: null,
  health: { down: 0, total: 0 },
  history: null,
  weather: null,
  event: null,
  reviews: 0,
  battery: null,
  tasks: 0,
  notices: 0,
};

test("colour appears only when something is wrong", () => {
  expect(levelOf("cpu", base)).toBe("");
  expect(levelOf("cpu", { ...base, cpu: 70 })).toBe("warn");
  expect(levelOf("cpu", { ...base, cpu: 90 })).toBe("danger");
  expect(levelOf("reviews", { ...base, reviews: 2 })).toBe("warn");
  expect(levelOf("notices", { ...base, notices: 9 })).toBe("");
});

test("a meeting turns amber under fifteen minutes and red under five", () => {
  const at = (in_min: number) => ({ ...base, event: { title: "Daily", in_min, meet: true } });
  expect(levelOf("event", at(30))).toBe("");
  expect(levelOf("event", at(14))).toBe("warn");
  expect(levelOf("event", at(4))).toBe("danger");
  expect(levelOf("event", base)).toBe("");
});

test("the countdown reads in minutes, then hours, and 0 means under way", () => {
  expect(inLabel(0)).toBe("agora");
  expect(inLabel(14)).toBe("em 14 min");
  expect(inLabel(119)).toBe("em 119 min");
  expect(inLabel(135)).toBe("em 2 h");
});

test("an item with nothing to show gives null, not a placeholder number", () => {
  expect(pillText("weather", base)).toBeNull();
  expect(pillText("event", base)).toBeNull();
  expect(pillText("cpu", { ...base, cpu: 22.6 })).toBe("23%");
  expect(pillText("weather", { ...base, weather: { temp: 23.6, condition: "clear" } })).toBe("24°");
});

test("battery turns amber at 20% and red at 10%, but never while it charges", () => {
  expect(levelOf("battery", { ...base, battery: [50, false] })).toBe("");
  expect(levelOf("battery", { ...base, battery: [18, false] })).toBe("warn");
  expect(levelOf("battery", { ...base, battery: [9, false] })).toBe("danger");
  expect(levelOf("battery", { ...base, battery: [5, true] })).toBe("");
  expect(pillText("battery", base)).toBeNull();
  expect(pillText("battery", { ...base, battery: [57.4, false] })).toBe("57%");
  expect(pillText("tasks", { ...base, tasks: 3 })).toBe("3");
});

test("the new system items warn at their own marks and say nothing without a sensor", () => {
  expect(levelOf("gpu", { ...base, gpu: 85 })).toBe("warn");
  expect(levelOf("temp", { ...base, temp: 90 })).toBe("danger");
  expect(levelOf("disk", { ...base, disk: 96 })).toBe("danger");
  expect(levelOf("gpu", base)).toBe("");
  expect(pillText("gpu", base)).toBeNull();
  expect(pillText("temp", { ...base, temp: 61.4 })).toBe("61°C");
  expect(pillText("network", { ...base, network: [2048, 0] })).toBe("↓ 2,00 KB/s");
});

test("an endpoint down is red, and the market shows the day's move", () => {
  expect(levelOf("health", { ...base, health: { down: 1, total: 4 } })).toBe("danger");
  expect(pillText("health", { ...base, health: { down: 1, total: 4 } })).toBe("3/4");
  expect(pillText("health", base)).toBeNull();
  expect(pillText("market", { ...base, market: { symbol: "X", price: 5, change: -0.42, currency: "BRL" } })).toBe("-0,42%");
});

test("the clock follows the given time", () => {
  expect(pillText("clock", base, new Date(2026, 10, 15, 9, 5))).toBe("09:05");
});
