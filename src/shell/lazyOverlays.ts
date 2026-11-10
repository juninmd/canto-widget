import { lazy } from "react";
import { loadMarkdown } from "../lib/markdown";

const loaders = {
  CommandPalette: () => import("./CommandPalette"),
  GlobalSearch: () => import("./GlobalSearch"),
  ShortcutsHelp: () => import("./ShortcutsHelp"),
  Onboarding: () => import("./Onboarding"),
  NotificationsPanel: () => import("../features/alerts/NotificationsPanel"),
};

// Overlays open on a shortcut or a click, never on the first paint: the startup chunk skips them.
export const CommandPalette = lazy(loaders.CommandPalette);
export const GlobalSearch = lazy(loaders.GlobalSearch);
export const ShortcutsHelp = lazy(loaders.ShortcutsHelp);
export const Onboarding = lazy(loaders.Onboarding);
export const NotificationsPanel = lazy(loaders.NotificationsPanel);

/** Fetches every overlay and the markdown parser once the window is idle, so the first Ctrl+K opens as fast as the second. */
export function preloadOverlays(): () => void {
  const run = () => void Promise.all([loadMarkdown(), ...Object.values(loaders).map((load) => load())]).catch(() => {});
  if (typeof requestIdleCallback !== "function") {
    const timer = setTimeout(run, 1500);
    return () => clearTimeout(timer);
  }
  const id = requestIdleCallback(run, { timeout: 4000 });
  return () => cancelIdleCallback(id);
}
