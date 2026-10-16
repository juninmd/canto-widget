import { expect, test } from "bun:test";
import { playtime, steamUrl } from "./steam";

test("a row opens the store page of its app", () => {
  expect(steamUrl(620)).toBe("https://store.steampowered.com/app/620/");
});

test("a playtime under an hour stays in minutes", () => {
  expect(playtime(0)).toBe("0 min");
  expect(playtime(59)).toBe("59 min");
});

test("a playtime over an hour is written in hours and minutes", () => {
  expect(playtime(60)).toBe("1 h");
  expect(playtime(135)).toBe("2 h 15 min");
  expect(playtime(4000)).toBe("66 h 40 min");
});

test("a negative or fractional playtime is clamped to a whole number", () => {
  expect(playtime(-5)).toBe("0 min");
  expect(playtime(90.7)).toBe("1 h 30 min");
});
