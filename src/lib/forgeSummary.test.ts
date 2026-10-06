import { expect, test } from "bun:test";
import { summarize } from "./forgeSummary";
import type { ForgeItem, ForgeLists } from "./api";

const item = (number: number): ForgeItem => ({
  repo: "acme/api", number, reference: `acme/api#${number}`, title: "x", url: "https://github.com/acme/api/pull/1",
  created_at: "", updated_at: "", comments: 0, is_pr: true, draft: false, author: "bia",
});
const list = (total: number, items: ForgeItem[] = []) => ({ total, items });
const lists: ForgeLists = {
  review_requested: list(3), assigned: list(0), my_prs: list(2, [item(1), item(2)]), my_issues: list(5),
};

test("counts come from the section totals", () => {
  expect(summarize(lists)).toEqual({ reviews: 3, mine: 2, issues: 5, failing: null });
});

test("counts my PRs whose CI failed when badges exist", () => {
  expect(summarize(lists, { "acme/api#1": "failure", "acme/api#2": "success" }).failing).toBe(1);
  expect(summarize(lists, {}).failing).toBe(0);
});
