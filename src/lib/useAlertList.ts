import { useCallback, useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { api, type AgendaItem, type ResolvedAlert } from "./api";
import { sortAlerts } from "./alerts";

/**
 * The alerts Rust is holding, worst first, and what was done with the earlier ones.
 * Reloads when a new one rings and when the widget is looked at again.
 */
export function useAlertList(active: boolean) {
  const [alerts, setAlerts] = useState<AgendaItem[]>([]);
  const [log, setLog] = useState<ResolvedAlert[]>([]);

  const refresh = useCallback(() => {
    void api.alertPayload().then((list) => setAlerts(sortAlerts(list ?? [])), () => {});
    void api.alertLog().then((list) => setLog(list ?? []), () => {});
  }, []);

  useEffect(() => {
    if (!active) {
      setAlerts([]);
      setLog([]);
      return;
    }
    refresh();
    const stop = listen("canto://alert", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      void stop.then((f) => f());
      window.removeEventListener("focus", refresh);
    };
  }, [active, refresh]);

  const drop = useCallback((id: string) => setAlerts((list) => list.filter((e) => e.id !== id)), []);
  return { alerts, log, drop, refresh };
}
