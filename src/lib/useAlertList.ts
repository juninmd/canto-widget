import { useCallback, useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { api, type AgendaItem } from "./api";
import { sortAlerts } from "./alerts";

/** The alerts Rust is holding, worst first. Reloads when a new one rings and when the widget is looked at again. */
export function useAlertList(active: boolean) {
  const [alerts, setAlerts] = useState<AgendaItem[]>([]);

  useEffect(() => {
    if (!active) {
      setAlerts([]);
      return;
    }
    const load = () => void api.alertPayload().then((list) => setAlerts(sortAlerts(list ?? [])), () => {});
    load();
    const stop = listen("canto://alert", load);
    window.addEventListener("focus", load);
    return () => {
      void stop.then((f) => f());
      window.removeEventListener("focus", load);
    };
  }, [active]);

  const drop = useCallback((id: string) => setAlerts((list) => list.filter((e) => e.id !== id)), []);
  return { alerts, drop };
}
