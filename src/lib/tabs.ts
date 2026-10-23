import { useCallback, useEffect, useState } from "react";
import { TABS, type Tab } from "../components/TabBar";
import { IS_MOBILE } from "./platform";
import { PREFS_RESTORED, mirrorPref } from "./prefsMirror";

const KEY = "canto.hiddenTabs";
const KNOWN_KEY = "canto.knownTabs";

/** Needs the desktop's focused-app probe, which a phone has no counterpart for. */
export const DESKTOP_ONLY_TABS: readonly Tab[] = ["activity"];

const offered = TABS.filter((t) => !IS_MOBILE || !DESKTOP_ONLY_TABS.includes(t.id));

/** Ajustes can't be hidden: it's the only way back to the other tabs. */
export const HIDEABLE = offered.filter((t) => t.id !== "settings");

/** Eighteen tabs don't fit the default width; GitLab, Status API, Atividade, Steam, Agentes, Clima, Mercado, Leituras, Gmail, Drive and Contatos start hidden, one checkbox away in Ajustes. */
const DEFAULT_HIDDEN: Tab[] = ["gitlab", "status", "activity", "steam", "agents", "weather", "market", "reads", "gmail", "gdrive", "contacts"];

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
const ADDED_LATER: Tab[] = ["steam", "agents", "weather", "market", "reads", "gmail", "gdrive", "contacts"];

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

/** The known list is written only next to a saved hidden list: on its own it would mark tabs as seen by a choice that isn't there. */
function save(hidden: Tab[]) {
  const known = JSON.stringify(HIDEABLE.map((t) => t.id));
  for (const [key, value] of [[KNOWN_KEY, known], [KEY, JSON.stringify(hidden)]]) {
    localStorage.setItem(key, value);
    mirrorPref(key, value);
  }
}

function load(): Tab[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return DEFAULT_HIDDEN;
    const hidden = hideNewTabs(parseHidden(raw), localStorage.getItem(KNOWN_KEY));
    save(hidden);
    return hidden;
  } catch {
    return DEFAULT_HIDDEN;
  }
}

export function visibleTabs(hidden: readonly Tab[]) {
  return offered.filter((t) => !hidden.includes(t.id));
}

export function useHiddenTabs() {
  const [hidden, setHidden] = useState<Tab[]>(load);
  useEffect(() => {
    const reload = () => setHidden(load());
    window.addEventListener(PREFS_RESTORED, reload);
    return () => window.removeEventListener(PREFS_RESTORED, reload);
  }, []);
  const change = useCallback((next: Tab[]) => {
    const clean = parseHidden(JSON.stringify(next));
    setHidden(clean);
    try {
      save(clean);
    } catch {
      // Private mode or a full disk: the choice lasts until the window closes.
    }
  }, []);
  return [hidden, change] as const;
}
