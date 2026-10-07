import { useCallback, useEffect, useState } from "react";
import { api, errText, type AgendaItem } from "./api";
import { windowOf } from "./agendaDay";
import type { Agenda } from "./useAgenda";

/** Today comes from App's shared poll (it also rings the meeting alerts); any other day is fetched on demand. */
export function useDayAgenda(day: string, today: string, live: Agenda): Agenda {
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const other = day !== today;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { timeMin, timeMax } = windowOf(day);
      setItems(await api.agendaToday(timeMin, timeMax));
      setError("");
    } catch (e) {
      setItems([]);
      setError(errText(e));
    } finally {
      setLoading(false);
    }
  }, [day]);

  useEffect(() => {
    if (!other) return;
    setItems([]);
    void load();
  }, [other, load]);

  return other ? { items, loading, error, reload: load } : live;
}
