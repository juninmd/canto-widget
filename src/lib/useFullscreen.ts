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

  const toggle = useCallback(async () => {
    const win = getCurrentWindow();
    const next = !(await win.isFullscreen());
    await win.setFullscreen(next);
    setActive(next);
  }, []);

  return { active, toggle };
}
