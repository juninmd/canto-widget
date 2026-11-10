import { useEffect, useRef, useState, type ReactNode } from "react";

const ICON_BUTTON = "canto-hit inline-flex h-[28px] min-w-[28px] items-center justify-center gap-1 rounded-lg px-1.5 text-muted hover:bg-hover hover:text-fg active:bg-active";
const ITEM = "canto-hit flex min-h-[32px] w-full items-center gap-2 rounded-lg px-2.5 text-left text-[12.5px] hover:bg-hover active:bg-active";

export type ForgeMenuItem = {
  key: string;
  label: string;
  onSelect: () => void;
  /** Present on radio items: the one that is on. */
  checked?: boolean;
  danger?: boolean;
  /** Draws a rule above the item. */
  divider?: boolean;
};

type Props = { label: string; title?: string; icon: ReactNode; items: ForgeMenuItem[]; menuLabel?: string; className?: string };

/** Icon button that opens a small menu: arrows rove, Escape or a pick hand focus back to the button. */
export default function ForgeMenu({ label, title, icon, items, menuLabel, className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const entries = () => [...(root.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]') ?? [])];

  useEffect(() => {
    if (!open) return;
    (entries().find((e) => e.getAttribute("aria-checked") === "true") ?? entries()[0])?.focus();
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
    if (e.key === "Tab") {
      setOpen(false);
      return;
    }
    const list = entries();
    const at = list.indexOf(document.activeElement as HTMLElement);
    const to = { ArrowDown: (at + 1) % list.length, ArrowUp: (at - 1 + list.length) % list.length, Home: 0, End: list.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    list[to]?.focus();
  }

  return (
    <div ref={root} className="relative" onKeyDown={onKeyDown}>
      <button
        ref={button}
        type="button"
        aria-label={label}
        title={title ?? label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={`${ICON_BUTTON} ${className}`}
      >
        {icon}
      </button>
      {open && (
        <div role="menu" aria-label={menuLabel ?? label} className="absolute right-0 top-full z-30 mt-1 min-w-[12.5rem] rounded-xl border border-edge bg-panel p-1 shadow-raised">
          {items.map((it) => (
            <div key={it.key}>
              {it.divider && <hr className="mx-1 my-1 border-edge" />}
              <button
                type="button"
                role={it.checked === undefined ? "menuitem" : "menuitemradio"}
                aria-checked={it.checked}
                onClick={() => {
                  close();
                  it.onSelect();
                }}
                className={`${ITEM} ${it.danger ? "text-danger" : it.checked ? "font-semibold text-accent-text" : "text-fg"}`}
              >
                {it.checked !== undefined && (
                  <span aria-hidden="true" className="w-3 text-center">
                    {it.checked ? "✓" : ""}
                  </span>
                )}
                {it.label}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
