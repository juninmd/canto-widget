import type { ReactNode } from "react";
import { foldRanges } from "./fold";

/** Wraps every occurrence of `query` in <mark>, ignoring accents and case like the search does. A `#tag` or empty query is left unhighlighted. */
export function highlight(text: string, query: string): ReactNode {
  const term = query.trim();
  if (!term || term.startsWith("#")) return text;
  const ranges = foldRanges(text, term);
  if (ranges.length === 0) return text;
  const parts: ReactNode[] = [];
  let at = 0;
  for (const [start, end] of ranges) {
    if (start > at) parts.push(text.slice(at, start));
    parts.push(
      <mark key={start} className="rounded bg-accent/30 text-fg">
        {text.slice(start, end)}
      </mark>,
    );
    at = end;
  }
  if (at < text.length) parts.push(text.slice(at));
  return parts;
}
