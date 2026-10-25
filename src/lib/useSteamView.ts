import { useCallback, useEffect, useRef, useState } from "react";
import { errText } from "./api";
import { useRefreshEvent } from "./useRefreshEvent";

/** Fetch, refresh and error state shared by the Steam panes. `load` must keep its identity while its
 *  arguments stay the same: a new one refetches, which is how a page or a filter change reloads. */
export function useSteamView<T>(load: (force: boolean) => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  // Only the newest request may land: paging fast or changing the filter mid-flight must not let an
  // older, slower answer overwrite the list the person asked for last.
  const seq = useRef(0);

  const run = useCallback(
    async (force: boolean) => {
      const mine = ++seq.current;
      setBusy(true);
      try {
        const next = await load(force);
        if (mine !== seq.current) return;
        setData(next);
        setError("");
      } catch (e) {
        if (mine === seq.current) setError(errText(e));
      } finally {
        if (mine === seq.current) setBusy(false);
      }
    },
    [load],
  );

  useEffect(() => {
    void run(false);
  }, [run]);
  // The tab-level refresh (palette, back online, another store) reloads what is on screen.
  useRefreshEvent("steam", () => void run(true));

  return { data, error, busy, run };
}
