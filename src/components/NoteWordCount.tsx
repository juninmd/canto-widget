import { useMemo } from "react";
import { LOCALE, t } from "../i18n";
import { countWords, readingMinutes } from "../lib/wordCount";

/** Quiet word count under the editor; reading time joins it once the note takes a minute or more. */
export default function NoteWordCount({ body }: { body: string }) {
  const words = useMemo(() => countWords(body), [body]);
  if (words === 0) return null;
  const label = words === 1 ? t("notes.wordsOne") : t("notes.wordsMany", { n: words.toLocaleString(LOCALE) });
  const minutes = readingMinutes(words);
  return (
    <p data-testid="note-word-count" className="-mt-1 text-right text-[11px] tabular-nums text-muted">
      {minutes > 0 ? t("notes.readMinutes", { words: label, n: minutes.toLocaleString(LOCALE) }) : label}
    </p>
  );
}
