import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { fitTabs } from "../lib/fitTabs";
import { t } from "../i18n";

export type Tab =
  | "tasks" | "notes" | "clipboard" | "agenda" | "github" | "gitlab" | "status" | "models" | "activity" | "settings";

export const TABS: { id: Tab; label: string }[] = [
  { id: "tasks", label: t("tabs.tasks") },
  { id: "notes", label: t("tabs.notes") },
  { id: "clipboard", label: t("tabs.clipboard") },
  { id: "agenda", label: t("tabs.agenda") },
  { id: "github", label: "GitHub" },
  { id: "gitlab", label: "GitLab" },
  { id: "status", label: t("tabs.status") },
  { id: "models", label: t("tabs.models") },
  { id: "activity", label: t("tabs.activity") },
  { id: "settings", label: t("tabs.settings") },
];

export const panelId = (tab: Tab) => `panel-${tab}`;
const tabId = (tab: Tab) => `aba-${tab}`;

/** WAI-ARIA APG tabs pattern: one Tab stop, arrows/Home/End switch tabs. */
type Props = { current: Tab; onChange: (t: Tab) => void; tabs?: typeof TABS };

const TAB = "relative canto-hit min-h-8 shrink-0 rounded-lg px-2 transition-colors active:bg-active after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:transition-[background-color]";

/** Tabs that don't fit go to a "mais" menu instead of being cut: the open tab always stays on the bar. */
export default function TabBar({ current, onChange, tabs = TABS }: Props) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const row = useRef<HTMLDivElement>(null);
  const ruler = useRef<HTMLDivElement>(null);
  const focusCurrent = useRef(false);
  const [shown, setShown] = useState<number[]>(() => tabs.map((_, i) => i));
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const active = Math.max(0, tabs.findIndex((tab) => tab.id === current));

  // Measures every tab (bold, the widest case) in a hidden copy of the bar, so the choice doesn't depend on which tab is open.
  useLayoutEffect(() => {
    const measure = () => {
      const box = row.current;
      const cells = [...(ruler.current?.querySelectorAll<HTMLElement>("[data-ruler]") ?? [])];
      if (!box || cells.length === 0) return;
      const widths = cells.slice(0, tabs.length).map((c) => c.offsetWidth);
      const more = cells[tabs.length]?.offsetWidth ?? 0;
      const style = getComputedStyle(box);
      const available = box.clientWidth - parseFloat(style.paddingLeft || "0") - parseFloat(style.paddingRight || "0");
      const next = fitTabs(widths, available, active, more);
      setShown((prev) => (prev.length === next.length && prev.every((v, i) => v === next[i]) ? prev : next));
    };
    measure();
    if (typeof ResizeObserver === "undefined" || !row.current) return;
    const observer = new ResizeObserver(measure);
    observer.observe(row.current);
    return () => observer.disconnect();
  }, [tabs, active]);

  // A tab picked with the arrows may have just come out of the menu: it only exists after the render.
  useEffect(() => {
    const el = refs.current[current];
    if (!focusCurrent.current || !el) return;
    focusCurrent.current = false;
    el.focus();
  }, [current, shown]);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!(e.target as Element).closest?.("[data-more]")) setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  function onKeyDown(e: React.KeyboardEvent) {
    const i = tabs.findIndex((tab) => tab.id === current);
    const target = {
      ArrowRight: (i + 1) % tabs.length,
      ArrowLeft: (i - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    }[e.key];
    if (target === undefined) return;
    e.preventDefault();
    focusCurrent.current = true;
    onChange(tabs[target].id);
  }

  const hidden = tabs.map((tab, i) => ({ tab, i })).filter(({ i }) => !shown.includes(i));

  return (
    <div ref={row} className="relative flex shrink-0 items-center gap-0.5 px-3 pb-1 pt-1.5 text-xs">
      <nav role="tablist" aria-label={t("tabs.label")} onKeyDown={onKeyDown} className="flex min-w-0 gap-0.5">
        {shown.map((i) => {
          const tab = tabs[i];
          return (
            <button
              key={tab.id}
              ref={(el) => {
                refs.current[tab.id] = el;
              }}
              id={tabId(tab.id)}
              type="button"
              role="tab"
              aria-selected={current === tab.id}
              // Only the active panel exists in the DOM; pointing at the others would be a broken reference.
              aria-controls={current === tab.id ? panelId(tab.id) : undefined}
              tabIndex={current === tab.id ? 0 : -1}
              onClick={() => onChange(tab.id)}
              title={`Alt+${i + 1}`}
              className={`${TAB} ${
                current === tab.id
                  ? "font-semibold text-fg after:bg-accent"
                  : "text-muted after:bg-transparent hover:bg-hover hover:text-fg"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
      {hidden.length > 0 && (
        <div data-more className="relative shrink-0">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={open ? menuId : undefined}
            title={t("tabs.moreTitle", { n: hidden.length })}
            className="canto-hit inline-flex min-h-8 items-center gap-1 rounded-lg px-2 text-muted transition-colors hover:bg-hover hover:text-fg active:bg-active aria-expanded:bg-active aria-expanded:text-fg"
          >
            {t("tabs.more")}
            <span aria-hidden="true" className="text-[9px]">
              ▾
            </span>
          </button>
          {open && (
            <div
              id={menuId}
              role="menu"
              aria-label={t("tabs.moreTitle", { n: hidden.length })}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.stopPropagation();
                  setOpen(false);
                }
              }}
              className="absolute right-0 top-full z-40 mt-1 w-44 rounded-xl border border-edge bg-panel p-1.5 shadow-2xl motion-safe:animate-surgir motion-reduce:animate-fade"
            >
              {hidden.map(({ tab, i }) => (
                <button
                  key={tab.id}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    onChange(tab.id);
                  }}
                  className="canto-hit flex min-h-8 w-full items-center justify-between gap-2 rounded-lg px-2 text-left text-xs text-fg hover:bg-hover active:bg-active"
                >
                  {tab.label}
                  <span className="text-[10px] text-faint">Alt+{i + 1}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Invisible copy of the bar: the only way to know each tab's width before deciding which ones fit. */}
      <div ref={ruler} aria-hidden="true" className="pointer-events-none invisible absolute left-0 top-0 -z-10 flex gap-0.5 whitespace-nowrap px-3">
        {tabs.map((tab) => (
          <span
            key={tab.id}
            data-ruler
            data-label={tab.label}
            className={`${TAB} inline-flex items-center font-semibold before:content-[attr(data-label)]`}
          />
        ))}
        <span
          data-ruler
          data-label={`${t("tabs.more")} ▾`}
          className="canto-hit inline-flex min-h-8 items-center px-2 before:content-[attr(data-label)]"
        />
      </div>
    </div>
  );
}
