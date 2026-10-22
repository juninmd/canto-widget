import { expect, test } from "bun:test";
import type { WeatherDay, WeatherForecast } from "./api";
import { airLevel, clock, conditionKey, dayHours, degrees, isNight, nowcast, rangeBar, uvKey, weatherAlert, weekday } from "./weather";

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

test("the next two hours say when the rain starts, stops or that nothing changes", () => {
  expect(nowcast([0, 0, 0, 0])).toEqual({ key: "weather.nowcast.dry" });
  expect(nowcast([0, 0.05, 0.3, 1])).toEqual({ key: "weather.nowcast.starts", min: 30 });
  expect(nowcast([1, 0.5, 0, 0])).toEqual({ key: "weather.nowcast.stops", min: 30 });
  expect(nowcast([1, 1, 1, 1])).toEqual({ key: "weather.nowcast.raining" });
});

test("today opens the next 24 hours and another day its own calendar hours", () => {
  const hours = Array.from({ length: 30 }, (_, i) => ({ at: `2026-10-${17 + Math.floor((10 + i) / 24)}T${String((10 + i) % 24).padStart(2, "0")}:00`, temp: 20, rain: 0, condition: "clear" as const }));
  const days = [{ date: "2026-10-17" }, { date: "2026-10-18" }, { date: "2026-10-19" }] as WeatherDay[];
  expect(dayHours(hours, days, 0)).toHaveLength(24);
  expect(dayHours(hours, days, 1).map((h) => h.at)).toEqual(hours.slice(14).map((h) => h.at));
  expect(dayHours(hours, days, 2)).toEqual([]);
});

test("the air quality falls into the US AQI bands", () => {
  expect(airLevel(42).key).toBe("weather.air.good");
  expect(airLevel(51).key).toBe("weather.air.moderate");
  expect(airLevel(140).key).toBe("weather.air.sensitive");
  expect(airLevel(301).key).toBe("weather.air.veryBad");
});

test("the sky warns about the most urgent thing first", () => {
  const base: WeatherForecast = {
    now: { temp: 25, feels: 26, condition: "clear", humidity: 50, wind: 10, wind_dir: 0, is_day: true, gusts: 20 },
    hours: [{ at: "2026-10-17T10:00", temp: 25, rain: 0, condition: "clear" }],
    days: [{ date: "2026-10-17", min: 18, max: 30, rain: 0, condition: "clear", sunrise: "", sunset: "", uv: 9 }],
    rain_from: null,
  };
  expect(weatherAlert(base)).toEqual({ level: "warn", key: "weather.alert.uv", uv: "weather.uv.veryHigh" });
  expect(weatherAlert({ ...base, now: { ...base.now, gusts: 64 } })).toEqual({ level: "warn", key: "weather.alert.gusts", n: 64 });
  const later = { ...base, hours: [...base.hours, { at: "2026-10-17T15:00", temp: 24, rain: 80, condition: "storm" as const }] };
  expect(weatherAlert(later)).toEqual({ level: "warn", key: "weather.alert.stormAt", time: "15:00" });
  expect(weatherAlert({ ...later, now: { ...base.now, condition: "storm" } })).toEqual({ level: "danger", key: "weather.alert.storm" });
  expect(weatherAlert({ ...base, now: { ...base.now, is_day: false } })).toBeNull();
});
