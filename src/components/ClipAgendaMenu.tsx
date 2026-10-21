import { useEffect, useRef, useState, type ReactNode } from "react";
import { MoreIcon } from "./Icons";

export type MenuAction = { label: string; title?: string; onSelect: () => void; danger?: boolean; disabled?: boolean };

const ICON_BUTTON = "canto-hit grid h-[28px] w-[28px] shrink-0 place-items-center rounded-lg text-muted hover:bg-hover hover:text-fg active:bg-active";
const ITEM = "canto-hit flex min-h-[32px] w-full items-center rounded-lg px-2.5 text-left text-[12.5px] hover:bg-hover active:bg-active disabled:opacity-50";

/** A "···" actions menu: opens on the first item, arrows rove, Escape and a pick hand focus back to the trigger. */
export default function ClipAgendaMenu({ label, actions, footer }: { label: string; actions: MenuAction[]; footer?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const items = () => [...(root.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled)') ?? [])];

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

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "Escape") {
      e.stopPropagation();
      close();
      return;
    }
    const list = items();
    if (list.length === 0) return;
    const at = list.indexOf(document.activeElement as HTMLElement);
    const to = { ArrowDown: (at + 1) % list.length, ArrowUp: (at - 1 + list.length) % list.length, Home: 0, End: list.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    list[to]?.focus();
  }

  return (
    <div ref={root} className="relative" onKeyDown={onKeyDown}>
      <button ref={button} type="button" aria-label={label} title={label} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)} className={ICON_BUTTON}>
        <MoreIcon />
      </button>
      {open && (
        <div role="menu" aria-label={label} className="absolute right-0 top-full z-20 mt-1 min-w-[12.5rem] rounded-xl border border-edge bg-panel p-1 shadow-raised">
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              role="menuitem"
              disabled={a.disabled}
              title={a.title}
              onClick={() => {
                close();
                a.onSelect();
              }}
              className={`${ITEM} ${a.danger ? "text-danger" : "text-fg"}`}
            >
              {a.label}
            </button>
          ))}
          {footer && (
            <>
              <hr className="mx-1 my-1 border-edge" />
              <div className="px-2.5 py-1 text-[11px] text-faint">{footer}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
