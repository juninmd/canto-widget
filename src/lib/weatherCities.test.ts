import { afterEach, expect, test } from "bun:test";
import { popularCities, recentCities, rememberCity } from "./weatherCities";

const place = (city: string, lat: number, lon: number) => ({ city, admin1: "", country: "Brasil", lat, lon });

afterEach(() => localStorage.clear());

test("the popular cities are real points on Earth with the country in the user's language", () => {
  const cities = popularCities();
  expect(cities.length).toBeGreaterThanOrEqual(10);
  for (const c of cities) {
    expect(Math.abs(c.lat)).toBeLessThanOrEqual(90);
    expect(Math.abs(c.lon)).toBeLessThanOrEqual(180);
    expect(c.country.length).toBeGreaterThan(0);
  }
  expect(cities[0]).toMatchObject({ city: "São Paulo", admin1: "SP", country: "Brasil" });
  expect(new Set(cities.map((c) => `${c.lat},${c.lon}`)).size).toBe(cities.length);
});

test("the last picks come back newest first, without repeating a city, up to four", () => {
  for (const [i, c] of ["A", "B", "C", "D", "E"].entries()) rememberCity(place(c, i * 10, i * 10));
  expect(recentCities().map((c) => c.city)).toEqual(["E", "D", "C", "B"]);
  rememberCity(place("C bis", 20.02, 20.01));
  expect(recentCities().map((c) => c.city)).toEqual(["C bis", "E", "D", "B"]);
});

test("a broken or hostile storage value reads as no recents", () => {
  localStorage.setItem("canto.weather.recent", "{nope");
  expect(recentCities()).toEqual([]);
  localStorage.setItem("canto.weather.recent", JSON.stringify([{ city: 1 }, null, place("Ok", 1, 1)]));
  expect(recentCities().map((c) => c.city)).toEqual(["Ok"]);
});
