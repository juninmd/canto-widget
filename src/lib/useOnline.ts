import { useEffect, useRef, useState } from "react";

const isOnline = () => typeof navigator === "undefined" || navigator.onLine !== false;

/** Follows the browser's connectivity flag; it can only say "no network", not "the API is up". */
export function useOnline(): boolean {
  const [online, setOnline] = useState(isOnline);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}

/** Runs `run` each time the connection comes back, never on mount. */
export function useOnReconnect(online: boolean, run: () => void): void {
  const was = useRef(online);
  const latest = useRef(run);
  latest.current = run;
  useEffect(() => {
    if (online && !was.current) latest.current();
    was.current = online;
  }, [online]);
}
