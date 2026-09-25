import { expect, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { useNoteDraft } from "./useNoteDraft";

const draft = { id: "n1", title: "rascunho fictício", body: "texto", tags: "", link: null };

test("an open draft stays while the vault is unlocked", () => {
  const { result, rerender } = renderHook(({ active }) => useNoteDraft(active), { initialProps: { active: true } });
  act(() => result.current.open(draft));
  rerender({ active: true });
  expect(result.current.editing).toBe(true);
  expect(result.current.draft.title).toBe("rascunho fictício");
});

test("locking the vault drops the draft, so no note text outlives the lock", () => {
  const { result, rerender } = renderHook(({ active }) => useNoteDraft(active), { initialProps: { active: true } });
  act(() => result.current.open(draft));
  rerender({ active: false });
  expect(result.current.editing).toBe(false);
  expect(result.current.draft.title).toBe("");
});
