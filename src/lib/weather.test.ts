import { expect, test } from "bun:test";
import type { WeatherDay } from "./api";
import { clock, conditionKey, degrees, isNight, rangeBar, uvKey, weekday } from "./weather";

test("every condition maps to its sentence and rain is not the percentage key", () => {
  expect(conditionKey("clear")).toBe("weather.clear");
  expect(conditionKey("rain")).toBe("weather.rainy");
  expect(conditionKey("storm")).toBe("weather.storm");
});

test("degrees are whole numbers in the user's locale", () => {
  expect(degrees(22.4)).toBe("22");
  expect(degrees(-3.6)).toBe("-4");
  expect(degrees(21.5)).toBe("22");
});

test("the API's local timestamp becomes a clock time", () => {
  expect(clock("2026-10-17T16:00")).toBe("16:00");
  expect(clock("qualquer coisa")).toBe("qualquer coisa");
});

test("a date becomes the short weekday", () => {
  expect(weekday("2026-10-18")).toBe("dom.");
  expect(weekday("nao e data")).toBe("nao e data");
});

const SUN = { sunrise: "2026-10-17T05:40", sunset: "2026-10-17T18:12", uv: 0 };
const day = (over: Partial<WeatherDay> = {}): WeatherDay => ({
  date: "2026-10-17",
  min: 10,
  max: 20,
  rain: 0,
  condition: "clear",
  ...SUN,
  ...over,
});

test("the UV index lands in the WHO band", () => {
  expect([0, 2.9, 3, 5.9, 6, 7.9, 8, 10.9, 11, 14].map(uvKey)).toEqual([
    "weather.uv.low", "weather.uv.low", "weather.uv.moderate", "weather.uv.moderate", "weather.uv.high",
    "weather.uv.high", "weather.uv.veryHigh", "weather.uv.veryHigh", "weather.uv.extreme", "weather.uv.extreme",
  ]);
});

test("an hour is night before the sunrise and from the sunset on", () => {
  const days = [day()];
  expect(isNight("2026-10-17T04:00", days)).toBe(true);
  expect(isNight("2026-10-17T05:40", days)).toBe(false);
  expect(isNight("2026-10-17T12:00", days)).toBe(false);
  expect(isNight("2026-10-17T18:12", days)).toBe(true);
});

test("without the sun times 06h to 19h is day", () => {
  const days = [day({ sunrise: "", sunset: "" })];
  expect(isNight("2026-10-17T05:00", days)).toBe(true);
  expect(isNight("2026-10-17T12:00", days)).toBe(false);
  expect(isNight("2026-10-17T19:00", days)).toBe(true);
  expect(isNight("2026-10-18T12:00", [])).toBe(false);
});

test("a day's bar sits inside the window's range and never vanishes", () => {
  expect(rangeBar(day({ min: 10, max: 20 }), 10, 30)).toEqual({ from: 0, span: 50 });
  expect(rangeBar(day({ min: 20, max: 30 }), 10, 30)).toEqual({ from: 50, span: 50 });
  expect(rangeBar(day({ min: 15, max: 15 }), 10, 30).span).toBe(6);
  expect(rangeBar(day({ min: 5, max: 5 }), 5, 5)).toEqual({ from: 0, span: 6 });
});
