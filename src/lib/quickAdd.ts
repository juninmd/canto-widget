export type QuickTask = { title: string; time: string | null };
// "14h" alone stays in the title: "Estudar 2h" is a duration, not a reminder.
// Groups: 12-hour clock (2 hour, 3 minute, 4 a/p), "às 14h30" (5, 6), bare "18:00" (7, 8).
const TIME =
  /(^|\s)(?:(?:(?:[àa]s|at)\s+)?(\d{1,2})(?::(\d{2}))?\s?([ap])\.?m\.?|(?:[àa]s|at)\s+(\d{1,2})(?:h|:)(\d{2})?|(\d{1,2}):(\d{2}))(?=\s|$)/i;
export function parseQuickTask(input: string): QuickTask {
  const m = TIME.exec(input);
  if (!m) return { title: input.trim(), time: null };
  let hour = Number(m[2] ?? m[5] ?? m[7]);
  const minute = Number(m[3] ?? m[6] ?? m[8] ?? 0);
  if (m[4]) {
    if (hour < 1 || hour > 12) return { title: input.trim(), time: null };
    hour = (hour % 12) + (m[4].toLowerCase() === "p" ? 12 : 0);
  }
  if (hour > 23 || minute > 59) return { title: input.trim(), time: null };
  const title = (input.slice(0, m.index) + m[1] + input.slice(m.index + m[0].length)).replace(/\s+/g, " ").trim();
  if (!title) return { title: input.trim(), time: null };
  const pad = (n: number) => String(n).padStart(2, "0");
  return { title, time: `${pad(hour)}:${pad(minute)}` };
}
