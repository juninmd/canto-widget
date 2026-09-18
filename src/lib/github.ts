import type { GithubLists } from "./api";

export const SECTIONS: { key: keyof GithubLists; title: string }[] = [
  { key: "review_requested", title: "Revisão pedida a mim" },
  { key: "assigned", title: "Atribuídos a mim" },
  { key: "my_prs", title: "PRs que eu abri" },
  { key: "my_issues", title: "Issues que eu abri" },
];
