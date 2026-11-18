import { useState } from "react";
import type { BrowseView } from "../components/ViewSwitch";

/** The view of one tab ("list", "grid", "table"), remembered between sessions. Storage can be blocked, so it never throws. */
export function useViewPref<V extends BrowseView>(tab: string, options: readonly V[]): [V, (view: V) => void] {
  const key = `canto.view.${tab}`;
  const [view, setView] = useState<V>(() => {
    try {
      const saved = localStorage.getItem(key) as V | null;
      if (saved && options.includes(saved)) return saved;
    } catch {
      // falls back to the first option
    }
    return options[0];
  });
  return [
    view,
    (next) => {
      setView(next);
      try {
        localStorage.setItem(key, next);
      } catch {
        // the choice just lasts until the window closes
      }
    },
  ];
}
