import { useState, type KeyboardEvent } from "react";
import { loadSnooze, saveSnooze, SNOOZE_OPTIONS } from "../lib/snooze";
import { t } from "../i18n";

/** "adiar N min" with a chevron on its right to pick 1, 5 or 10; picking snoozes at once and becomes the main value. */
export default function SnoozeButton({ onSnooze }: { onSnooze: (minutes: number) => void }) {
  const [minutes, setMinutes] = useState(loadSnooze);
  const [open, setOpen] = useState(false);

  const pick = (m: number) => {
    saveSnooze(m);
    setMinutes(m);
    setOpen(false);
    onSnooze(m);
  };
  // Esc closes the menu first; the overlay's own Esc (dismiss the alert) only gets it with the menu shut.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && open) {
      e.stopPropagation();
      setOpen(false);
    }
  };

  return (
    <div className="relative flex flex-[1.2]" onKeyDown={onKeyDown} onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}>
      <button
        type="button"
        onClick={() => onSnooze(minutes)}
        aria-label={t("alert.snooze", { minutes })}
        className="flex-1 whitespace-nowrap rounded-l-lg bg-edge px-2 py-2 text-sm text-fg"
      >
        {t("alert.snoozeShort", { minutes })}
      </button>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("alert.snoozeMore")}
        className="rounded-r-lg border-l border-panel bg-edge px-2 text-xs text-muted"
      >
        <span aria-hidden="true">▾</span>
      </button>
      {open && (
        <div role="menu" className="absolute bottom-full right-0 z-10 mb-1 flex flex-col overflow-hidden rounded-lg border border-line bg-panel shadow-lg">
          {SNOOZE_OPTIONS.map((m) => (
            <button
              key={m}
              type="button"
              role="menuitem"
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
