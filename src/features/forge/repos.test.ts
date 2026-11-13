import { expect, test } from "bun:test";
import type { RepoInfo } from "../../lib/api";
import { filterRepos, groupRepos, heatmapWeeks, level, stars } from "./repos";

const repo = (full_name: string, group = "", extra: Partial<RepoInfo> = {}): RepoInfo => ({
  name: full_name.split("/").pop()!,
  full_name,
  group,
  description: "",
  url: `https://github.com/${full_name}`,
  private: false,
  fork: false,
  archived: false,
  stars: 0,
  forks: 0,
  language: "",
  updated_at: "2026-11-01T00:00:00Z",
  ...extra,
});

test("the root comes first and groups follow alphabetically, keeping each group's order", () => {
  const groups = groupRepos([repo("zed/b", "zed"), repo("me/x"), repo("acme/a2", "acme"), repo("acme/a1", "acme")]);
  expect(groups.map((g) => g.key)).toEqual(["", "acme", "zed"]);
  expect(groups[1].repos.map((r) => r.name)).toEqual(["a2", "a1"]);
});

test("the filter matches name, description and language, ignoring case", () => {
  const all = [repo("acme/atlas", "acme", { description: "Mapas" }), repo("me/cli", "", { language: "Rust" })];
  expect(filterRepos(all, "ATLAS").map((r) => r.name)).toEqual(["atlas"]);
  expect(filterRepos(all, "mapas").length).toBe(1);
  expect(filterRepos(all, "rust").map((r) => r.name)).toEqual(["cli"]);
  expect(filterRepos(all, "  ").length).toBe(2);
  expect(stars([repo("a/b", "", { stars: 2 }), repo("a/c", "", { stars: 5 })])).toBe(7);
});

test("intensity runs 0-4 against the busiest day", () => {
  expect([0, 1, 5, 10].map((n) => level(n, 10))).toEqual([0, 1, 2, 4]);
  expect(level(3, 0)).toBe(0);
});

test("the heatmap makes columns of seven days and pads the first week", () => {
  // 2026-11-04 is a Wednesday: three empty cells before it.
  const days = ["04", "05", "06", "07", "08", "09"].map((d, i) => ({ date: `2026-11-${d}`, count: i }));
  const cols = heatmapWeeks(days, 26);
  expect(cols.map((c) => c.length)).toEqual([7, 2]);
  expect(cols[0].slice(0, 3)).toEqual([null, null, null]);
  expect(cols[1][1]?.date).toBe("2026-11-09");
  expect(heatmapWeeks([], 26)).toEqual([]);
});

test("only the last weeks are kept", () => {
  const days = Array.from({ length: 70 }, (_, i) => ({ date: new Date(Date.UTC(2026, 0, 4 + i)).toISOString().slice(0, 10), count: 1 }));
  expect(heatmapWeeks(days, 4).flat().filter(Boolean).length).toBe(28);
});
