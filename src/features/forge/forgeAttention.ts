import type { ForgeItem, ForgeLists, ForgeSection } from "../../lib/api";
import { checkKey, type CiMap, type ConflictMap, type ReviewMap } from "./forgeChecks";
import { overdue, waitHours } from "./reviewRadar";

export type Signals = { ci?: CiMap; conflicts?: ConflictMap; reviews?: ReviewMap };

/** Sections where something can be waiting on me: a review I owe, a PR someone else opened in my repository, or a PR of mine that is stuck. */
export const ATTENTION_SECTIONS: ForgeSection[] = ["review_requested", "others_prs", "my_prs"];

/**
 * A review request past the SLA, a PR someone else opened in my repository, or one of my PRs that cannot move on its
 * own: CI failed, it conflicts with the base or a reviewer asked for changes. Drafts are mine to finish, so they never
 * ask for attention.
 */
export function needsAttention(section: ForgeSection, item: ForgeItem, now: Date, s: Signals = {}): boolean {
  if (!item.is_pr || item.draft) return false;
  const key = checkKey(item.repo, item.number);
  if (section === "review_requested") return overdue(waitHours(item, now));
  // Someone else is waiting for me to look at it; no SLA of its own, it asks from the first reading.
  if (section === "others_prs") return true;
  if (section !== "my_prs") return false;
  return s.ci?.[key] === "failure" || item.conflict === true || s.conflicts?.[key] === true || s.reviews?.[key]?.changes === true;
}

export function attentionCount(lists: ForgeLists, now: Date, s: Signals = {}): number {
  return ATTENTION_SECTIONS.reduce((n, key) => n + lists[key].items.filter((it) => needsAttention(key, it, now, s)).length, 0);
}
