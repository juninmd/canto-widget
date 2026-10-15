import { useEffect, useId, useRef, useState } from "react";
import { t } from "../i18n";
import type { Tab } from "./TabBar";

const BADGE = "ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-md bg-accent/20 px-1 text-[10px] tabular-nums text-accent-text";

export function TabBadge({ n }: { n: number }) {
  if (n <= 0) return null;
  return (
    <span aria-label={t("tabs.attention", { n })} className={BADGE}>
      {n}
    </span>
  );
}

type Props = {
  hidden: { tab: { id: Tab; label: string }; i: number }[];
  attention: Partial<Record<Tab, number>>;
  onPick: (id: Tab) => void;
};

/** The "mais" menu: focus moves into it on open, arrows rove, Esc and Tab hand focus back to the button. */
export default function TabMore({ hidden, attention, onPick }: Props) {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const title = t("tabs.moreTitle", { n: hidden.length });
  const items = () => [...(root.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];

  useEffect(() => {
    if (!open) return;
    setCursor(0);
    items()[0]?.focus();
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  function onMenuKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape" || e.key === "Tab") {
      if (e.key === "Escape") e.stopPropagation();
      setOpen(false);
      trigger.current?.focus();
      return;
    }
    const list = items();
    const at = list.indexOf(document.activeElement as HTMLElement);
    const target = { ArrowDown: (at + 1) % list.length, ArrowUp: (at - 1 + list.length) % list.length, Home: 0, End: list.length - 1 }[e.key];
    if (target === undefined) return;
    e.preventDefault();
    list[target]?.focus();
  }

  return (
    <div ref={root} className="relative shrink-0">
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key !== "ArrowDown") return;
          e.preventDefault();
          setOpen(true);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        title={title}
        className="canto-hit inline-flex min-h-8 items-center gap-1 rounded-lg px-2 text-muted transition-colors hover:bg-hover hover:text-fg active:bg-active aria-expanded:bg-active aria-expanded:text-fg"
      >
        {t("tabs.more")}
        <span aria-hidden="true" className="text-[9px]">
          ▾
        </span>
        {hidden.some(({ tab }) => (attention[tab.id] ?? 0) > 0) && <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />}
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={title}
          onKeyDown={onMenuKeyDown}
          className="absolute right-0 top-full z-40 mt-1 w-44 rounded-xl border border-edge bg-panel p-1.5 shadow-2xl motion-safe:animate-surgir motion-reduce:animate-fade"
        >
          {hidden.map(({ tab, i }, at) => (
            <button
              key={tab.id}
              type="button"
              role="menuitem"
              tabIndex={cursor === at ? 0 : -1}
              onFocus={() => setCursor(at)}
              onClick={() => {
                setOpen(false);
                onPick(tab.id);
              }}
              className="canto-hit flex min-h-8 w-full items-center justify-between gap-2 rounded-lg px-2 text-left text-xs text-fg hover:bg-hover active:bg-active"
            >
              <span>
                {tab.label}
                <TabBadge n={attention[tab.id] ?? 0} />
              </span>
              <span className="text-[10px] text-faint">Alt+{i + 1}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
