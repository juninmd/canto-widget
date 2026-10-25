import { foldRanges } from "./fold";

/** A match this close to the top already shows in the card's first lines. */
const LEAD = 160;
/** Context kept before the match when its line is too long to start from. */
const CONTEXT = 40;

/**
 * Where a card's preview should start so a body match deep in the note shows up (and gets highlighted):
 * the start of the text when the first match is near the top, else the start of the matched line, or a word
 * boundary shortly before the match on a long line. Accent- and case-insensitive like the search ("acao" finds
 * "ação"); offsets come from `foldRanges`, so they point into the original text even when folding changes length
 * (NFD marks, "ß"…). A `#tag` or empty query keeps the start.
 */
export function snippetStart(text: string, query: string): number {
  const term = query.trim();
  if (!term || term.startsWith("#")) return 0;
  const first = foldRanges(text, term)[0];
  if (!first || first[0] < LEAD) return 0;
  const at = first[0];
  const line = text.lastIndexOf("\n", at - 1) + 1;
  if (at - line <= LEAD) return line;
  const space = text.lastIndexOf(" ", at - CONTEXT);
  if (space > line) return space + 1;
  // No space to cut at: never start inside a surrogate pair or on a combining mark.
  let cut = at - CONTEXT;
  while (cut < at && /[\u0300-\u036f\udc00-\udfff]/.test(text[cut] ?? "")) cut++;
  return cut;
}

/** `text` cut to start at `snippetStart`, with "… " marking the cut. */
export function noteSnippet(text: string, query: string): string {
  const start = snippetStart(text, query);
  return start === 0 ? text : `… ${text.slice(start)}`;
}
