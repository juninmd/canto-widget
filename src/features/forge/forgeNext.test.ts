import { expect, test } from "bun:test";
import type { ForgeItem, ForgeLists } from "../../lib/api";
import { nextAction } from "./forgeNext";

const NOW = new Date("2026-11-16T12:00:00Z");
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3_600_000).toISOString();
const item = (n: number, extra: Partial<ForgeItem> = {}): ForgeItem => ({
  repo: "acme/atlas", number: n, reference: `acme/atlas#${n}`, title: `PR ${n}`, url: `https://github.com/acme/atlas/pull/${n}`,
  created_at: hoursAgo(3), updated_at: hoursAgo(1), comments: 0, is_pr: true, draft: false, author: "ana", ...extra,
});
const list = (items: ForgeItem[]) => ({ total: items.length, items });
const lists = (p: Partial<Record<keyof ForgeLists, ForgeItem[]>>): ForgeLists => ({
  review_requested: list(p.review_requested ?? []), others_prs: list([]), assigned: list([]), my_prs: list(p.my_prs ?? []), my_issues: list([]),
});

test("my own stuck PR comes before any review I owe", () => {
  const l = lists({ my_prs: [item(1), item(2)], review_requested: [item(3, { created_at: hoursAgo(200) })] });
  expect(nextAction(l, { "acme/atlas#2": "failure" }, {}, NOW)?.item.number).toBe(2);
  expect(nextAction(lists({ my_prs: [item(1, { conflict: true })] }), {}, {}, NOW)?.reason).toBe("mine");
});

test("without a stuck PR it points at the oldest review past the SLA, and ignores drafts", () => {
  const l = lists({ review_requested: [item(1, { created_at: hoursAgo(60) }), item(2, { created_at: hoursAgo(100) }), item(3, { created_at: hoursAgo(300), draft: true })] });
  const next = nextAction(l, {}, {}, NOW);
  expect([next?.item.number, next?.reason, next?.hours]).toEqual([2, "review", 100]);
});

test("nothing to start with when everything is fresh or green", () => {
  expect(nextAction(lists({ review_requested: [item(1, { created_at: hoursAgo(10) })], my_prs: [item(2)] }), { "acme/atlas#2": "success" }, {}, NOW)).toBeNull();
  expect(nextAction(lists({ my_prs: [item(4, { draft: true, conflict: true })] }), {}, {}, NOW)).toBeNull();
});
