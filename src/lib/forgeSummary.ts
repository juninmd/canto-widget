import type { ForgeLists } from "./api";
import { checkKey, type CiMap } from "./forgeChecks";

export type ForgeSummary = { reviews: number; mine: number; issues: number; failing: number | null };

/** Headline counts above the sections; `failing` is null where CI badges don't exist (GitLab). */
export function summarize(lists: ForgeLists, ci?: CiMap): ForgeSummary {
  const failing = ci ? lists.my_prs.items.filter((it) => ci[checkKey(it.repo, it.number)] === "failure").length : null;
  return { reviews: lists.review_requested.total, mine: lists.my_prs.total, issues: lists.my_issues.total, failing };
}
