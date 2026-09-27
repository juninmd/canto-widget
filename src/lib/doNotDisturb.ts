import { useCallback, useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { api, errText, type DndState } from "./api";
import { LOCALE } from "../i18n";

export const DND_CHOICES = ["30m", "1h", "2h", "tomorrow", "off"] as const;
export type DndChoice = (typeof DND_CHOICES)[number];

/** "Until tomorrow" ends when the next workday usually starts, in the user's local time. */
export const TOMORROW_HOUR = 8;
const OFF: DndState = { active: false, untilMs: null };
const MINUTES: Partial<Record<DndChoice, number>> = { "30m": 30, "1h": 60, "2h": 120 };

/** Epoch ms of the end, or null for "until turned off"; computed here because Rust can't trust the timezone. */
export function dndUntil(choice: DndChoice, now = new Date()): number | null {
  if (choice === "off") return null;
  if (choice === "tomorrow") {
    const end = new Date(now);
    end.setDate(end.getDate() + 1);
    end.setHours(TOMORROW_HOUR, 0, 0, 0);
    return end.getTime();
  }
  return now.getTime() + (MINUTES[choice] ?? 0) * 60_000;
}

/** The end as the user reads it: the time today, or weekday plus time on another day. */
export function dndEndLabel(untilMs: number, now = new Date()): string {
  const end = new Date(untilMs);
  const time = end.toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" });
  if (end.toDateString() === now.toDateString()) return time;
  return `${end.toLocaleDateString(LOCALE, { weekday: "short" })} ${time}`;
}

/** Rust is the source of truth; every change (Settings, tray, expiry) arrives as `canto://dnd`. */
export function useDoNotDisturb(onError?: (m: string) => void) {
  const [state, setState] = useState<DndState>(OFF);

  useEffect(() => {
    void api.dndGet().then((s) => setState(s ?? OFF)).catch(() => {});
    const stop = listen<DndState>("canto://dnd", (e) => setState(e.payload ?? OFF));
    return () => {
      void stop.then((f) => f());
    };
  }, []);

  // Rust's own check runs every 15 s; this hides the indicator right on time.
  useEffect(() => {
    if (!state.active || state.untilMs === null) return;
    const id = setTimeout(() => setState(OFF), Math.max(0, state.untilMs - Date.now()));
    return () => clearTimeout(id);
  }, [state]);

  const run = useCallback(
    async (call: Promise<DndState>) => {
      try {
        setState((await call) ?? OFF);
      } catch (e) {
        onError?.(errText(e));
      }
    },
    [onError],
  );
  const start = useCallback((choice: DndChoice) => run(api.dndSet(dndUntil(choice))), [run]);
  const stop = useCallback(() => run(api.dndClear()), [run]);
  return { state, start, stop };
}
