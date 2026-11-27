import { invoke } from "@tauri-apps/api/core";
import type { Contributions, ForgeFilter, ForgeList, ForgeLists, ForgeOpened, ForgeSection, GitlabStatus, Readme, RepoPage, VaultPeriod } from "../../features/forge/forgeTypes";
import type { AgendaItem } from "./agenda";

/** Pop-ups about the user's own PRs: red CI, and no review for `stalled_hours`. */
/** The morning summary: off by default, at a local hour, on working days unless asked otherwise. */
export type MorningDigest = { enabled: boolean; hour: number; weekdays_only: boolean };
export type MyPrAlerts = {
  ci: boolean;
  stalled: boolean;
  stalled_hours: number;
  mentions: boolean;
  reviews: boolean;
  merge_state: boolean;
  comments: boolean;
  assigned: boolean;
  others_prs: boolean;
  replies: boolean;
  team_mentions: boolean;
};
export type GithubStatus = { connected: boolean; login: string; source: string; device_flow: boolean };
export type DeviceCode = { user_code: string; url: string; expires_in_s: number };
export type Sender = { name: string; login: string; avatar: string };
/** One thread that mentions the user; `sender` and `preview` stay empty when the comment could not be found. */
export type MentionRow = {
  id: string;
  title: string;
  reference: string;
  url: string;
  is_pr: boolean;
  at: string;
  sender: Sender | null;
  preview: string;
  /** Not marked read yet. */
  unread: boolean;
  /** The thread or its author is muted. */
  muted: boolean;
  /** GitLab: the to-do is already done there. */
  done: boolean;
};
export type MentionsReply = {
  rows: MentionRow[];
  /** ms; 0 when the list was just asked for. */
  fetched_at: number;
  /** Set when the rate limit forced a cached copy: fresh data only after this instant (ms). */
  limited_until: number | null;
  unread: number;
};
/** Combined CI/pipeline status of a PR/MR's head commit. */
export type ChecksStatus = "success" | "failure" | "running" | "none";
export type PrRef = { repo: string; number: number };
/** Public card of a person: short texts already cut by Rust; `since` is the year the account was created (0 if unknown). */
export type GithubProfile = { login: string; name: string; bio: string; company: string; location: string; public_repos: number; followers: number; since: number; url: string };
/** `stage` is the GitLab stage (empty on GitHub), `seconds` 0 when unknown, `label` the forge's word for a state the app does not track (manual, skipped). */
export type PrJob = { name: string; state: ChecksStatus; url: string; stage: string; seconds: number; label: string };
export type PrReviewer = { login: string; state: "approved" | "changes" | "pending" };
/** One PR for the peek panel; `body` is already cut short by Rust. */
export type PrDetail = { body: string; head_branch: string; base_branch: string; changed_files: number; jobs: PrJob[]; reviewers: PrReviewer[] };
/** One comment of a PR for the peek panel: general (`path` empty) or inline on a file; Rust already cut the texts short. */
export type PrConvEntry = { id: number; author: string; bot: boolean; body: string; created_at: string; url: string; path: string; line: number; hunk: string; reply: boolean; thread: string; resolved: boolean; resolvable: boolean };
/** One changed file with its capped unified patch (empty for binaries). */
export type PrFile = { name: string; status: "added" | "removed" | "renamed" | "modified"; additions: number; deletions: number; patch: string; truncated: boolean };
export type PrReviewAction = "approve" | "request_changes" | "comment";
export type PrChecks = PrRef & { status: ChecksStatus; conflict?: boolean; additions?: number; deletions?: number; approvals?: number; changes_requested?: boolean };
export type PrComment = {
  id: number;
  author: string;
  author_type: string;
  avatar_url: string;
  body: string;
  created_at: string;
  url: string;
};

export const githubApi = {
  githubStatus: () => invoke<GithubStatus>("github_status"),
  /** Returns the login of the token's owner account. */
  githubSaveToken: (token: string) => invoke<string>("github_save_token", { token }),
  githubDeviceStart: () => invoke<DeviceCode>("github_device_start"),
  /** Resolves when the user authorizes in the browser; rejects on expiry or cancel. */
  githubDeviceFinish: () => invoke<string>("github_device_finish"),
  githubDeviceCancel: () => invoke<void>("github_device_cancel"),
  githubDisconnect: () => invoke<void>("github_disconnect"),
  /** Served from Rust's cache for 5 min unless `force`; the rate-limit guard applies either way. */
  githubLists: (filter: ForgeFilter, force = false) => invoke<ForgeLists>("github_lists", { filter, force }),
  githubSection: (section: ForgeSection, page: number, filter: ForgeFilter) =>
    invoke<ForgeList>("github_section", { section, page, filter }),
  /** Fallback click for a PR the batch left out; shares the batch's cache. */
  /** Repositories the account reaches, kept in Rust for 10 min unless `force`. */
  githubReposPage: (page: number, force = false) => invoke<RepoPage>("github_repos_page", { page, force }),
  githubReadme: (fullName: string, force = false) => invoke<Readme>("github_readme", { fullName, force }),
  /** The year's contribution calendar; only asked for when the statistics are on. */
  githubContributions: (force = false) => invoke<Contributions>("github_contributions", { force }),
  githubMentions: (force = false) => invoke<MentionsReply>("github_mentions", { force }),
  githubPrChecks: (repo: string, number: number) => invoke<ChecksStatus>("github_pr_checks", { repo, number }),
  /** CI badges for up to 20 PRs, cached in Rust per head sha; PRs that failed to load are left out. */
  githubPrDetail: (repo: string, number: number) => invoke<PrDetail>("github_pr_detail", { repo, number }),
  /** General and inline comments of one PR, oldest first; read only when the conversation is opened. */
  githubPrConversation: (repo: string, number: number) => invoke<PrConvEntry[]>("github_pr_conversation", { repo, number }),
  githubPrReview: (repo: string, number: number, action: PrReviewAction, body?: string) => invoke<void>("github_pr_review", { repo, number, action, body: body ?? null }),
  githubPrFiles: (repo: string, number: number) => invoke<PrFile[]>("github_pr_files", { repo, number }),
  /** Reply inside an inline thread; `comment` is the thread's first comment. */
  githubPrReply: (repo: string, number: number, comment: number, body: string) => invoke<void>("github_pr_reply", { repo, number, comment, body }),
  gitlabMrDetail: (project: string, iid: number) => invoke<PrDetail>("gitlab_mr_detail", { project, iid }),
  gitlabMrConversation: (project: string, iid: number) => invoke<PrConvEntry[]>("gitlab_mr_conversation", { project, iid }),
  gitlabMrFiles: (project: string, iid: number) => invoke<PrFile[]>("gitlab_mr_files", { project, iid }),
  /** GitLab has no "request changes" in its REST API. */
  gitlabMrReview: (project: string, iid: number, action: "approve" | "comment", body?: string) => invoke<void>("gitlab_mr_review", { project, iid, action, body: body ?? null }),
  gitlabMrReply: (project: string, iid: number, discussion: string, body: string) => invoke<void>("gitlab_mr_reply", { project, iid, discussion, body }),
  gitlabMrResolve: (project: string, iid: number, discussion: string, resolved: boolean) => invoke<void>("gitlab_mr_resolve", { project, iid, discussion, resolved }),
  githubProfile: (login: string) => invoke<GithubProfile>("github_profile", { login }),
  githubPrsChecks: (prs: PrRef[]) => invoke<PrChecks[]>("github_prs_checks", { prs }),
  /** Fetch comments on a PR to display in the commenters catalog. */
  githubPrComments: (repo: string, number: number) => invoke<PrComment[]>("github_pr_comments", { repo, number }),
  reviewAlertsGet: () => invoke<boolean>("review_alerts_get"),
  reviewAlertsSet: (enabled: boolean) => invoke<boolean>("review_alerts_set", { enabled }),
  morningDigestGet: () => invoke<MorningDigest>("morning_digest_get"),
  morningDigestSet: (config: MorningDigest) => invoke<MorningDigest>("morning_digest_set", { config }),
  myPrAlertsGet: () => invoke<MyPrAlerts>("my_pr_alerts_get"),
  myPrAlertsSet: (config: MyPrAlerts) => invoke<MyPrAlerts>("my_pr_alerts_set", { config }),
  gitlabStatus: () => invoke<GitlabStatus>("gitlab_status"),
  /** Validates address and token against the instance; returns the username. */
  gitlabConnect: (baseUrl: string, token: string) => invoke<string>("gitlab_connect", { baseUrl, token }),
  gitlabDisconnect: () => invoke<void>("gitlab_disconnect"),
  gitlabLists: (filter: ForgeFilter, force = false) => invoke<ForgeLists>("gitlab_lists", { filter, force }),
  gitlabSection: (section: ForgeSection, page: number, filter: ForgeFilter) =>
    invoke<ForgeList>("gitlab_section", { section, page, filter }),
  /** One call per click, not per list row: never fetched for a whole page at once. */
  gitlabMentions: (includeDone = false) => invoke<MentionsReply>("gitlab_mentions", { includeDone }),
  mentionRead: (ids: string[], read: boolean) => invoke<number>("mention_read", { ids, read }),
  mentionMuteThread: (url: string, title: string, muted: boolean) => invoke<number>("mention_mute_thread", { url, title, muted }),
  mentionMuteAuthor: (login: string, muted: boolean) => invoke<number>("mention_mute_author", { login, muted }),
  mentionsUnread: () => invoke<number>("mentions_unread"),
  gitlabReposPage: (page: number, force = false) => invoke<RepoPage>("gitlab_repos_page", { page, force }),
  gitlabReadme: (id: string, branch: string, force = false) => invoke<Readme>("gitlab_readme", { id, branch, force }),
  /** Pages already held in RAM or in the sealed disk copy (page 1 on): painted before any request. */
  reposCached: (forge: "github" | "gitlab") => invoke<RepoPage[]>("repos_cached", { forge }),
  /** Icons as `data:` URLs by source URL (the CSP blocks remote images); a failed one is left out. */
  repoAvatars: (forge: "github" | "gitlab", urls: string[]) => invoke<Record<string, string>>("repo_avatars", { forge, urls }),
  /** GitLab has no calendar for tokens: the user's events of the last year, counted per day. */
  gitlabContributions: (force = false) => invoke<Contributions>("gitlab_contributions", { force }),
  gitlabMrChecks: (project: string, iid: number) => invoke<ChecksStatus>("gitlab_mr_checks", { project, iid }),
  /** PRs/MRs opened since local midnight on every connected forge; one failing forge only adds to `errors`. */
  forgesOpenedSince: (sinceMs: number) => invoke<ForgeOpened>("forges_opened_since", { sinceMs }),
  /** The period report's bounds are local midnights computed here (see AGENTS.md); `toMs` is exclusive. */
  forgesActivityBetween: (fromMs: number, toMs: number) =>
    invoke<ForgeOpened>("forges_activity_between", { fromMs, toMs }),
  reportAgenda: (fromMs: number, toMs: number) => invoke<AgendaItem[]>("report_agenda", { fromMs, toMs }),
  reportVault: (fromDay: string, toDay: string, fromMs: number, toMs: number) =>
    invoke<VaultPeriod>("report_vault", { fromDay, toDay, fromMs, toMs }),
};
