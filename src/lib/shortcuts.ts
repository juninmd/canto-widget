import { useEffect, useRef } from "react";
import { IS_MAC, MOD_KEY, TOGGLE_KEYS } from "./platform";
import { t } from "../i18n";
/** `index` is 1-based and counts only the visible tabs, so Alt+N matches what the bar shows. */
export type Action =
  | { type: "tab"; index: number }
  | { type: "lock" }
  | { type: "focus"; target: "search" | "new" }
  | { type: "help" }
  | { type: "fullscreen" }
  | { type: "privacy" }
  | { type: "globalSearch" };

export type Shortcut = { keys: string[]; description: string };

/** Grouped by intent; the tabs become a single line instead of one per tab. */
export const SHORTCUT_GROUPS: { title: string; items: Shortcut[] }[] = [
  {
    title: t("shortcuts.group.navigate"),
    items: [
      { keys: ["Alt", "1–9"], description: t("shortcuts.tabs") },
      { keys: ["/"], description: t("shortcuts.search") },
      { keys: [MOD_KEY, "K"], description: t("shortcuts.globalSearch") },
      { keys: ["Esc"], description: t("shortcuts.escape") },
      { keys: ["?"], description: t("shortcuts.help") },
    ],
  },
  {
    title: t("shortcuts.group.create"),
    items: [
      { keys: ["N"], description: t("shortcuts.new") },
      { keys: ["Alt", "L"], description: t("shortcuts.lock") },
      { keys: ["Alt", "P"], description: t("shortcuts.privacy") },
    ],
  },
  {
    title: t("shortcuts.group.global"),
    items: [
      { keys: TOGGLE_KEYS, description: t("shortcuts.toggle") },
      { keys: ["F11"], description: t("shortcuts.fullscreen") },
    ],
  },
];

type Key = { key: string; code: string; altKey: boolean; ctrlKey: boolean; metaKey: boolean };

/** Bare keys (N, /, ?) only count outside text fields: otherwise nobody can type "n". */
export function interpret(e: Key, typing: boolean, mac = IS_MAC): Action | null {
  // Function key doesn't produce text: it counts even with focus in a field.
  if (e.key === "F11" && !e.altKey && !e.ctrlKey && !e.metaKey) return { type: "fullscreen" };
  // Like a browser's address-bar shortcut: opens the search even while typing elsewhere.
  const mod = mac ? e.metaKey && !e.ctrlKey : e.ctrlKey && !e.metaKey;
  if (mod && !e.altKey && e.code === "KeyK") return { type: "globalSearch" };
  if (e.altKey && !e.ctrlKey && !e.metaKey) {
    const n = /^Digit([1-9])$/.exec(e.code);
    if (n) return { type: "tab", index: Number(n[1]) };
    if (e.code === "KeyL") return { type: "lock" };
    if (e.code === "KeyP") return { type: "privacy" };
    return null;
  }
  if (typing || e.ctrlKey || e.metaKey || e.altKey) return null;
  if (e.key === "?") return { type: "help" };
  if (e.key === "/") return { type: "focus", target: "search" };
  if (e.key === "n" || e.key === "N") return { type: "focus", target: "new" };
  return null;
}

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return !!el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));
}

export function useShortcuts(active: boolean, run: (a: Action) => void) {
  const ref = useRef(run);
  ref.current = run;
  useEffect(() => {
    if (!active) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const action = interpret(e, isTyping(e.target));
      if (!action) return;
      e.preventDefault();
      ref.current(action);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);
}

/** Focuses the field marked with `data-shortcut` in the panel; a button (e.g. notes' "+") is clicked. */
export function focusShortcut(target: "search" | "new"): boolean {
  const el = document.querySelector<HTMLElement>(`[role="tabpanel"] [data-shortcut="${target}"]`);
  if (!el) return false;
  if (el.tagName === "BUTTON") el.click();
  else el.focus();
  return true;
}
