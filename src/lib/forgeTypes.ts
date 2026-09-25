/** An issue or PR/MR, from GitHub or GitLab; `reference` is how the forge writes it (`o/r#12`, `g/p!12`). */
export type ForgeItem = {
  repo: string;
  number: number;
  reference: string;
  title: string;
  url: string;
  created_at: string;
  updated_at: string;
  comments: number;
  is_pr: boolean;
  draft: boolean;
  author: string;
};
/**
 * `total` is the forge's count; `items` only carries the pages loaded so far.
 * `fetched_at` (ms) is when the data left the forge; `limited_until` (ms) is set when the rate limit forced a cached copy.
 */
export type ForgeList = { total: number; items: ForgeItem[]; fetched_at?: number; limited_until?: number | null };
export type ForgeSection = "review_requested" | "assigned" | "my_prs" | "my_issues";
export type ForgeKind = "all" | "pr" | "issue";
export type ForgeSort = "updated" | "created" | "comments";
export type ForgeOrder = "desc" | "asc";
export type ForgeFilter = { text: string; kind: ForgeKind; sort: ForgeSort; order: ForgeOrder };
export type ForgeLists = Record<ForgeSection, ForgeList>;
/** `items` are the PRs/MRs opened today; `merged` and `reviewed` are optional for older mocks. */
export type ForgeOpened = { items: ForgeItem[]; merged?: ForgeItem[]; reviewed?: ForgeItem[]; errors: string[] };
export type GitlabStatus = { connected: boolean; username: string; base_url: string };
