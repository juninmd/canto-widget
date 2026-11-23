import type { ForgeItem, ForgeLists } from "../../lib/api";
import { checkKey, type CiMap, type ConflictMap } from "./forgeChecks";
import { overdue, oldestFirst, waitHours } from "./reviewRadar";

export type NextAction = { item: ForgeItem; reason: "mine" | "review"; hours: number };

/** Where to start: one of my PRs that cannot move on (CI failed or conflict), else the oldest review request past the SLA. */
export function nextAction(lists: ForgeLists, ci: CiMap = {}, conflicts: ConflictMap = {}, now = new Date()): NextAction | null {
  const stuck = lists.my_prs.items.find((it) => {
    const key = checkKey(it.repo, it.number);
    return it.is_pr && !it.draft && (ci[key] === "failure" || it.conflict === true || conflicts[key] === true);
  });
  if (stuck) return { item: stuck, reason: "mine", hours: 0 };
  const late = oldestFirst(lists.review_requested.items).find((it) => it.is_pr && !it.draft && overdue(waitHours(it, now)));
  return late ? { item: late, reason: "review", hours: waitHours(late, now) } : null;
}
