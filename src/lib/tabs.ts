import { useCallback, useState } from "react";
import { TABS, type Tab } from "../components/TabBar";

const KEY = "canto.hiddenTabs";

/** Ajustes can't be hidden: it's the only way back to the other tabs. */
export const HIDEABLE = TABS.filter((t) => t.id !== "settings");

/** Eight tabs don't fit the default width; GitLab starts hidden and is one checkbox away in Ajustes. */
const DEFAULT_HIDDEN: Tab[] = ["gitlab"];

/** Nothing saved yet means the default; unknown ids (a tab removed in an update) and corrupt data are ignored. */
export function parseHidden(raw: string | null): Tab[] {
  if (raw === null) return DEFAULT_HIDDEN;
  try {
    const list: unknown = JSON.parse(raw);
    return Array.isArray(list) ? HIDEABLE.filter((t) => list.includes(t.id)).map((t) => t.id) : [];
  } catch {
    return [];
  }
}

export function visibleTabs(hidden: readonly Tab[]) {
  return TABS.filter((t) => !hidden.includes(t.id));
}

export function useHiddenTabs() {
  const [hidden, setHidden] = useState<Tab[]>(() => parseHidden(localStorage.getItem(KEY)));
  const change = useCallback((next: Tab[]) => {
    const clean = parseHidden(JSON.stringify(next));
    setHidden(clean);
    localStorage.setItem(KEY, JSON.stringify(clean));
  }, []);
  return [hidden, change] as const;
}
