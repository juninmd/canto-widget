import { useCallback, useEffect, useState } from "react";
import { api, errText, type AgendaItem } from "./api";
import { windowOf } from "./agendaDay";
import { REFOCUS_MIN_MS, type Agenda } from "./useAgenda";
import { useRefocus } from "./useRefocus";

/** Today comes from App's shared poll (it also rings the meeting alerts); any other day is fetched on demand. */
export function useDayAgenda(day: string, today: string, live: Agenda): Agenda {
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const other = day !== today;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { timeMin, timeMax } = windowOf(day);
      setItems(await api.agendaToday(timeMin, timeMax));
      setFetchedAt(Date.now());
      setError("");
    } catch (e) {
      // The items already on screen stay: a failed refresh is a banner, not an empty day.
      setError(errText(e));
    } finally {
      setLoading(false);
    }
  }, [day]);

  useEffect(() => {
    if (!other) return;
    setItems([]);
    setFetchedAt(null);
    setError("");
    void load();
  }, [other, load]);

  useRefocus(() => {
    if (Date.now() - (fetchedAt ?? 0) >= REFOCUS_MIN_MS) void load();
  }, other);

  return other ? { items, loading, error, fetchedAt, reload: load } : live;
}
