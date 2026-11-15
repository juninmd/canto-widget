import { useCallback, useEffect, useState } from "react";
import { api, errText, type AgendaItem } from "../../lib/api";
import { useLatestRequest } from "../../lib/useLatestRequest";
import { windowOf } from "./agendaDay";
import { REFOCUS_MIN_MS, type Agenda } from "./useAgenda";
import { useRefocus } from "./useRefocus";

/** Today comes from App's shared poll (it also rings the meeting alerts); any other day is fetched on demand. */
export function useDayAgenda(day: string, today: string, live: Agenda): Agenda {
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const { bump, isLatest } = useLatestRequest();
  const other = day !== today;

  const load = useCallback(async () => {
    const id = bump();
    setLoading(true);
    try {
      const { timeMin, timeMax } = windowOf(day);
      const next = await api.agendaToday(timeMin, timeMax);
      if (!isLatest(id)) return;
      setItems(next);
      setFetchedAt(Date.now());
      setError("");
    } catch (e) {
      // The items already on screen stay: a failed refresh is a banner, not an empty day.
      if (isLatest(id)) setError(errText(e));
    } finally {
      if (isLatest(id)) setLoading(false);
    }
  }, [day, bump, isLatest]);

  useEffect(() => {
    if (!other) {
      bump();
      setLoading(false);
      return;
    }
    setItems([]);
    setFetchedAt(null);
    setError("");
    void load();
  }, [other, load, bump]);

  useRefocus(() => {
    if (Date.now() - (fetchedAt ?? 0) >= REFOCUS_MIN_MS) void load();
  }, other);

  return other ? { items, loading, error, fetchedAt, reload: load } : live;
}
