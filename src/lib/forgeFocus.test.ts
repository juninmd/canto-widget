import { expect, test } from "bun:test";
import type { ForgeItem, ForgeLists } from "./api";
import { effectiveFocus, focusList, focusSections } from "./forgeFocus";

const item = (number: number): ForgeItem => ({
  repo: "acme/api", number, reference: `acme/api#${number}`, title: "x", url: `https://github.com/acme/api/pull/${number}`,
  created_at: "", updated_at: "", comments: 0, is_pr: true, draft: false, author: "bia",
});
const lists: ForgeLists = {
  review_requested: { total: 3, items: [] },
  assigned: { total: 0, items: [] },
  my_prs: { total: 9, items: [item(1), item(2), item(3)] },
  my_issues: { total: 5, items: [] },
};
const sections = (["review_requested", "assigned", "my_prs", "my_issues"] as const).map((key) => ({ key }));

test("no tile pressed keeps every section; a tile keeps only its own", () => {
  expect(focusSections(sections, null)).toHaveLength(4);
  expect(focusSections(sections, "reviews").map((s) => s.key)).toEqual(["review_requested"]);
  expect(focusSections(sections, "mine").map((s) => s.key)).toEqual(["my_prs"]);
  expect(focusSections(sections, "failing").map((s) => s.key)).toEqual(["my_prs"]);
  expect(focusSections(sections, "issues").map((s) => s.key)).toEqual(["my_issues"]);
});

test("failing narrows my PRs to the red ones and forgets the unchecked rest", () => {
  const ci = { "acme/api#2": "failure", "acme/api#3": "success" } as const;
  const got = focusList(lists, "my_prs", "failing", ci);
  expect(got.items.map((i) => i.number)).toEqual([2]);
  expect(got.total).toBe(1);
  expect(focusList(lists, "my_prs", "mine", ci)).toBe(lists.my_prs);
  expect(focusList(lists, "my_prs", null, ci)).toBe(lists.my_prs);
});

test("a stale failing choice is dropped where there are no CI badges", () => {
  expect(effectiveFocus("failing", undefined)).toBeNull();
  expect(effectiveFocus("failing", {})).toBe("failing");
  expect(effectiveFocus("reviews", undefined)).toBe("reviews");
});
