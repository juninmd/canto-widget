import { useCallback, useState } from "react";
import { TABS, type Tab } from "../components/TabBar";

const KEY = "canto.hiddenTabs";
const KNOWN_KEY = "canto.knownTabs";

/** Ajustes can't be hidden: it's the only way back to the other tabs. */
export const HIDEABLE = TABS.filter((t) => t.id !== "settings");

/** Ten tabs don't fit the default width; GitLab, Status API and Atividade start hidden, one checkbox away in Ajustes. */
const DEFAULT_HIDDEN: Tab[] = ["gitlab", "status", "activity"];

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

/** Shipped after people could save their hidden list; before `canto.knownTabs` existed, these were the unknown ones. */
const ADDED_LATER: Tab[] = [];

/** A tab hidden by default stays hidden for someone who saved a choice before it existed, instead of crowding their bar. */
export function hideNewTabs(hidden: Tab[], rawKnown: string | null): Tab[] {
  let known: unknown = null;
  try {
    known = rawKnown === null ? null : JSON.parse(rawKnown);
  } catch {
    known = null;
  }
  const seen = Array.isArray(known) ? known : HIDEABLE.map((t) => t.id).filter((id) => !ADDED_LATER.includes(id));
  return [...hidden, ...DEFAULT_HIDDEN.filter((id) => !seen.includes(id) && !hidden.includes(id))];
}

function load(): Tab[] {
  try {
    const raw = localStorage.getItem(KEY);
    const hidden = raw === null ? DEFAULT_HIDDEN : hideNewTabs(parseHidden(raw), localStorage.getItem(KNOWN_KEY));
    localStorage.setItem(KNOWN_KEY, JSON.stringify(HIDEABLE.map((t) => t.id)));
    if (raw !== null) localStorage.setItem(KEY, JSON.stringify(hidden));
    return hidden;
  } catch {
    return DEFAULT_HIDDEN;
  }
}

export function visibleTabs(hidden: readonly Tab[]) {
  return TABS.filter((t) => !hidden.includes(t.id));
}

export function useHiddenTabs() {
  const [hidden, setHidden] = useState<Tab[]>(load);
  const change = useCallback((next: Tab[]) => {
    const clean = parseHidden(JSON.stringify(next));
    setHidden(clean);
    localStorage.setItem(KEY, JSON.stringify(clean));
  }, []);
  return [hidden, change] as const;
}
