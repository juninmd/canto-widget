import { useEffect, useState } from "react";
import { emit, listen } from "@tauri-apps/api/event";
import { api, type AgendaItem } from "./lib/api";
import Alert from "./components/Alert";
import { OPEN_TAB_EVENT, TASKS_CHANGED_EVENT } from "./lib/alertEvents";

/** The pop-up's own window: it rings over a minimized or locked widget and never touches the vault window. */
export default function AlertWindow() {
  const [alerts, setAlerts] = useState<AgendaItem[]>([]);

  useEffect(() => {
    // Two rings close together: only the newest read may land, and a failed one keeps what is on screen.
    let seq = 0;
    const load = () => {
      const mine = ++seq;
      void api.alertPayload().then(
        (list) => {
          if (mine === seq) setAlerts(list);
        },
        () => {},
      );
    };
    load();
    const stop = listen("canto://alert", load);
    return () => {
      void stop.then((f) => f());
    };
  }, []);

  // An empty overlay is still a transparent window on top of the corner: it must not stay up eating clicks.
  useEffect(() => {
    if (alerts.length > 0) return;
    void api.alertSettle().then((left) => {
      if (left?.length) setAlerts(left);
    }, () => {});
  }, [alerts.length]);

  return (
    <div className="relative h-screen">
      <Alert
        events={alerts}
        onDismiss={(id) => setAlerts((list) => list.filter((e) => e.id !== id))}
        onCompleted={() => void emit(TASKS_CHANGED_EVENT)}
        onOpenModels={() => {
          void emit(OPEN_TAB_EVENT, "models");
          void api.mainShow();
        }}
        onOpenNotes={() => {
          void emit(OPEN_TAB_EVENT, "notes");
          void api.mainShow();
        }}
      />
    </div>
  );
}
