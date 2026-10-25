/** Mirrors `text_fold::fold` in Rust: lowercase, no accents, so "acao" finds "Ação" and "reuniao" finds "reunião". */
export function fold(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

/** `needle` must already be folded: callers fold the query once, not once per item. */
export function foldIncludes(haystack: string, needle: string): boolean {
  return fold(haystack).includes(needle);
}

/**
 * Every place `query` occurs in `text` ignoring accents and case, as [start, end) offsets into the ORIGINAL text,
 * so the highlight wraps "Reunião" whole when the query was "reuniao".
 */
export function foldRanges(text: string, query: string): Array<[number, number]> {
  const needle = fold(query);
  if (!needle) return [];
  // folded[i] came from text[origin[i]]; one character can fold into several (or none).
  let folded = "";
  const origin: number[] = [];
  for (let i = 0; i < text.length; ) {
    const cp = text.codePointAt(i) ?? 0;
    const width = cp > 0xffff ? 2 : 1;
    const f = fold(text.slice(i, i + width));
    folded += f;
    for (let k = 0; k < f.length; k++) origin.push(i);
    i += width;
  }
  origin.push(text.length);
  const ranges: Array<[number, number]> = [];
  for (let at = folded.indexOf(needle); at !== -1; at = folded.indexOf(needle, at + needle.length)) {
    const start = origin[at] ?? text.length;
    const lastFrom = origin[at + needle.length - 1] ?? text.length;
    // The match ends after the whole original character its last folded letter came from (and its trailing marks).
    let end = lastFrom + ((text.codePointAt(lastFrom) ?? 0) > 0xffff ? 2 : 1);
    while (end < text.length && /\p{M}/u.test(text[end] ?? "")) end++;
    ranges.push([start, end]);
  }
  return ranges;
}
