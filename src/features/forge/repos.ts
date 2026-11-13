import type { ContributionDay, RepoInfo } from "../../lib/api";

export type RepoView = "list" | "cards" | "grid";
export type RepoGroup = { key: string; repos: RepoInfo[] };

/** Case-insensitive match on name, group, description and language. */
export function filterRepos(repos: RepoInfo[], text: string): RepoInfo[] {
  const q = text.trim().toLowerCase();
  if (!q) return repos;
  return repos.filter((r) => [r.full_name, r.description, r.language].some((v) => v.toLowerCase().includes(q)));
}

/** The user's own repositories (empty key) lead; groups follow alphabetically. Inside a group the order Rust sent stays. */
export function groupRepos(repos: RepoInfo[]): RepoGroup[] {
  const by = new Map<string, RepoInfo[]>();
  for (const r of repos) by.set(r.group, [...(by.get(r.group) ?? []), r]);
  return [...by.entries()]
    .map(([key, list]) => ({ key, repos: list }))
    .sort((a, b) => (a.key === "" ? -1 : b.key === "" ? 1 : a.key.localeCompare(b.key)));
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
