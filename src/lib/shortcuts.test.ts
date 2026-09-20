import { expect, test } from "bun:test";
import { interpret } from "./shortcuts";

const key = (key: string, extra: Partial<{ code: string; altKey: boolean; ctrlKey: boolean; metaKey: boolean }> = {}) => ({
  key,
  code: extra.code ?? "",
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  ...extra,
});

test("Alt+number switches tabs by the physical code, even inside a field", () => {
  expect(interpret(key("1", { code: "Digit1", altKey: true }), true)).toEqual({ type: "tab", index: 1 });
  expect(interpret(key("¹", { code: "Digit6", altKey: true }), false)).toEqual({ type: "tab", index: 6 });
  expect(interpret(key("0", { code: "Digit0", altKey: true }), false)).toBeNull();
});

test("a bare key doesn't steal typing", () => {
  expect(interpret(key("n"), true)).toBeNull();
  expect(interpret(key("/"), true)).toBeNull();
  expect(interpret(key("?"), true)).toBeNull();
  expect(interpret(key("n"), false)).toEqual({ type: "focus", target: "new" });
  expect(interpret(key("/"), false)).toEqual({ type: "focus", target: "search" });
  expect(interpret(key("?"), false)).toEqual({ type: "help" });
});

test("Ctrl+N and Ctrl+Alt+L are left to the system", () => {
  expect(interpret(key("n", { ctrlKey: true }), false)).toBeNull();
  expect(interpret(key("l", { code: "KeyL", altKey: true, ctrlKey: true }), false)).toBeNull();
  expect(interpret(key("l", { code: "KeyL", altKey: true }), false)).toEqual({ type: "lock" });
});

test("Alt+P toggles privacy mode", () => {
  expect(interpret(key("p", { code: "KeyP", altKey: true }), false)).toEqual({ type: "privacy" });
  expect(interpret(key("p", { code: "KeyP", altKey: true }), true)).toEqual({ type: "privacy" });
});

test("F11 toggles fullscreen even while typing, but not with a modifier", () => {
  expect(interpret(key("F11", { code: "F11" }), true)).toEqual({ type: "fullscreen" });
  expect(interpret(key("F11", { code: "F11", ctrlKey: true }), false)).toBeNull();
});
