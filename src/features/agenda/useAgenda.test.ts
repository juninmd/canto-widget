import { afterEach, beforeEach, expect, spyOn, test } from "bun:test";
import { act } from "react";
import { cleanup, renderHook } from "@testing-library/react";
import { api, type AgendaItem } from "../../lib/api";
import { useAgenda } from "./useAgenda";

const pending: ((items: AgendaItem[]) => void)[] = [];
let spy: ReturnType<typeof spyOn>;

beforeEach(() => {
  spy = spyOn(api, "agendaToday").mockImplementation(() => new Promise<AgendaItem[]>((resolve) => pending.push(resolve)));
});

const item = (id: string): AgendaItem => ({
  id, title: id, start: "2026-09-18T17:00:00Z", end: "2026-09-18T18:00:00Z", all_day: false, location: "", meet: "", link: "",
});

afterEach(() => {
  cleanup();
  spy.mockRestore();
  pending.length = 0;
});

test("an older reload answering last does not overwrite the newer list", async () => {
  const { result } = renderHook(() => useAgenda(true));
  await act(async () => {
    void result.current.reload();
  });
  expect(pending).toHaveLength(2);
  await act(async () => pending[1]([item("new")]));
  expect(result.current.items.map((i) => i.id)).toEqual(["new"]);
  expect(result.current.loading).toBe(false);
  await act(async () => pending[0]([item("old")]));
  expect(result.current.items.map((i) => i.id)).toEqual(["new"]);
});

test("a fetch still in flight when the agenda turns off does not refill it", async () => {
  const { result, rerender } = renderHook(({ on }) => useAgenda(on), { initialProps: { on: true } });
  await act(async () => {});
  expect(pending).toHaveLength(1);
  rerender({ on: false });
  await act(async () => pending[0]([item("late")]));
  expect(result.current.items).toEqual([]);
  expect(result.current.loading).toBe(false);
});
