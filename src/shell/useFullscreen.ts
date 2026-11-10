import { useCallback, useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

/** State read from the window, not kept separately: the OS also exits fullscreen on its own. */
export function useFullscreen() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const win = getCurrentWindow();
    const read = () => void win.isFullscreen().then(setActive).catch(() => {});
    read();
    const stop = win.onResized(read);
    return () => {
      void stop.then((f) => f());
    };
  }, []);

  const set = useCallback(async (next: boolean) => {
    await getCurrentWindow().setFullscreen(next);
    setActive(next);
  }, []);

  const toggle = useCallback(async () => set(!(await getCurrentWindow().isFullscreen())), [set]);

  return { active, toggle, set };
}
