import { beforeEach, expect, test } from "bun:test";
import { loadWatched, takeSettled, toggleWatch } from "./ciWatch";

beforeEach(() => localStorage.clear());

test("toggling watches a PR and a second toggle stops watching it", () => {
  expect(toggleWatch("acme/atlas", 7, "Rotas")).toBe(true);
  expect(loadWatched()).toEqual({ "acme/atlas#7": "Rotas" });
  expect(toggleWatch("acme/atlas", 7, "Rotas")).toBe(false);
  expect(loadWatched()).toEqual({});
});

test("only a watched PR whose CI ended is reported, once, and the rest stays watched", () => {
  toggleWatch("acme/atlas", 7, "Rotas");
  toggleWatch("acme/atlas", 8, "Cache");
  toggleWatch("acme/atlas", 9, "Mapa");
  const got = [
    { repo: "acme/atlas", number: 7, status: "success" as const },
    { repo: "acme/atlas", number: 8, status: "running" as const },
    { repo: "acme/atlas", number: 10, status: "failure" as const },
  ];
  expect(takeSettled(got)).toEqual([{ key: "acme/atlas#7", title: "Rotas", ok: true }]);
  expect(takeSettled(got)).toEqual([]);
  expect(Object.keys(loadWatched()).sort()).toEqual(["acme/atlas#8", "acme/atlas#9"]);
  expect(takeSettled([{ repo: "acme/atlas", number: 9, status: "failure" }])).toEqual([{ key: "acme/atlas#9", title: "Mapa", ok: false }]);
});

test("corrupt storage reads as nothing watched", () => {
  localStorage.setItem("canto.ciWatch", "[1]");
  expect(loadWatched()).toEqual({});
  localStorage.setItem("canto.ciWatch", "{oops");
  expect(loadWatched()).toEqual({});
});

test("the watch list is capped so storage cannot grow without bound", () => {
  for (let i = 0; i < 30; i++) toggleWatch("a/b", i, "t");
  expect(toggleWatch("a/b", 99, "t")).toBe(false);
  expect(Object.keys(loadWatched())).toHaveLength(30);
});
