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
  /** Can't merge until conflicts are resolved; absent on boards cached before it existed. */
  conflict?: boolean;
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
/**
 * `items` are the PRs/MRs opened in the period; `merged`, `reviewed` and `closed` are optional for older mocks.
 * `totals` counts past the first page each list carries.
 */
export type ForgeOpened = {
  items: ForgeItem[];
  merged?: ForgeItem[];
  reviewed?: ForgeItem[];
  closed?: ForgeItem[];
  errors: string[];
  totals?: { opened: number; merged: number; reviewed: number; closed?: number };
};
/** Tasks done (by their day) and notes created or edited in a period; lists are bounded, totals are not. */
export type VaultPeriod = {
  done: { title: string; day: string }[];
  done_total: number;
  notes: { title: string; created: boolean; at: number }[];
  notes_total: number;
  /** Seconds of focus on the period's tasks. */
  focused_secs?: number;
};
export type GitlabStatus = { connected: boolean; username: string; base_url: string };
/** A repository (GitHub) or project (GitLab) the user can reach; `group` is the organization or group path, empty for the user's own. */
export type RepoInfo = {
  /** GitLab's numeric project id as text; empty on GitHub, where `full_name` is the key. */
  id: string;
  name: string;
  full_name: string;
  group: string;
  description: string;
  url: string;
  private: boolean;
  fork: boolean;
  archived: boolean;
  stars: number;
  forks: number;
  open_issues: number;
  language: string;
  updated_at: string;
  topics: string[];
  /** The repository's own icon (or its owner's); remote, so it is only shown after Rust embeds it as a `data:` URL. */
  avatar_url: string;
  group_avatar_url: string;
  default_branch: string;
};
/** One page (100) of the list; `fetched_at` is older than now when it came from the cache. */
export type RepoPage = {
  page: number;
  repos: RepoInfo[];
  has_next: boolean;
  fetched_at: number;
  limited_until: number | null;
  /** The forge confirmed (304) that the cached copy is current. */
  revalidated: boolean;
};
export type Readme = { text: string; truncated: boolean; fetched_at: number; limited_until: number | null };
export type ContributionDay = { date: string; count: number };
export type Contributions = { days: ContributionDay[]; total: number; fetched_at: number; limited_until: number | null };
