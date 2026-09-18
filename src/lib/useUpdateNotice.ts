import { useEffect, useRef } from "react";
import { api } from "./api";
import type { Toast } from "./toast";

const FIRST_CHECK_MS = 5_000;
const EVERY_MS = 6 * 60 * 60 * 1000;

/** Checks in the background and tells the user once per new version; Settings shows the details. */
export function useUpdateNotice(notify: (t: Toast) => void, openSettings: () => void) {
  const told = useRef<string | null>(null);
  useEffect(() => {
    async function check() {
      try {
        const info = await api.updateCheck();
        if (!info?.available || told.current === info.latest) return;
        told.current = info.latest;
        notify({ message: `Canto ${info.latest} disponível`, action: { label: "ver", run: openSettings } });
      } catch {
        // Offline or no release yet: the Settings section shows the error when the user asks.
      }
    }
    const first = setTimeout(() => void check(), FIRST_CHECK_MS);
    const every = setInterval(() => void check(), EVERY_MS);
    return () => {
      clearTimeout(first);
      clearInterval(every);
    };
  }, [notify, openSettings]);
}
