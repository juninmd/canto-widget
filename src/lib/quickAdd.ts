export type QuickTask = { title: string; time: string | null };

// "14h" alone stays in the title: "Estudar 2h" is a duration, not a reminder.
const TIME = /(^|\s)(?:(?:[àa]s)\s+(\d{1,2})(?:h|:)(\d{2})?|(\d{1,2}):(\d{2}))(?=\s|$)/i;

export function parseQuickTask(input: string): QuickTask {
  const m = TIME.exec(input);
  if (!m) return { title: input.trim(), time: null };
  const hour = Number(m[2] ?? m[4]);
  const minute = Number(m[3] ?? m[5] ?? 0);
  if (hour > 23 || minute > 59) return { title: input.trim(), time: null };
  const title = (input.slice(0, m.index) + m[1] + input.slice(m.index + m[0].length)).replace(/\s+/g, " ").trim();
  if (!title) return { title: input.trim(), time: null };
  const pad = (n: number) => String(n).padStart(2, "0");
  return { title, time: `${pad(hour)}:${pad(minute)}` };
}
