import { api, type AgendaItem } from "./api";
import { dayStart, daySummary } from "./summary";

/** Same text as the "resumo do dia" panel; forges and Gemini are best-effort, as they are there. */
export async function copyDaySummary(day: string, agenda: AgendaItem[]): Promise<void> {
  const start = dayStart(day);
  const [tasks, opened, docs] = await Promise.all([
    api.tasksForDay(day),
    api.forgesOpenedSince(start).catch(() => null),
    api
      .geminiDocs(new Date(start).toISOString(), new Date(start + 24 * 60 * 60 * 1000).toISOString())
      .catch(() => []),
  ]);
  await navigator.clipboard.writeText(daySummary(
      day,
      tasks,
      agenda,
      { opened: opened?.items, merged: opened?.merged, reviewed: opened?.reviewed },
      docs ?? [],
    ));
}
