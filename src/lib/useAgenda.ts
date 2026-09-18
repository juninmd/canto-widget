import { useCallback, useEffect, useRef, useState } from "react";
import { api, errText, type AgendaItem } from "./api";
import { dayWindow, shouldAlert } from "./agenda";

const RELOAD_MS = 5 * 60_000;
const WATCH_MS = 30_000;

export type Agenda = {
  items: AgendaItem[];
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
};

/**
 * Lives in App, never in the tab: the meeting alert needs to fire with the user
 * on tasks, on notes, or with the widget hidden in the tray. While this
 * lived inside AgendaTab, leaving the tab turned off the clock and cleared the
 * list of those already alerted — no pop-up, or the same pop-up twice.
 */
export function useAgenda(active: boolean): Agenda {
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const alerted = useRef(new Set<string>());

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const { timeMin, timeMax } = dayWindow();
      setItems(await api.agendaToday(timeMin, timeMax));
      setError("");
    } catch (e) {
      // Stays in the tab: without a Google account, the 5-minute polling can't
      // take over the widget's global error strip.
      setError(errText(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!active) {
      setItems([]);
      setError("");
      alerted.current.clear();
      return;
    }
    void reload();
    const t = setInterval(() => void reload(), RELOAD_MS);
    return () => clearInterval(t);
  }, [active, reload]);

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => {
      for (const event of shouldAlert(items, alerted.current)) {
        alerted.current.add(event.id);
        void api.alertOpen(event).catch(() => {});
      }
    }, WATCH_MS);
    return () => clearInterval(t);
  }, [active, items]);

  return { items, loading, error, reload };
}
