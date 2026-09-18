import { afterEach, expect, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { EXIT_MS, exitDuration, useNewIds, useExit } from "./motion";
import { ToastProvider, useToast, type Toast } from "./toast";

const original = window.matchMedia;
function withMotion() {
  window.matchMedia = ((q: string) => ({ matches: q.includes("no-preference"), media: q })) as typeof window.matchMedia;
}
const wait = (ms: number) => act(() => new Promise((r) => setTimeout(r, ms)));

afterEach(() => {
  window.matchMedia = original;
  cleanup();
});

test("someone asking for reduced motion sees the removal instantly (WCAG 2.3.3)", () => {
  expect(exitDuration()).toBe(0);
  withMotion();
  expect(exitDuration()).toBe(EXIT_MS);
});

test("double click during the exit doesn't delete twice", async () => {
  withMotion();
  let removals = 0;
  const { result } = renderHook(() => useExit());
  const remove = async () => void removals++;
  let a!: Promise<void>, b!: Promise<void>;
  act(() => {
    a = result.current.leave("x", remove);
    b = result.current.leave("x", remove);
  });
  expect(result.current.leaving.has("x")).toBe(true);
  await act(() => Promise.all([a, b]));
  expect(removals).toBe(1);
  expect(result.current.leaving.has("x")).toBe(false);
});

test("a removal that fails frees the item for a new attempt", async () => {
  const { result } = renderHook(() => useExit());
  await act(() => result.current.leave("x", () => Promise.reject(new Error("offline"))).catch(() => {}));
  let called = false;
  await act(() => result.current.leave("x", async () => void (called = true)));
  expect(called).toBe(true);
});

test("only animates what appeared after the first load, not the whole list", () => {
  const { result, rerender } = renderHook(({ ids, ctx }) => useNewIds(ids, ctx), {
    initialProps: { ids: [] as string[], ctx: null as string | null },
  });
  rerender({ ids: ["a", "b"], ctx: "2026-09-14" });
  expect(result.current("a")).toBe(false);
  rerender({ ids: ["c", "a", "b"], ctx: "2026-09-14" });
  expect(result.current("c")).toBe(true);
  expect(result.current("a")).toBe(false);
});

test("changing the day or a new search doesn't make the whole list enter again", () => {
  const { result, rerender } = renderHook(({ ids, ctx }) => useNewIds(ids, ctx), {
    initialProps: { ids: ["a"], ctx: "2026-09-14" as string | null },
  });
  rerender({ ids: ["x", "y"], ctx: "2026-09-15" });
  expect(result.current("x")).toBe(false);
  expect(result.current("y")).toBe(false);
});

test("an item that leaves and comes back (undo) animates in again", () => {
  const { result, rerender } = renderHook(({ ids }) => useNewIds(ids, ""), { initialProps: { ids: ["a", "b"] } });
  rerender({ ids: ["b"] });
  rerender({ ids: ["a", "b"] });
  expect(result.current("a")).toBe(true);
});

let notify: (a: Toast) => void = () => {};
function Capture() {
  notify = useToast();
  return null;
}

test("a closed toast animates the exit before disappearing when the system allows motion", async () => {
  withMotion();
  render(
    <ToastProvider>
      <Capture />
    </ToastProvider>,
  );
  act(() => notify({ message: "senha incorreta", type: "erro" }));
  fireEvent.click(screen.getByLabelText("fechar aviso"));
  expect(screen.getByText("senha incorreta").parentElement!.className).toContain("animate-baixar");
  await wait(EXIT_MS + 50);
  expect(screen.queryByText("senha incorreta")).toBeNull();
});
