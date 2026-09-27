import type { ChecksStatus, ForgeLists, ForgeSection, PrChecks, PrRef } from "./api";

/** Same bound as `MAX_PRS` in `github_checks.rs`: each uncached PR costs three GitHub calls. */
export const MAX_CHECKED = 20;
const ORDER: ForgeSection[] = ["review_requested", "assigned", "my_prs"];

export type CiMap = Record<string, ChecksStatus>;

export const checkKey = (repo: string, number: number) => `${repo}#${number}`;

/** PRs on screen in section order, unknown ones first so "mostrar mais" gets its badges; known ones refresh after. */
export function prsToCheck(lists: ForgeLists, known: CiMap, limit = MAX_CHECKED): PrRef[] {
  const seen = new Set<string>();
  const prs: PrRef[] = [];
  for (const section of ORDER) {
    for (const it of lists[section].items) {
      const key = checkKey(it.repo, it.number);
      if (!it.is_pr || !it.url.startsWith("https://github.com/") || seen.has(key)) continue;
      seen.add(key);
      prs.push({ repo: it.repo, number: it.number });
    }
  }
  const fresh = prs.filter((p) => !(checkKey(p.repo, p.number) in known));
  const old = prs.filter((p) => checkKey(p.repo, p.number) in known);
  return [...fresh, ...old].slice(0, limit);
}

/** A PR the batch left out keeps its last badge rather than blinking back to "ver CI". */
export function applyChecks(prev: CiMap, results: PrChecks[]): CiMap {
  if (results.length === 0) return prev;
  const next = { ...prev };
  for (const r of results) next[checkKey(r.repo, r.number)] = r.status;
  return next;
}
