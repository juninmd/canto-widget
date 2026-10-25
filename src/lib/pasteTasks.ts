/** Most lines one paste turns into tasks; past this it is a document, not a list. */
export const PASTE_TASK_LIMIT = 50;
// Markdown, checklist and numbered-list markers: "- ", "* [ ] ", "1. ", "2) ", "• ", "☐ ".
const MARKER = /^\s*(?:[-*+•–]\s+)?(?:\[[ xX]?\]\s+|[☐☑✓✔]\s*)?(?:\d{1,3}[.)]\s+)?/u;

/** Splits a multi-line paste into task lines; null when it holds a single line, so the field takes it as is. */
export function splitPastedTasks(text: string): string[] | null {
  const lines = text
    .split(/\r?\n|\r/)
    .map((line) => line.replace(MARKER, "").replace(/\s+/g, " ").trim())
    .filter(Boolean);
  return lines.length < 2 ? null : lines.slice(0, PASTE_TASK_LIMIT);
}
