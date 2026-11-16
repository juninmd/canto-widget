import { expect, test } from "bun:test";
import type { ForgeItem, ForgeList, ForgeLists } from "../../lib/api";
import { applyChecks, applyConflicts, applyReviews, checkKey, MAX_CHECKED, prsToCheck } from "./forgeChecks";

const pr = (number: number, extra: Partial<ForgeItem> = {}): ForgeItem => ({
  repo: "acme/atlas",
  number,
  reference: `acme/atlas#${number}`,
  title: `PR ${number}`,
  url: `https://github.com/acme/atlas/pull/${number}`,
  created_at: "",
  updated_at: "",
  comments: 0,
  is_pr: true,
  draft: false,
  author: "ana",
  ...extra,
});
const list = (items: ForgeItem[]): ForgeList => ({ total: items.length, items });
const lists = (p: Partial<ForgeLists>): ForgeLists => ({
  review_requested: list([]),
  assigned: list([]),
  my_prs: list([]),
  my_issues: list([]),
  ...p,
});

test("only PRs with a github.com link, once each, in section order", () => {
  const got = prsToCheck(
    lists({
      review_requested: list([pr(3)]),
      assigned: list([pr(1), pr(9, { is_pr: false }), pr(3)]),
      my_prs: list([pr(2), pr(5, { url: "https://evil.example/acme/atlas/pull/5" })]),
    }),
    {},
  );
  expect(got.map((p) => p.number)).toEqual([3, 1, 2]);
});

test("the batch is bounded and unknown PRs go first so a new page gets its badges", () => {
  const many = Array.from({ length: 30 }, (_, i) => pr(i + 1));
  const known = Object.fromEntries(many.slice(0, 20).map((p) => [checkKey(p.repo, p.number), "success" as const]));
  const got = prsToCheck(lists({ my_prs: list(many) }), known);
  expect(got).toHaveLength(MAX_CHECKED);
  expect(got[0].number).toBe(21);
  expect(got[10].number).toBe(1);
});

test("results update the map and keep what the batch left out", () => {
  const prev = { "acme/atlas#1": "running" as const, "acme/atlas#2": "failure" as const };
  const next = applyChecks(prev, [{ repo: "acme/atlas", number: 1, status: "success" }]);
  expect(next).toEqual({ "acme/atlas#1": "success", "acme/atlas#2": "failure" });
  expect(applyChecks(prev, [])).toBe(prev);
});

test("conflicts follow the batch too, and a PR it left out keeps its last state", () => {
  const prev = { "acme/atlas#1": true, "acme/atlas#2": true };
  const next = applyConflicts(prev, [{ repo: "acme/atlas", number: 1, status: "success", conflict: false }]);
  expect(next).toEqual({ "acme/atlas#1": false, "acme/atlas#2": true });
  expect(applyConflicts(prev, [])).toBe(prev);
});

test("applyReviews keeps the diff size and review state, and ignores answers from older builds", () => {
  const got = [{ repo: "a/b", number: 1, status: "success" as const, additions: 12, deletions: 3, approvals: 2, changes_requested: false }];
  const next = applyReviews({}, got);
  expect(next["a/b#1"]).toEqual({ additions: 12, deletions: 3, approvals: 2, changes: false });
  expect(applyReviews(next, [{ repo: "a/b", number: 2, status: "none" as const }])).toBe(next);
  expect(applyReviews(next, [])).toBe(next);
});
