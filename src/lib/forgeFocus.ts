import type { ForgeList, ForgeLists, ForgeSection } from "./api";
import { failingItems } from "./forgeSummary";
import type { CiMap } from "./forgeChecks";

/** A summary tile pressed as a filter: it narrows the board to one group, or to the PRs whose CI failed. */
export type SummaryFocus = "reviews" | "mine" | "failing" | "issues";

const SECTION: Record<SummaryFocus, ForgeSection> = {
  reviews: "review_requested",
  mine: "my_prs",
  failing: "my_prs",
  issues: "my_issues",
};

/** The failing tile only exists where CI badges do (`ci` given); without them a stale choice is dropped. */
export function effectiveFocus(focus: SummaryFocus | null, ci?: CiMap): SummaryFocus | null {
  return focus === "failing" && !ci ? null : focus;
}

export function focusSections<T extends { key: ForgeSection }>(sections: T[], focus: SummaryFocus | null): T[] {
  return focus ? sections.filter((s) => s.key === SECTION[focus]) : sections;
}

/** Only "failing" cuts inside a section; it drops "show more" too, since the rest was never checked. */
export function focusList(lists: ForgeLists, key: ForgeSection, focus: SummaryFocus | null, ci?: CiMap): ForgeList {
  if (focus !== "failing" || key !== "my_prs") return lists[key];
  const items = failingItems(lists, ci);
  return { ...lists[key], items, total: items.length };
}
