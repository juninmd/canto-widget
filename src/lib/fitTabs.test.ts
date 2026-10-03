import { expect, test } from "bun:test";
import { fitTabs } from "./fitTabs";

const widths = [60, 60, 60, 60, 60]; // 5 tabs = 60 * 5 + 2 * 4 = 308

test("everything stays when it fits, with no room kept for the more button", () => {
  expect(fitTabs(widths, 308, 0, 50)).toEqual([0, 1, 2, 3, 4]);
});

test("a short bar keeps the first tabs and leaves space for the more button", () => {
  // 250 - 50 (more) - 2 = 198 for tabs: 3 tabs take 184, a 4th would need 246
  expect(fitTabs(widths, 250, 0, 50)).toEqual([0, 1, 2]);
});

test("the open tab is never hidden: it takes the place of the last one that fit", () => {
  expect(fitTabs(widths, 250, 4, 50)).toEqual([0, 1, 4]);
  expect(fitTabs(widths, 250, 3, 50)).toEqual([0, 1, 3]);
});

test("a tab already on the bar leaves the order alone", () => {
  expect(fitTabs(widths, 250, 2, 50)).toEqual([0, 1, 2]);
});

test("a bar too narrow for anything still shows the open tab", () => {
  expect(fitTabs(widths, 40, 3, 50)).toEqual([3]);
});

test("tabs of different widths: a wide one that does not fit stops the line, it is not skipped", () => {
  expect(fitTabs([50, 50, 120, 40], 200, 0, 40)).toEqual([0, 1]);
});

test("nothing measured yet (zero widths in a test DOM) keeps every tab", () => {
  expect(fitTabs([0, 0, 0], 0, 0, 0)).toEqual([0, 1, 2]);
});
