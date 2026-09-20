import { useEffect, useRef } from "react";
import { api } from "./api";
import { reminderKey, toEvent, dueReminders } from "./reminders";

const WATCH_MS = 30_000;

/** Lives in App, like the agenda: the reminder fires on any tab or with the widget hidden. */
export function useReminders(active: boolean, day: string, leadMinutes = 0, now: () => Date = () => new Date()) {
  const notified = useRef(new Set<string>());
  const clock = useRef(now);
  clock.current = now;
  const lead = useRef(leadMinutes);
  lead.current = leadMinutes;

  useEffect(() => {
    if (!active) {
      notified.current.clear();
      return;
    }
    const check = async () => {
      const tasks = (await api.tasksReminders(day).catch(() => null)) ?? [];
      for (const t of dueReminders(tasks, notified.current, clock.current(), lead.current)) {
        notified.current.add(reminderKey(t));
        void api.alertOpen(toEvent(t)).catch(() => {});
      }
    };
    void check();
    const id = setInterval(() => void check(), WATCH_MS);
    return () => clearInterval(id);
  }, [active, day]);
}
