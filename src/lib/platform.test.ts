import { expect, test } from "bun:test";
import { detectMobile } from "./platform";

const ANDROID = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36";
const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148";
const MAC = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko)";
const WINDOWS = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

test("Android and iPhone webviews are mobile", () => {
  expect(detectMobile(ANDROID, 5, "")).toBe(true);
  expect(detectMobile(IPHONE, 5, "")).toBe(true);
});

test("an iPad reports a Mac user agent but has a touch screen; a Mac does not", () => {
  expect(detectMobile(MAC, 5, "")).toBe(true);
  expect(detectMobile(MAC, 0, "")).toBe(false);
});

test("desktop webviews are not mobile", () => {
  expect(detectMobile(WINDOWS, 0, "")).toBe(false);
  expect(detectMobile(WINDOWS, 10, "?alert")).toBe(false);
});

test("?mobile forces the phone layout for browser previews", () => {
  expect(detectMobile(WINDOWS, 0, "?mobile")).toBe(true);
});
