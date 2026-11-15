import type { ContributionDay, RepoInfo, RepoPage } from "../../lib/api";

export type RepoView = "tree" | "flat";
export type RepoSort = "recent" | "name" | "stars";

/** A repository with its search text lowercased once: filtering thousands of them per keystroke stays cheap. */
export type Indexed = { repo: RepoInfo; hay: string };

export const indexRepos = (repos: RepoInfo[]): Indexed[] =>
  repos.map((repo) => ({
    repo,
    hay: [repo.full_name, repo.description, repo.language, ...repo.topics].join("\n").toLowerCase(),
  }));

/** Every word of the text must appear in the name, group, about, language or topics (case-insensitive). */
export function filterRepos(items: Indexed[], text: string): RepoInfo[] {
  const words = text.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const hits = words.length === 0 ? items : items.filter((i) => words.every((w) => i.hay.includes(w)));
  return hits.map((i) => i.repo);
}

/** The pages in order, a repository seen twice (a list that moved between two requests) kept once. */
export function mergePages(pages: Map<number, RepoPage>): RepoInfo[] {
  const seen = new Set<string>();
  const out: RepoInfo[] = [];
  for (const n of [...pages.keys()].sort((a, b) => a - b)) {
    for (const r of pages.get(n)?.repos ?? []) {
      const key = r.id || r.full_name;
      if (!seen.has(key)) {
        seen.add(key);
        out.push(r);
      }
    }
  }
  return out;
}

const byName = (a: RepoInfo, b: RepoInfo) => a.full_name.localeCompare(b.full_name);

export function sortRepos(repos: RepoInfo[], sort: RepoSort): RepoInfo[] {
  const by: Record<RepoSort, (a: RepoInfo, b: RepoInfo) => number> = {
    name: byName,
    recent: (a, b) => b.updated_at.localeCompare(a.updated_at) || byName(a, b),
    stars: (a, b) => b.stars - a.stars || byName(a, b),
  };
  return [...repos].sort(by[sort]);
}

export type Row =
  | { kind: "group"; key: string; name: string; depth: number; count: number; open: boolean; avatar: string }
  | { kind: "repo"; key: string; repo: RepoInfo; depth: number };

type Node = { key: string; name: string; depth: number; repos: RepoInfo[]; kids: Map<string, Node>; count: number; avatar: string };

const node = (key: string, name: string, depth: number): Node => ({ key, name, depth, repos: [], kids: new Map(), count: 0, avatar: "" });

/**
 * Groups, subgroups and repositories as a flat list of rows, ready to be windowed. The user's own repositories
 * (empty group) lead as the root; groups follow alphabetically, subgroups nested by their path (`acme/infra`).
 * `isOpen` says which group keys are expanded (a search expands them all).
 */
export function buildRows(repos: RepoInfo[], sort: RepoSort, isOpen: (key: string) => boolean): Row[] {
  const root = node("", "", 0);
  const top = new Map<string, Node>();
  for (const r of repos) {
    let n = root;
    if (r.group !== "") {
      const parts = r.group.split("/");
      let path = "";
      let level = top;
      for (let i = 0; i < parts.length; i++) {
        path = path ? `${path}/${parts[i]}` : parts[i];
        let next = level.get(path);
        if (!next) level.set(path, (next = node(path, parts[i], i)));
        next.count++;
        n = next;
        level = next.kids;
      }
      if (!n.avatar) n.avatar = r.group_avatar_url;
    }
    n.repos.push(r);
    if (n === root) root.count++;
  }
  const rows: Row[] = [];
  const visit = (n: Node) => {
    const open = isOpen(n.key);
    rows.push({ kind: "group", key: n.key, name: n.name, depth: n.depth, count: n.count, open, avatar: n.avatar });
    if (!open) return;
    for (const kid of [...n.kids.values()].sort((a, b) => a.name.localeCompare(b.name))) visit(kid);
    for (const repo of sortRepos(n.repos, sort)) rows.push({ kind: "repo", key: repo.id || repo.full_name, repo, depth: n.depth + 1 });
  };
  if (root.repos.length > 0) visit(root);
  for (const n of [...top.values()].sort((a, b) => a.name.localeCompare(b.name))) visit(n);
  return rows;
}

/** One repository per row, no groups: the busiest or the best known first, depending on the sort. */
export const flatRows = (repos: RepoInfo[], sort: RepoSort): Row[] =>
  sortRepos(repos, sort).map((repo) => ({ kind: "repo", key: repo.id || repo.full_name, repo, depth: 0 }));

/** The groups a search or the stats line counts: every distinct non-root path. */
export const groupCount = (repos: RepoInfo[]) => new Set(repos.filter((r) => r.group !== "").map((r) => r.group.split("/")[0])).size;

/**
 * A README for a narrow panel: the markdown renderer shows no raw HTML, so comments, tags and badge-only lines
 * (the usual first screen of a README) are dropped instead of appearing as noise.
 */
export function cleanReadme(text: string): string {
  return text
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/?[a-zA-Z][^>\n]*>/g, "")
    .replace(/^\s*(\[?!\[[^\]]*\]\([^)]*\)(\]\([^)]*\))?\s*)+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export const stars = (repos: RepoInfo[]) => repos.reduce((n, r) => n + r.stars, 0);

export type Cell = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 } | null;

/** Intensity 0-4 against the busiest day, like the profile calendar. */
export function level(count: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0 || max <= 0) return 0;
  return Math.min(4, Math.ceil((count / max) * 4)) as 1 | 2 | 3 | 4;
}

/** Columns of 7 days (Sunday first) ending at the latest day with data; the first column pads the days before it. */
export function heatmapWeeks(days: ContributionDay[], weeks: number): Cell[][] {
  const tail = days.slice(-weeks * 7);
  if (tail.length === 0) return [];
  const max = Math.max(...tail.map((d) => d.count));
  const cells: Cell[] = [...Array<Cell>(new Date(`${tail[0].date}T00:00:00Z`).getUTCDay()).fill(null), ...tail.map((d) => ({ ...d, level: level(d.count, max) }))];
  const cols: Cell[][] = [];
  for (let i = 0; i < cells.length; i += 7) cols.push(cells.slice(i, i + 7));
  return cols;
}
