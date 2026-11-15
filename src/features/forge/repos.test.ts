import { expect, test } from "bun:test";
import type { RepoInfo, RepoPage } from "../../lib/api";
import { buildRows, cleanReadme, filterRepos, flatRows, groupCount, heatmapWeeks, indexRepos, level, mergePages, stars } from "./repos";

const repo = (full_name: string, group = "", extra: Partial<RepoInfo> = {}): RepoInfo => ({
  id: "",
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
  open_issues: 0,
  language: "",
  updated_at: "2026-11-01T00:00:00Z",
  topics: [],
  avatar_url: "",
  group_avatar_url: "",
  default_branch: "",
  ...extra,
});

const page = (n: number, repos: RepoInfo[]): RepoPage => ({ page: n, repos, has_next: false, fetched_at: 0, limited_until: null, revalidated: false });

test("the root leads, groups follow alphabetically and subgroups nest by path", () => {
  const rows = buildRows(
    [repo("zed/b", "zed"), repo("me/x"), repo("acme/infra/deploy", "acme/infra"), repo("acme/a1", "acme")],
    "name",
    (k) => ["", "acme", "acme/infra", "zed"].includes(k),
  );
  expect(rows.map((r) => (r.kind === "group" ? `[${r.key || "root"}:${r.depth}:${r.count}]` : `${r.repo.full_name}:${r.depth}`))).toEqual([
    "[root:0:1]",
    "me/x:1",
    "[acme:0:2]",
    "[acme/infra:1:1]",
    "acme/infra/deploy:2",
    "acme/a1:1",
    "[zed:0:1]",
    "zed/b:1",
  ]);
});

test("a closed group hides its subgroups and repositories, and searching opens them all", () => {
  const all = [repo("acme/infra/deploy", "acme/infra"), repo("acme/a1", "acme")];
  expect(buildRows(all, "name", () => false).map((r) => r.key)).toEqual(["acme"]);
  expect(buildRows(all, "name", (k) => k === "acme").map((r) => r.key)).toEqual(["acme", "acme/infra", "acme/a1"]);
  expect(buildRows(all, "name", () => true).length).toBe(4);
});

test("a group icon comes from its own repositories", () => {
  const rows = buildRows([repo("acme/a", "acme", { group_avatar_url: "https://x/acme.png" })], "name", () => false);
  expect(rows[0].kind === "group" && rows[0].avatar).toBe("https://x/acme.png");
});

test("sorting by recent, name or stars, and the flat list has no groups", () => {
  const all = [repo("a/old", "a", { updated_at: "2026-01-01T00:00:00Z", stars: 9 }), repo("a/new", "a", { updated_at: "2026-02-01T00:00:00Z", stars: 1 })];
  const names = (sort: "recent" | "name" | "stars") => flatRows(all, sort).map((r) => (r.kind === "repo" ? r.repo.name : ""));
  expect([names("recent"), names("name"), names("stars")]).toEqual([["new", "old"], ["new", "old"], ["old", "new"]]);
  expect(flatRows(all, "name").every((r) => r.kind === "repo" && r.depth === 0)).toBe(true);
});

test("the filter needs every word in the name, about, language or topics, ignoring case", () => {
  const all = indexRepos([
    repo("acme/atlas", "acme", { description: "Mapas e rotas", topics: ["gis", "frota"] }),
    repo("me/cli", "", { language: "Rust", description: "Mapas no terminal" }),
  ]);
  expect(filterRepos(all, "ATLAS").map((r) => r.name)).toEqual(["atlas"]);
  expect(filterRepos(all, "mapas").length).toBe(2);
  expect(filterRepos(all, "mapas rust").map((r) => r.name)).toEqual(["cli"]);
  expect(filterRepos(all, "frota").map((r) => r.name)).toEqual(["atlas"]);
  expect(filterRepos(all, "  ").length).toBe(2);
  expect(stars([repo("a/b", "", { stars: 2 }), repo("a/c", "", { stars: 5 })])).toBe(7);
  expect(groupCount([repo("a/b", "acme"), repo("a/c", "acme/infra"), repo("a/d")])).toBe(1);
});

test("pages merge in order and a repository seen on two pages is kept once", () => {
  const merged = mergePages(
    new Map([
      [2, page(2, [repo("a/y"), repo("a/z")])],
      [1, page(1, [repo("a/x"), repo("a/y")])],
    ]),
  );
  expect(merged.map((r) => r.name)).toEqual(["x", "y", "z"]);
  expect(mergePages(new Map([[1, page(1, [repo("g/p", "g", { id: "7" }), repo("g/q", "g", { id: "7" })])]])).length).toBe(1);
});

test("a README loses comments, tags and badge-only lines but keeps its text", () => {
  const raw = '<p align="center"><img src="x.png"></p>\n<!-- badges -->\n[![CI](https://ci/badge.svg)](https://ci)\n![logo](logo.png)\n\n\n\n# Atlas\n\nMapas <b>rápidos</b> e [docs](https://d).';
  expect(cleanReadme(raw)).toBe("# Atlas\n\nMapas rápidos e [docs](https://d).");
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
