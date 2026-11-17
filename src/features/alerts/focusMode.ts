import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { api, type FocusHeld } from "../../lib/api";
import { t } from "../../i18n";

/** Minutes east of UTC at this moment (`Date` counts them west). */
export const localOffsetMin = (d = new Date()) => -d.getTimezoneOffset();

export function minutesToTime(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

/** "HH:MM" of a time input; null for an empty or malformed value. */
export function timeToMinutes(value: string): number | null {
  const m = /^(\d{2}):(\d{2})$/.exec(value);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  return h < 24 && min < 60 ? h * 60 + min : null;
}

const SHOWN = 3;

/** One line for the toast: how many alerts were held back and the first few titles. */
export function summaryText(held: readonly FocusHeld[]): string {
  const titles = held.slice(0, SHOWN).map((h) => h.title);
  const rest = held.length - titles.length;
  return t("focus.summary", { n: held.length, titles: titles.join(", ") + (rest > 0 ? ` +${rest}` : "") });
}

/**
 * Keeps Rust's idea of the timezone current and shows the summary when the silence ends: by the event while the
 * window is awake, by asking at start for what was held back while it slept.
 */
export function useFocusSummary(active: boolean, notify: (message: string) => void) {
  useEffect(() => {
    if (!active) return;
    const show = (held: readonly FocusHeld[]) => held.length > 0 && notify(summaryText(held));
    void api.focusOffset(localOffsetMin()).catch(() => {});
    void api.focusSummary().then((h) => show(h ?? []), () => {});
    const stop = listen<FocusHeld[]>("canto://focus-summary", (e) => show(e.payload ?? []));
    return () => {
      void stop.then((f) => f());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}
