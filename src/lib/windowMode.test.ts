import { expect, test } from "bun:test";
import { miniSize, modeOf } from "./windowMode";

test("the visible mode comes from the two window facts", () => {
  expect(modeOf(false, false)).toBe("normal");
  expect(modeOf(false, true)).toBe("max");
  expect(modeOf(true, false)).toBe("mini");
  expect(modeOf(true, true), "Rust leaves fullscreen before shrinking, but mini wins if both report").toBe("mini");
});

test("the dock grows one row per alert and always keeps the empty handle", () => {
  expect(miniSize("bars", 0)).toEqual({ width: 24, height: 100 });
  expect(miniSize("bars", 1)).toEqual(miniSize("bars", 0));
  expect(miniSize("bars", 3).height - miniSize("bars", 2).height).toBe(48);
});

test("each view asks for the width it shows", () => {
  expect(miniSize("icons", 2).width).toBe(56);
  expect(miniSize("label", 2).width).toBe(300);
});

test("the menu view is always tall enough for its four options", () => {
  expect(miniSize("menu", 0).height).toBeGreaterThanOrEqual(250);
  expect(miniSize("menu", 9).height).toBe(miniSize("bars", 9).height);
});
