import type { Note } from "./api";

export type TagCount = { tag: string; count: number };
/** `complete` is false when the list held only a page of the notes, so the counts would understate. */
export type TagCensus = { tags: TagCount[]; total: number; complete: boolean };

/** Most used first, then alphabetical, so the chip row stays stable between reloads. */
export function tagCounts(notes: Note[]): TagCount[] {
  const counts = new Map<string, number>();
  for (const note of notes) for (const tag of new Set(note.tags)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  return [...counts].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function censusOf(notes: Note[], total: number): TagCensus {
  return { tags: tagCounts(notes), total, complete: notes.length >= total };
}

/** The tag a `#tag` search is narrowed to, or null for free text. */
export function activeTag(query: string): string | null {
  const q = query.trim();
  return q.startsWith("#") && q.length > 1 ? q.slice(1).toLowerCase() : null;
}
