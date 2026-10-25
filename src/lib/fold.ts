/**
 * Mirrors `text_fold::fold` in Rust exactly, so the list the backend filters and the highlight here agree:
 * lowercase char by char, drop combining marks U+0300–U+036F, fold the accented Latin-1 / Latin Extended-A letters
 * to their base and the final sigma to σ. "acao" finds "Ação", "reuniao" finds "reunião". Both sides run the cases
 * in ./fold_cases.json.
 */
const BASE: Record<string, string> = {};
for (const [letters, to] of [
  ["àáâãäåāăą", "a"],
  ["çćĉċč", "c"],
  ["ď", "d"],
  ["èéêëēĕėęě", "e"],
  ["ĝğġģ", "g"],
  ["ĥ", "h"],
  ["ìíîïĩīĭį", "i"],
  ["ĵ", "j"],
  ["ķ", "k"],
  ["ĺļľ", "l"],
  ["ñńņň", "n"],
  ["òóôõöōŏő", "o"],
  ["ŕŗř", "r"],
  ["śŝşš", "s"],
  ["ţť", "t"],
  ["ùúûüũūŭůűų", "u"],
  ["ŵ", "w"],
  ["ýÿŷ", "y"],
  ["źżž", "z"],
  ["ς", "σ"],
] as const) {
  for (const c of letters) BASE[c] = to;
}

function isMark(c: string): boolean {
  const cp = c.codePointAt(0) ?? 0;
  return cp >= 0x300 && cp <= 0x36f;
}

export function fold(s: string): string {
  let out = "";
  for (const ch of s) {
    // Per character, like Rust's char::to_lowercase: no context-dependent final sigma.
    for (const c of ch.toLowerCase()) {
      if (isMark(c)) continue;
      out += BASE[c] ?? c;
    }
  }
  return out;
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
    const width = (text.codePointAt(i) ?? 0) > 0xffff ? 2 : 1;
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
    while (end < text.length && isMark(text[end] ?? "")) end++;
    ranges.push([start, end]);
  }
  return ranges;
}
