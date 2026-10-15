import { useEffect, useRef, useState } from "react";
import { t } from "../i18n";
import { MoreIcon } from "./Icons";

const ICON_BUTTON = "canto-hit grid h-[28px] w-[28px] place-items-center rounded-lg text-muted hover:bg-hover hover:text-fg active:bg-active";
const ITEM = "canto-hit flex min-h-[32px] w-full items-center rounded-lg px-2.5 text-left text-[12.5px] text-fg hover:bg-hover active:bg-active";

/** The "···" actions menu: opens on the first item, arrows rove, Escape and a pick hand focus back to the trigger. */
export default function ActivityMenu({ day, onCopy, onRefresh, onGoal }: { day: boolean; onCopy: () => void; onRefresh: () => void; onGoal: () => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
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
    button.current?.focus();
  };
  const run = (action: () => void) => () => {
    close();
    action();
  };

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "Escape") {
      e.stopPropagation();
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
    <div ref={root} className="relative" onKeyDown={onKeyDown}>
      <button ref={button} type="button" aria-label={t("activity.more")} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)} className={ICON_BUTTON}>
        <MoreIcon />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-20 mt-1 min-w-[12.5rem] rounded-xl border border-edge bg-panel p-1 shadow-raised">
          {day && (
            <button type="button" role="menuitem" onClick={run(onCopy)} className={ITEM}>
              {t("activity.copy")}
            </button>
          )}
          <button type="button" role="menuitem" onClick={run(onRefresh)} className={ITEM}>
            {t("activity.refreshNow")}
          </button>
          {day && (
            <>
              <hr className="mx-1 my-1 border-edge" />
              <button type="button" role="menuitem" onClick={run(onGoal)} className={ITEM}>
                {t("activity.goalMenu")}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
