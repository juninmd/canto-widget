import { expect, test } from "bun:test";
import type { ForgeItem, ForgeLists } from "../../lib/api";
import { attentionCount, needsAttention } from "./forgeAttention";

const NOW = new Date("2026-11-16T12:00:00Z");
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3_600_000).toISOString();
const item = (n: number, extra: Partial<ForgeItem> = {}): ForgeItem => ({
  repo: "acme/atlas",
  number: n,
  reference: `acme/atlas#${n}`,
  title: `PR ${n}`,
  url: `https://github.com/acme/atlas/pull/${n}`,
  created_at: hoursAgo(3),
  updated_at: hoursAgo(1),
  comments: 0,
  is_pr: true,
  draft: false,
  author: "ana",
  ...extra,
});
const list = (items: ForgeItem[]) => ({ total: items.length, items });

test("a review request only asks for attention once it is overdue", () => {
  expect(needsAttention("review_requested", item(1, { created_at: hoursAgo(47) }), NOW)).toBe(false);
  expect(needsAttention("review_requested", item(1, { created_at: hoursAgo(49) }), NOW)).toBe(true);
});

test("my PR asks for attention when CI failed, it conflicts or a reviewer asked for changes", () => {
  const key = "acme/atlas#2";
  expect(needsAttention("my_prs", item(2), NOW)).toBe(false);
  expect(needsAttention("my_prs", item(2), NOW, { ci: { [key]: "failure" } })).toBe(true);
  expect(needsAttention("my_prs", item(2), NOW, { ci: { [key]: "success" } })).toBe(false);
  expect(needsAttention("my_prs", item(2, { conflict: true }), NOW)).toBe(true);
  expect(needsAttention("my_prs", item(2), NOW, { conflicts: { [key]: true } })).toBe(true);
  expect(needsAttention("my_prs", item(2), NOW, { reviews: { [key]: { additions: 1, deletions: 0, approvals: 0, changes: true } } })).toBe(true);
  expect(needsAttention("my_prs", item(2), NOW, { reviews: { [key]: { additions: 1, deletions: 0, approvals: 2, changes: false } } })).toBe(false);
});

test("drafts, issues and the other sections never ask for attention", () => {
  expect(needsAttention("my_prs", item(3, { draft: true, conflict: true }), NOW)).toBe(false);
  expect(needsAttention("my_prs", item(3, { is_pr: false, conflict: true }), NOW)).toBe(false);
  expect(needsAttention("assigned", item(3, { conflict: true }), NOW)).toBe(false);
});

test("the count adds both sections", () => {
  const lists: ForgeLists = {
    review_requested: list([item(1, { created_at: hoursAgo(72) }), item(2)]),
    assigned: list([item(3, { conflict: true })]),
    my_prs: list([item(4, { conflict: true }), item(5)]),
    my_issues: list([]),
  };
  expect(attentionCount(lists, NOW)).toBe(2);
});
