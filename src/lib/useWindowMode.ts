import { useCallback, useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import { api } from "./api";
import { useFullscreen } from "./useFullscreen";
import { MODE_EVENT, modeOf, type Mode } from "./windowMode";

const KEY = "canto.mini";

/** Mirrors Rust's flag so a boot in mini mode doesn't flash the whole UI inside a 24 px window. */
function remembered(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function remember(mini: boolean) {
  try {
    localStorage.setItem(KEY, mini ? "1" : "0");
  } catch {
    // Without storage the first frame may flash; Rust still has the truth.
  }
}

/** Rust owns mini (it moves and resizes the window); fullscreen is read from the window like before. */
export function useWindowMode() {
  const fullscreen = useFullscreen();
  const [mini, setMini] = useState(remembered);
  useEffect(() => remember(mini), [mini]);

  useEffect(() => {
    void api
      .windowConfig()
      .then((c) => setMini(c?.mini === true))
      .catch(() => {});
    // The tray flips the mode on its own.
    const stop = listen<boolean>(MODE_EVENT, (e) => setMini(e.payload === true));
    return () => {
      void stop.then((f) => f());
    };
  }, []);

  const mode = modeOf(mini, fullscreen.active);

  const setMode = useCallback(
    async (next: Mode) => {
      if (next === "hidden") return getCurrentWindow().hide();
      if (next === "mini") {
        // Rust leaves fullscreen itself before shrinking.
        await api.windowMiniSet(true);
        return setMini(true);
      }
      if (mini) {
        await api.windowMiniSet(false);
        setMini(false);
      }
      if (fullscreen.active !== (next === "max")) await fullscreen.set(next === "max");
    },
    [mini, fullscreen],
  );

  return { mode, setMode };
}
