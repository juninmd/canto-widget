import type { ReactNode } from "react";

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Wraps every case-insensitive occurrence of `query` in <mark>. A `#tag` or empty query is left unhighlighted. */
export function highlight(text: string, query: string): ReactNode {
  const term = query.trim();
  if (!term || term.startsWith("#")) return text;
  const parts = text.split(new RegExp(`(${escapeRegExp(term)})`, "ig"));
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="rounded bg-accent/30 text-fg">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
