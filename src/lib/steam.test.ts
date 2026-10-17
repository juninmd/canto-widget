import { expect, test } from "bun:test";
import { brl, count, playtime, reviewLabelKey, reviewTone, steamUrl } from "./steam";

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

test("cents are written as reais, never below zero", () => {
  // Intl separates "R$" from the number with a non-breaking space.
  expect(brl(4500)).toBe("R$\u00a045,00");
  expect(brl(123456)).toBe("R$\u00a01.234,56");
  expect(brl(0)).toBe("R$\u00a00,00");
  expect(brl(-10)).toBe("R$\u00a00,00");
});

test("a score reads at a glance from Steam's own bucket", () => {
  expect(reviewTone("overwhelmingly_positive")).toBe("good");
  expect(reviewTone("very_positive")).toBe("good");
  expect(reviewTone("positive")).toBe("good");
  expect(reviewTone("mostly_positive")).toBe("good");
  expect(reviewTone("mixed")).toBe("mixed");
  expect(reviewTone("mostly_negative")).toBe("bad");
  expect(reviewTone("negative")).toBe("bad");
  expect(reviewTone("overwhelmingly_negative")).toBe("bad");
  expect(reviewTone("")).toBe("");
  expect(reviewTone("weird")).toBe("");
});

test("every bucket Steam can send has a message of its own", () => {
  const buckets = {
    overwhelmingly_positive: "steam.review.overwhelmingly_positive",
    very_positive: "steam.review.very_positive",
    positive: "steam.review.positive",
    mostly_positive: "steam.review.mostly_positive",
    mixed: "steam.review.mixed",
    mostly_negative: "steam.review.mostly_negative",
    negative: "steam.review.negative",
    very_negative: "steam.review.very_negative",
    overwhelmingly_negative: "steam.review.overwhelmingly_negative",
  } as const;
  for (const [bucket, key] of Object.entries(buckets)) expect(reviewLabelKey(bucket)).toBe(key);
  expect(reviewLabelKey("")).toBeNull();
  expect(reviewLabelKey("weird")).toBeNull();
});

test("a review count is grouped the way the language writes numbers", () => {
  expect(count(12345)).toBe("12.345");
  expect(count(1)).toBe("1");
  expect(count(-5)).toBe("0");
});
