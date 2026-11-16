import { beforeEach, expect, test } from "bun:test";
import { loadPins, repoKey, togglePin } from "./repoPins";

beforeEach(() => localStorage.clear());

test("toggling flips one key and stores the set", () => {
  const on = togglePin(new Set(), "a/b");
  expect([...on]).toEqual(["a/b"]);
  expect([...loadPins()]).toEqual(["a/b"]);
  expect(togglePin(on, "a/b").size).toBe(0);
  expect(loadPins().size).toBe(0);
});

test("a corrupt or foreign value reads as no pins", () => {
  localStorage.setItem("canto.forge.repos.pins", "{oops");
  expect(loadPins().size).toBe(0);
  localStorage.setItem("canto.forge.repos.pins", JSON.stringify(["x", 3, null]));
  expect([...loadPins()]).toEqual(["x"]);
});

test("GitLab projects are keyed by id, GitHub repositories by full name", () => {
  expect(repoKey({ id: "42", full_name: "g/p" })).toBe("42");
  expect(repoKey({ id: "", full_name: "o/r" })).toBe("o/r");
});
