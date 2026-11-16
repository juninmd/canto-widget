import { expect, test } from "bun:test";
import { inLabel, levelOf, pillText } from "./stripModel";
import type { StripSnapshot } from "../../lib/api";

const base: StripSnapshot = { cpu: 20, memory: 50, weather: null, event: null, reviews: 0, battery: null, tasks: 0, notices: 0 };

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
