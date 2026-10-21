import { useCallback, useState } from "react";
import type { Tab } from "../components/TabBar";
import { mirrorPref } from "./prefsMirror";

export type TabLayout = "horizontal" | "vertical";

const LAYOUT_KEY = "canto.tabLayout";
const PINNED_KEY = "canto.railPinned";

/** Which heading a tab sits under in the vertical bar; Ajustes has none and stays at the bottom. */
export type TabGroup = "day" | "code" | "explore";

export const TAB_GROUP: Partial<Record<Tab, TabGroup>> = {
  tasks: "day", notes: "day", clipboard: "day", agenda: "day",
  github: "code", gitlab: "code", status: "code", agents: "code",
  models: "explore", activity: "explore", gmail: "day", gdrive: "day", contacts: "day", weather: "explore", market: "explore", steam: "explore", reads: "explore",
};

/** Anything but a saved "vertical" is horizontal: the bar people already know. */
export function parseLayout(raw: string | null): TabLayout {
  return raw === "vertical" ? "vertical" : "horizontal";
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
    mirrorPref(key, value);
  } catch {
    // Private mode or a full disk: the choice lasts until the window closes.
  }
}

export function useTabLayout() {
  const [layout, setLayoutState] = useState<TabLayout>(() => parseLayout(read(LAYOUT_KEY)));
  const [pinned, setPinnedState] = useState(() => read(PINNED_KEY) === "1");
  const setLayout = useCallback((next: TabLayout) => {
    setLayoutState(next);
    write(LAYOUT_KEY, next);
  }, []);
  const setPinned = useCallback((next: boolean) => {
    setPinnedState(next);
    write(PINNED_KEY, next ? "1" : "0");
  }, []);
  return { layout, setLayout, pinned, setPinned } as const;
}
