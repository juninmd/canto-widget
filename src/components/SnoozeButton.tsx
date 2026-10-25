import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { loadSnooze, saveSnooze, SNOOZE_OPTIONS } from "../lib/snooze";
import { t } from "../i18n";

/** "adiar N min" with a chevron on its right to pick 1, 5 or 10; picking snoozes at once and becomes the main value.
 *  The menu opens on the current choice, arrows rove, and Esc hands focus back to the chevron. */
export default function SnoozeButton({ onSnooze }: { onSnooze: (minutes: number) => void }) {
  const [minutes, setMinutes] = useState(loadSnooze);
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const items = () => [...(menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];

  useEffect(() => {
    if (!open) return;
    const list = items();
    (list[SNOOZE_OPTIONS.indexOf(minutes)] ?? list[0])?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- focus only when the menu opens
  }, [open]);

  const pick = (m: number) => {
    saveSnooze(m);
    setMinutes(m);
    setOpen(false);
    onSnooze(m);
  };
  // Esc closes the menu first; the overlay's own Esc (dismiss the alert) only gets it with the menu shut.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!open) return;
    if (e.key === "Escape") {
      e.stopPropagation();
      setOpen(false);
      trigger.current?.focus();
      return;
    }
    // Tab moves on naturally; the menu must not stay open behind the focus.
    if (e.key === "Tab") {
      setOpen(false);
      return;
    }
    const list = items();
    const at = list.indexOf(document.activeElement as HTMLElement);
    const up = at < 0 ? list.length - 1 : (at - 1 + list.length) % list.length;
    const to = { ArrowDown: (at + 1) % list.length, ArrowUp: up, Home: 0, End: list.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    list[to]?.focus();
  };

  return (
    <div className="relative flex" onKeyDown={onKeyDown} onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}>
      <button
        type="button"
        onClick={() => onSnooze(minutes)}
        aria-label={t("alert.snooze", { minutes })}
        className="h-8 whitespace-nowrap rounded-l-lg bg-edge px-2.5 text-[13px] text-fg hover:brightness-125"
      >
        {t("alert.snoozeShort", { minutes })}
      </button>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("alert.snoozeMore")}
        className="h-8 rounded-r-lg border-l border-panel bg-edge px-2 text-xs text-muted hover:brightness-125"
      >
        <span aria-hidden="true">▾</span>
      </button>
      {open && (
        <div ref={menu} role="menu" className="absolute bottom-full right-0 z-10 mb-1 flex flex-col overflow-hidden rounded-lg border border-line bg-panel shadow-lg">
          {SNOOZE_OPTIONS.map((m) => (
            <button
              key={m}
              type="button"
              role="menuitem"
              tabIndex={-1}
              onClick={() => pick(m)}
              aria-label={t("alert.snooze", { minutes: m })}
              className={`px-4 py-2 text-left text-sm hover:bg-edge ${m === minutes ? "font-semibold text-accent-text" : "text-fg"}`}
            >
              {t("alert.snoozeOption", { minutes: m })}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
