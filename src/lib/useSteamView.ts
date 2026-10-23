import { useCallback, useEffect, useState } from "react";
import { errText } from "./api";
import { useRefreshEvent } from "./useRefreshEvent";

/** Fetch, refresh and error state shared by the Steam panes. `load` must keep its identity while its
 *  arguments stay the same: a new one refetches, which is how a page or a filter change reloads. */
export function useSteamView<T>(load: (force: boolean) => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const run = useCallback(
    async (force: boolean) => {
      setBusy(true);
      try {
        setData(await load(force));
        setError("");
      } catch (e) {
        setError(errText(e));
      } finally {
        setBusy(false);
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
