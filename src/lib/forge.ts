import type { ForgeFilter, ForgeItem, ForgeKind, ForgeList, ForgeLists, ForgeSection, ForgeSort } from "./api";
import { t } from "../i18n";

export type Forge = "github" | "gitlab";

/** GitLab calls PRs "merge requests"; the sections are the same. */
export function sections(forge: Forge): { key: ForgeSection; title: string; kinds: ForgeKind[] }[] {
  const pr = forge === "gitlab" ? "MRs" : "PRs";
  return [
    { key: "review_requested", title: t("forge.section.reviewRequested"), kinds: ["pr"] },
    { key: "assigned", title: t("forge.section.assigned"), kinds: ["pr", "issue"] },
    { key: "my_prs", title: t("forge.section.myPrs", { pr }), kinds: ["pr"] },
    { key: "my_issues", title: t("forge.section.myIssues"), kinds: ["issue"] },
  ];
}

export const NO_FILTER: ForgeFilter = { text: "", kind: "all", sort: "updated", order: "desc" };

export function kinds(forge: Forge): { kind: ForgeKind; label: string }[] {
  return [
    { kind: "all", label: t("forge.kind.all") },
    { kind: "pr", label: forge === "gitlab" ? "MRs" : "PRs" },
    { kind: "issue", label: t("forge.kind.issues") },
  ];
}

/** GitLab's list API has no "most commented" order; offering it would only produce an error. */
export function sorts(forge: Forge): { sort: ForgeSort; label: string }[] {
  const all: { sort: ForgeSort; label: string }[] = [
    { sort: "updated", label: t("forge.sort.updated") },
    { sort: "created", label: t("forge.sort.created") },
    { sort: "comments", label: t("forge.sort.comments") },
  ];
  return forge === "gitlab" ? all.filter((s) => s.sort !== "comments") : all;
}

export function visibleSections(forge: Forge, kind: ForgeKind) {
  return sections(forge).filter((s) => kind === "all" || s.kinds.includes(kind));
}

export function isFiltered(f: ForgeFilter): boolean {
  return f.text !== "" || f.kind !== "all";
}

/** Search pages can shift while items get updated; a repeated URL would render twice. */
export function appendPage(list: ForgeList, page: ForgeList): ForgeList {
  const seen = new Set(list.items.map((i) => i.url));
  const fresh: ForgeItem[] = page.items.filter((i) => !seen.has(i.url));
  return { ...list, total: page.total, items: [...list.items, ...fresh] };
}

/** Oldest copy on screen and the latest instant the rate limit holds us back, across the four sections. */
export function freshness(lists: ForgeLists): { fetchedAt: number | null; limitedUntil: number | null } {
  const all = Object.values(lists);
  const fetched = all.map((l) => l.fetched_at).filter((n): n is number => typeof n === "number" && n > 0);
  const limited = all.map((l) => l.limited_until).filter((n): n is number => typeof n === "number");
  return {
    fetchedAt: fetched.length ? Math.min(...fetched) : null,
    limitedUntil: limited.length ? Math.max(...limited) : null,
  };
}
