import { useEffect, useId, useRef, useState } from "react";
import { t } from "../i18n";
import { MoreIcon } from "./Icons";

const ITEM = "canto-hit flex min-h-[32px] w-full items-center rounded-lg px-2.5 text-left text-[12.5px] text-fg hover:bg-hover active:bg-active";

type Props = { canClearDone: boolean; onSummary: () => void; onCarryOver: () => void; onClearDone: () => void };

/** The "⋯" menu for the day's list actions: opens on the first item, arrows rove, Esc and a pick hand focus back to the button. */
export default function TaskMenu({ canClearDone, onSummary, onCarryOver, onClearDone }: Props) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const items = () => [...(root.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];

  useEffect(() => {
    if (!open) return;
    items()[0]?.focus();
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  const pick = (action: () => void) => () => {
    close();
    action();
  };

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "Escape" || e.key === "Tab") {
      if (e.key === "Escape") e.stopPropagation();
      close();
      return;
    }
    const list = items();
    const at = list.indexOf(document.activeElement as HTMLElement);
    const to = { ArrowDown: (at + 1) % list.length, ArrowUp: (at - 1 + list.length) % list.length, Home: 0, End: list.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    list[to]?.focus();
  }

  return (
    <div ref={root} className="relative shrink-0" onKeyDown={onKeyDown}>
      <button
        ref={trigger}
        type="button"
        aria-label={t("uiTasksNotes.menu.more")}
        title={t("uiTasksNotes.menu.more")}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key !== "ArrowDown" || open) return;
          e.preventDefault();
          setOpen(true);
        }}
        className="canto-hit grid size-7 place-items-center rounded-lg text-muted hover:bg-hover hover:text-fg active:bg-active aria-expanded:bg-active aria-expanded:text-fg"
      >
        <MoreIcon />
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={t("uiTasksNotes.menu.more")}
          className="absolute right-0 top-full z-20 mt-1 min-w-[12.5rem] rounded-xl border border-edge bg-panel p-1 shadow-raised motion-safe:animate-surgir motion-reduce:animate-fade"
        >
          <button type="button" role="menuitem" title={t("tasks.summaryHint")} onClick={pick(onSummary)} className={ITEM}>
            {t("summary.heading")}
          </button>
          <button type="button" role="menuitem" title={t("tasks.carryOverHint")} onClick={pick(onCarryOver)} className={ITEM}>
            {t("tasks.carryOver")}
          </button>
          {canClearDone && (
            <>
              <hr className="mx-1 my-1 border-edge" />
              <button type="button" role="menuitem" title={t("tasks.clearDoneHint")} onClick={pick(onClearDone)} className={ITEM}>
                {t("tasks.clearDone")}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
