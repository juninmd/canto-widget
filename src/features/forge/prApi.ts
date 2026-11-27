import { api, type ForgeItem, type PrConvEntry, type PrDetail, type PrFile, type PrReviewAction } from "../../lib/api";
import type { Forge } from "./forge";

/** What the PR view needs from a forge: the same shape for GitHub PRs and GitLab MRs. */
export type PrBackend = {
  forge: Forge;
  /** "PR" or "MR": the word of each forge. */
  kind: string;
  host: string;
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
};

export function prBackend(forge: Forge, item: ForgeItem): PrBackend {
  const { repo, number } = item;
  if (forge === "gitlab") {
    return {
      forge,
      kind: "MR",
      host: "GitLab",
      detail: () => api.gitlabMrDetail(repo, number),
      conversation: () => api.gitlabMrConversation(repo, number),
      files: () => api.gitlabMrFiles(repo, number),
      review: (action, body) => api.gitlabMrReview(repo, number, action === "approve" ? "approve" : "comment", body),
      reply: (thread, body) => api.gitlabMrReply(repo, number, thread, body),
      resolve: (thread, resolved) => api.gitlabMrResolve(repo, number, thread, resolved),
      canRequestChanges: false,
      profiles: false,
    };
  }
  return {
    forge,
    kind: "PR",
    host: "GitHub",
    detail: () => api.githubPrDetail(repo, number),
    conversation: () => api.githubPrConversation(repo, number),
    files: () => api.githubPrFiles(repo, number),
    review: (action, body) => api.githubPrReview(repo, number, action, body),
    reply: (thread, body) => api.githubPrReply(repo, number, Number(thread), body),
    canRequestChanges: true,
    profiles: true,
  };
}
