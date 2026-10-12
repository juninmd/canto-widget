import { useEffect, useState } from "react";
import { api, errText, type Task } from "./api";

/** Tasks with a time on `day`; a failure stays here as text so the tab can show it inline with a retry. */
export function useDayTasks(day: string, enabled: boolean, version: number, nonce: number) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!enabled) return;
    let live = true;
    api
      .tasksForDay(day)
      .then((list) => {
        if (!live) return;
        setTasks(list ?? []);
        setError("");
      })
      .catch((e) => live && setError(errText(e)));
    return () => {
      live = false;
    };
  }, [enabled, day, version, nonce]);
  return { tasks, error };
}
