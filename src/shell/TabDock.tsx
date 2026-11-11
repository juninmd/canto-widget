import { useEffect, useRef, useState } from "react";
import { t } from "../i18n";
import { panelId, tabId, type Tab, type TABS } from "./TabBar";
import TabIcon from "./TabIcon";
import { TabBadge } from "./TabMore";

type Props = {
  current: Tab;
  onChange: (tab: Tab) => void;
  tabs: typeof TABS;
  attention?: Partial<Record<Tab, number>>;
};

/** Tabs kept on the bar; the open tab takes one more slot when it is not among them, so it never disappears. */
const SLOTS = 4;

const BUTTON = "canto-hit relative grid h-10 w-11 place-items-center rounded-xl transition-colors active:bg-active";

/** The floating bar at the bottom: the main tabs as icons, and a grid with every tab behind the last button. */
export default function TabDock({ current, onChange, tabs, attention = {} }: Props) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const onBar = tabs.slice(0, SLOTS);
  const extra = onBar.some((tab) => tab.id === current) ? undefined : tabs.find((tab) => tab.id === current);
  const shown = extra ? [...onBar, extra] : onBar;

  useEffect(() => {
    if (!open) return;
    root.current?.querySelector<HTMLElement>('[aria-current="page"]')?.focus();
    const away = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener("pointerdown", away);
    window.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", away);
      window.removeEventListener("keydown", key);
    };
  }, [open]);

  const pick = (id: Tab) => {
    setOpen(false);
    onChange(id);
  };

  return (
    <div ref={root} className="relative flex shrink-0 justify-center px-3 pb-2 pt-1">
      {open && (
        <div
          role="dialog"
          aria-label={t("tabs.all")}
          className="absolute bottom-full left-3 right-3 z-30 mb-1 grid max-h-[60vh] grid-cols-4 gap-1.5 overflow-y-auto rounded-2xl border border-edge bg-panel p-2 shadow-2xl motion-safe:animate-aba motion-reduce:animate-fade"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-current={current === tab.id ? "page" : undefined}
              onClick={() => pick(tab.id)}
              className={`canto-hit relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl border px-1 text-[11px] transition-colors hover:bg-hover active:bg-active ${
                current === tab.id ? "border-accent font-semibold text-fg" : "border-edge text-muted"
              }`}
            >
              <TabIcon tab={tab.id} size={20} />
              <span className="max-w-full truncate">{tab.label}</span>
              <TabBadge n={attention[tab.id] ?? 0} />
            </button>
          ))}
        </div>
      )}
      <nav
        role="tablist"
        aria-label={t("tabs.label")}
        className="flex gap-1 rounded-2xl border border-edge bg-panel/95 p-1 shadow-2xl"
      >
        {shown.map((tab) => (
          <button
            key={tab.id}
            id={tabId(tab.id)}
            type="button"
            role="tab"
            title={tab.label}
            aria-label={tab.label}
            aria-selected={current === tab.id}
            aria-controls={current === tab.id ? panelId(tab.id) : undefined}
            tabIndex={current === tab.id ? 0 : -1}
            onClick={() => pick(tab.id)}
            className={`${BUTTON} ${
              current === tab.id ? "bg-accent text-on-accent" : "text-muted hover:bg-hover hover:text-fg"
            }`}
          >
            <TabIcon tab={tab.id} />
            <TabBadge n={attention[tab.id] ?? 0} />
          </button>
        ))}
        <button
          ref={trigger}
          type="button"
          title={t("tabs.all")}
          aria-label={t("tabs.all")}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={`${BUTTON} ${open ? "bg-hover text-fg" : "text-muted hover:bg-hover hover:text-fg"}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
          </svg>
        </button>
      </nav>
    </div>
  );
}
