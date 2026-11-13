import { useCallback, useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { api } from "../lib/api";

/**
 * State read from Rust, not kept separately: the OS also exits fullscreen on its own. Rust owns the switch because
 * macOS needs its "simple" fullscreen there: the native one (a new Space) brings the title bar back on a borderless
 * window and breaks the layout.
 */
export function useFullscreen() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const win = getCurrentWindow();
    const read = () => void api.windowMaxGet().then((on) => setActive(on === true)).catch(() => {});
    read();
    const stop = win.onResized(read);
    return () => {
      void stop.then((f) => f());
    };
  }, []);

  const set = useCallback(async (next: boolean) => {
    await api.windowMaxSet(next);
    setActive(next);
  }, []);

  const toggle = useCallback(async () => set(!(await api.windowMaxGet())), [set]);

  return { active, toggle, set };
}
