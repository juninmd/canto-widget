import { parseQuickTask, takePriority } from "./quickAdd";

/** A language-neutral clock time the quick-add parser always reads ("18:00" standing alone). */
export const TIME_TOKEN = "9:00";

export type TokenEdit = { value: string; start: number; end: number };

function append(base: string, token: string): TokenEdit {
  const head = base.trimEnd();
  const value = head ? `${head} ${token}` : token;
  return { value, start: value.length - token.length, end: value.length };
}

/** Appends a "!priority" token, swapping one already typed so the line never carries two. */
export function insertPriority(value: string, token: string): TokenEdit {
  const { rest, priority } = takePriority(value);
  return append(priority ? rest : value, token);
}

/** Appends a time to edit; null when the line already has one, because the parser only reads the first. */
export function insertTime(value: string): TokenEdit | null {
  if (parseQuickTask(value).time) return null;
  return append(value, TIME_TOKEN);
}
