import { stripImageRefs } from "./noteImages";

const BEFORE = 40;
const AFTER = 120;

/** Markdown markers at a line start (headings, quotes, list bullets, checkboxes) read as noise in a one-line excerpt. */
const LINE_MARKERS = /^[ \t]*(?:#{1,6}[ \t]+|>[ \t]?|[-*+][ \t]+(?:\[[ xX]\][ \t]+)?|\d+[.)][ \t]+)/gm;

/** One line of plain text; a dot between lines keeps a heading from running into the list under it. */
function plain(body: string): string {
  return stripImageRefs(body)
    .replace(LINE_MARKERS, "")
    .replace(/[*_`~]+/g, "")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join(" · ");
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * The stretch of a note's body around the first match of `query`, for a search result whose match sits past
 * what the card's preview shows (its first `visible` characters). Null when there is nothing to add: no query,
 * a `#tag` filter, no match in the body, or a match the preview already shows.
 */
export function matchSnippet(body: string, query: string, visible: number): string | null {
  const term = query.trim();
  if (!term || term.startsWith("#")) return null;
  const text = plain(body);
  // Same case-insensitive match as the <mark> highlight, so the excerpt always carries a highlighted term.
  const found = new RegExp(escapeRegExp(term), "i").exec(text);
  if (!found) return null;
  const at = found.index;
  const len = found[0].length;
  if (at + len <= visible) return null;
  let start = Math.max(0, at - BEFORE);
  let end = Math.min(text.length, at + len + AFTER);
  // Cut on spaces so the excerpt never opens or closes mid-word.
  if (start > 0) {
    const space = text.indexOf(" ", start);
    if (space >= 0 && space < at) start = space + 1;
  }
  if (end < text.length) {
    const space = text.lastIndexOf(" ", end);
    if (space > at + len) end = space;
  }
  // A cut right at a line break would leave a stray separator next to the ellipsis.
  const excerpt = text.slice(start, end).replace(/^· /, "").replace(/ ·$/, "");
  return `${start > 0 ? "…" : ""}${excerpt}${end < text.length ? "…" : ""}`;
}
