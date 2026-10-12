import { useEffect, useState } from "react";

const isVisible = () => typeof document === "undefined" || !document.hidden;

/** False while the window is hidden, so polls can pause instead of waking a widget nobody is looking at. */
export function useWindowVisible(): boolean {
  const [visible, setVisible] = useState(isVisible);
  useEffect(() => {
    const on = () => setVisible(isVisible());
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);
  return visible;
}
