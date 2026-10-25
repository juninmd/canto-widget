import { IMAGE_REF } from "./noteImages";

const WORDS_PER_MINUTE = 200;

// Link targets and bare URLs are not words the reader reads; keep only a link's visible text.
const LINK = /\[([^\]]*)\]\([^)]*\)/g;
const URL_RE = /\bhttps?:\/\/\S+/g;
// "1." and "[x]" are list markup, not words the note says.
const LIST_MARK = /^(\s*)(?:[-*+]\s+)?(?:\d+[.)]\s+)?(?:\[[ xX]\]\s+)?/gm;

const segmenter = typeof Intl !== "undefined" && "Segmenter" in Intl ? new Intl.Segmenter(undefined, { granularity: "word" }) : null;

/** Words in a note's Markdown body, ignoring image refs, link targets and markup; CJK counts per segment. */
export function countWords(markdown: string): number {
  const text = markdown.replace(IMAGE_REF, " ").replace(LINK, "$1").replace(URL_RE, " ").replace(LIST_MARK, "$1");
  if (!segmenter) return text.split(/[^\p{L}\p{N}]+/u).filter(Boolean).length;
  let n = 0;
  for (const s of segmenter.segment(text)) if (s.isWordLike) n++;
  return n;
}

/** Whole minutes at a relaxed reading pace; 0 means "under a minute". */
export function readingMinutes(words: number): number {
  return Math.round(words / WORDS_PER_MINUTE);
}
