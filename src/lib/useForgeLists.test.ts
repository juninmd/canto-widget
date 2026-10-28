import { afterEach, expect, test } from "bun:test";
import { act } from "react";
import { renderHook } from "@testing-library/react";
import type { ForgeList, ForgeLists, ForgeSection } from "./api";
import { NO_FILTER } from "./forge";
import { clearForgeCache } from "./forgeCache";
import { useForgeLists, type ForgeSource } from "./useForgeLists";

afterEach(() => clearForgeCache());

const list = (total: number): ForgeList => ({ total, items: [] }) as unknown as ForgeList;
const lists = (): ForgeLists => ({ review_requested: list(5), assigned: list(5), my_prs: list(5), my_issues: list(5) }) as ForgeLists;

function deferredSource() {
  const pending: { section: ForgeSection; resolve: (l: ForgeList) => void }[] = [];
  const source: ForgeSource = {
    lists: async () => lists(),
    section: (section) => new Promise<ForgeList>((resolve) => pending.push({ section, resolve })),
  };
  return { source, pending };
}

test("each section paginates on its own and a repeated click while fetching is ignored", async () => {
  const { source, pending } = deferredSource();
  const { result } = renderHook(() => useForgeLists(source, "github"));
  await act(async () => {
    await result.current.load(NO_FILTER, true);
  });

  await act(async () => {
    void result.current.more("assigned");
    void result.current.more("assigned");
    void result.current.more("my_prs");
  });
  // The double click on "assigned" asked for its next page only once.
  expect(pending.map((p) => p.section)).toEqual(["assigned", "my_prs"]);
  expect([...result.current.loadingMore].sort()).toEqual(["assigned", "my_prs"]);

  // "my_prs" answering first must not clear the "carregando…" of "assigned".
  await act(async () => {
    pending[1].resolve(list(5));
  });
  expect(result.current.loadingMore).toEqual(["assigned"]);

  await act(async () => {
    pending[0].resolve(list(5));
  });
  expect(result.current.loadingMore).toEqual([]);
});

test("a fresh load frees pagination that was still waiting on the old list", async () => {
  const { source, pending } = deferredSource();
  const { result } = renderHook(() => useForgeLists(source, "gitlab"));
  await act(async () => {
    await result.current.load(NO_FILTER, true);
  });
  await act(async () => {
    void result.current.more("assigned");
  });
  await act(async () => {
    await result.current.load(NO_FILTER, true, true);
  });
  expect(result.current.loadingMore).toEqual([]);
  await act(async () => {
    void result.current.more("assigned");
  });
  expect(pending.length).toBe(2);
  // The stale reply landing late leaves the newer request's spinner alone.
  await act(async () => {
    pending[0].resolve(list(5));
  });
  expect(result.current.loadingMore).toEqual(["assigned"]);
});
