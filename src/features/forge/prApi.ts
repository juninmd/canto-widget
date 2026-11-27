import { api, type ForgeItem, type PrAction, type PrConvEntry, type PrDetail, type PrFile, type PrLabel, type PrMeta, type PrReviewAction } from "../../lib/api";
import type { Forge } from "./forge";

/** What the PR view needs from a forge: the same shape for GitHub PRs and GitLab MRs. */
export type PrBackend = {
  forge: Forge;
  /** "PR" or "MR": the word of each forge. */
  kind: string;
  host: string;
  /** The forge's own page of this PR/MR: where a picture that can't be embedded still opens. */
  url: string;
  detail: () => Promise<PrDetail>;
  conversation: () => Promise<PrConvEntry[]>;
  files: () => Promise<PrFile[]>;
  review: (action: PrReviewAction, body: string) => Promise<void>;
  reply: (thread: string, body: string) => Promise<void>;
  /** Only GitLab can resolve a thread from here. */
  resolve?: (thread: string, resolved: boolean) => Promise<void>;
  /** GitLab's REST API has no "request changes". */
  canRequestChanges: boolean;
  /** Public profiles are a GitHub thing. */
  profiles: boolean;
  /** The repo or project the view belongs to: where the forge keeps the pictures of a diff. */
  repo: string;
  meta: () => Promise<PrMeta>;
  /** Merge, close, reopen, draft, labels and reactions; the forge refuses with its own words when the token can't write. */
  act: (action: PrAction) => Promise<void>;
  repoLabels: () => Promise<PrLabel[]>;
  /** GitHub's comments carry reaction counts; GitLab's don't, so what you add there is only shown until the next load. */
  commentCounts: boolean;
  /** GitLab only waits for the pipeline when asked. */
  autoMerge: boolean;
  /** Where a `data:` picture comes from. */
  image: (url: string) => Promise<string>;
  blob: (path: string, gitRef: string) => Promise<string>;
};

export function prBackend(forge: Forge, item: ForgeItem): PrBackend {
  const { repo, number } = item;
  if (forge === "gitlab") {
    return {
      forge,
      kind: "MR",
      host: "GitLab",
      url: item.url,
      detail: () => api.gitlabMrDetail(repo, number),
      conversation: () => api.gitlabMrConversation(repo, number),
      files: () => api.gitlabMrFiles(repo, number),
      review: (action, body) => api.gitlabMrReview(repo, number, action === "approve" ? "approve" : "comment", body),
      reply: (thread, body) => api.gitlabMrReply(repo, number, thread, body),
      resolve: (thread, resolved) => api.gitlabMrResolve(repo, number, thread, resolved),
      canRequestChanges: false,
      profiles: false,
      repo,
      meta: () => api.gitlabMrMeta(repo, number),
      act: (action) => api.gitlabMrAct(repo, number, action),
      repoLabels: () => api.gitlabProjectLabels(repo),
      commentCounts: false,
      autoMerge: true,
      image: (url) => api.forgeImage("gitlab", url),
      blob: (path, gitRef) => api.prBlobImage("gitlab", repo, path, gitRef),
    };
  }
  return {
    forge,
    kind: "PR",
    host: "GitHub",
    url: item.url,
    detail: () => api.githubPrDetail(repo, number),
    conversation: () => api.githubPrConversation(repo, number),
    files: () => api.githubPrFiles(repo, number),
    review: (action, body) => api.githubPrReview(repo, number, action, body),
    reply: (thread, body) => api.githubPrReply(repo, number, Number(thread), body),
    canRequestChanges: true,
    profiles: true,
    repo,
    meta: () => api.githubPrMeta(repo, number),
    act: (action) => api.githubPrAct(repo, number, action),
    repoLabels: () => api.githubRepoLabels(repo),
    commentCounts: true,
    autoMerge: false,
    image: (url) => api.forgeImage("github", url),
    blob: (path, gitRef) => api.prBlobImage("github", repo, path, gitRef),
  };
}
