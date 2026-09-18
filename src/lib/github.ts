import type { GithubFilter, GithubItem, GithubKind, GithubList, GithubSection } from "./api";

export const SECTIONS: { key: GithubSection; title: string; kinds: GithubKind[] }[] = [
  { key: "review_requested", title: "Revisão pedida a mim", kinds: ["pr"] },
  { key: "assigned", title: "Atribuídos a mim", kinds: ["pr", "issue"] },
  { key: "my_prs", title: "PRs que eu abri", kinds: ["pr"] },
  { key: "my_issues", title: "Issues que eu abri", kinds: ["issue"] },
];

export const NO_FILTER: GithubFilter = { text: "", kind: "all" };

export const KINDS: { kind: GithubKind; label: string }[] = [
  { kind: "all", label: "tudo" },
  { kind: "pr", label: "PRs" },
  { kind: "issue", label: "issues" },
];

export function visibleSections(kind: GithubKind) {
  return SECTIONS.filter((s) => kind === "all" || s.kinds.includes(kind));
}

/** Search pages can shift while items get updated; a repeated URL would render twice. */
export function appendPage(list: GithubList, page: GithubList): GithubList {
  const seen = new Set(list.items.map((i) => i.url));
  const fresh: GithubItem[] = page.items.filter((i) => !seen.has(i.url));
  return { total: page.total, items: [...list.items, ...fresh] };
}
