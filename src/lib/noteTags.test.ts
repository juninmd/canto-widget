import { afterEach, expect, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import type { Note } from "./api";
import { activeTag, censusOf, tagCounts } from "./noteTags";
import { NOTES_VIEW_KEY, useNotesView } from "./useNotesView";

const note = (id: string, tags: string[]): Note => ({ id, title: id, body: "", tags, created_at: 1, updated_at: 1 });

test("tags are counted once per note and ordered by count, then name", () => {
  const counts = tagCounts([note("a", ["dev", "ux", "dev"]), note("b", ["dev"]), note("c", ["time", "ux"]), note("d", [])]);
  expect(counts).toEqual([
    { tag: "dev", count: 2 },
    { tag: "ux", count: 2 },
    { tag: "time", count: 1 },
  ]);
});

test("the census is complete only when the page held every note", () => {
  expect(censusOf([note("a", ["x"])], 1).complete).toBe(true);
  expect(censusOf([note("a", ["x"])], 5).complete).toBe(false);
});

test("a #tag query names the active tag; free text and a bare # do not", () => {
  expect(activeTag("#Produto")).toBe("produto");
  expect(activeTag("  #dev ")).toBe("dev");
  expect(activeTag("#")).toBeNull();
  expect(activeTag("dev")).toBeNull();
});

afterEach(() => {
  localStorage.clear();
});

test("the notes view defaults to the list and remembers the grid", () => {
  const first = renderHook(() => useNotesView());
  expect(first.result.current[0]).toBe("list");
  act(() => first.result.current[1]("grid"));
  expect(first.result.current[0]).toBe("grid");
  expect(localStorage.getItem(NOTES_VIEW_KEY)).toBe("grid");
  first.unmount();

  expect(renderHook(() => useNotesView()).result.current[0]).toBe("grid");
});

test("an unknown stored value falls back to the list", () => {
  localStorage.setItem(NOTES_VIEW_KEY, "carrossel");
  expect(renderHook(() => useNotesView()).result.current[0]).toBe("list");
});

test("blocked storage neither crashes the view nor loses the in-memory choice", () => {
  const real = Object.getOwnPropertyDescriptor(window, "localStorage")!;
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    get() {
      throw new Error("blocked");
    },
  });
  try {
    const { result } = renderHook(() => useNotesView());
    expect(result.current[0]).toBe("list");
    act(() => result.current[1]("grid"));
    expect(result.current[0]).toBe("grid");
  } finally {
    Object.defineProperty(window, "localStorage", real);
  }
});
