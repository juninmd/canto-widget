import { useCallback, useEffect, useState } from "react";
import { errText } from "../../lib/api";

export type Loaded<T> = { data: T | null; error: string; reload: () => void };

/** Runs `load` once `enabled` turns on (a tab opening) and again on `reload()`; a stale answer is dropped. */
export function usePrLoad<T>(load: () => Promise<T>, enabled: boolean, key: string): Loaded<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [round, setRound] = useState(0);
  useEffect(() => {
    setData(null);
    setError("");
  }, [key]);
  // `load` is rebuilt every render; the key and the round are what decide a new read.
  useEffect(() => {
    if (!enabled) return;
    let live = true;
    load().then(
      (d) => live && (setData(d), setError("")),
      (e) => live && setError(errText(e)),
    );
    return () => {
      live = false;
    };
  }, [enabled, key, round]);
  const reload = useCallback(() => setRound((n) => n + 1), []);
  return { data, error, reload };
}
