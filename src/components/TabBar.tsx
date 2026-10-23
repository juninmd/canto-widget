import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { fitTabs } from "../lib/fitTabs";
import { useAltHeld } from "../lib/useAltHeld";
import { useIndicator } from "../lib/useIndicator";
import { t } from "../i18n";
import TabMore, { TabBadge } from "./TabMore";

export type Tab =
  | "tasks" | "notes" | "clipboard" | "agenda" | "github" | "gitlab" | "steam" | "status" | "models" | "agents"
  | "weather" | "map" | "market" | "reads" | "activity" | "gmail" | "gdrive" | "contacts" | "settings";

/** Grouped as the vertical bar shows them; Alt+1 to Alt+4 stay on the four oldest tabs. */
export const TABS: { id: Tab; label: string }[] = [
  { id: "tasks", label: t("tabs.tasks") },
  { id: "notes", label: t("tabs.notes") },
  { id: "clipboard", label: t("tabs.clipboard") },
  { id: "agenda", label: t("tabs.agenda") },
  { id: "gmail", label: "Gmail" },
  { id: "gdrive", label: "Drive" },
  { id: "contacts", label: t("contacts.tab") },
  { id: "github", label: "GitHub" },
  { id: "gitlab", label: "GitLab" },
  { id: "status", label: t("tabs.status") },
  { id: "agents", label: t("agents.tab") },
  { id: "models", label: t("tabs.models") },
  { id: "activity", label: t("tabs.activity") },
  { id: "weather", label: t("weather.tab") },
  { id: "map", label: t("map.tab") },
  { id: "market", label: t("protos.tab.market") },
  { id: "steam", label: "Steam" },
  { id: "reads", label: t("reads.tab") },
  { id: "settings", label: t("tabs.settings") },
];

export const panelId = (tab: Tab) => `panel-${tab}`;
export const tabId = (tab: Tab) => `aba-${tab}`;

/** WAI-ARIA APG tabs pattern: one Tab stop, arrows/Home/End switch tabs. */
type Props = {
  current: Tab;
  onChange: (t: Tab) => void;
  tabs?: typeof TABS;
  /** Pending items per tab (e.g. review requests); a tab without an entry or with 0 shows no badge. */
  attention?: Partial<Record<Tab, number>>;
};

const TAB = "relative canto-hit min-h-8 shrink-0 rounded-lg px-2 transition-colors active:bg-active after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:transition-[background-color]";

/** Tabs that don't fit go to a "mais" menu instead of being cut: the open tab always stays on the bar. */
export default function TabBar({ current, onChange, tabs = TABS, attention = {} }: Props) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const row = useRef<HTMLDivElement>(null);
  const ruler = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLElement>(null);
  const focusCurrent = useRef(false);
  const [shown, setShown] = useState<number[]>(() => tabs.map((_, i) => i));
  const alt = useAltHeld();
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

  const count = (id: Tab) => attention[id] ?? 0;
  // `shown` holds indices of the previous list until the layout effect re-measures: one past the end crashes the window.
  const kept = shown.filter((i) => i < tabs.length);
  const hidden = tabs.map((tab, i) => ({ tab, i })).filter(({ i }) => !kept.includes(i));
  const box = useIndicator(list, () => refs.current[current], `${current}|${kept.join()}`);

  return (
    <div ref={row} className="relative flex shrink-0 items-center gap-0.5 px-3 pb-1 pt-1.5 text-xs">
      <nav
        ref={list}
        role="tablist"
        aria-orientation="horizontal"
        aria-label={t("tabs.label")}
        onKeyDown={onKeyDown}
        data-sliding={box ? "" : undefined}
        className="canto-tabs relative flex min-w-0 gap-0.5"
      >
        {kept.map((i) => {
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
              aria-keyshortcuts={i < 9 ? `Alt+${i + 1}` : undefined}
              className={`${TAB} ${
                current === tab.id
                  ? "font-semibold text-fg after:bg-accent"
                  : "text-muted after:bg-transparent hover:bg-hover hover:text-fg"
              }`}
            >
              {tab.label}
              <TabBadge n={count(tab.id)} />
              {alt && i < 9 && (
                <span aria-hidden="true" className="absolute -top-0.5 right-0 rounded bg-edge px-1 text-[9px] leading-3 text-fg">
                  {i + 1}
                </span>
              )}
            </button>
          );
        })}
        {box && (
          <span
            aria-hidden="true"
            data-tab-indicator
            className="canto-indicator pointer-events-none absolute bottom-0 left-0 h-0.5 rounded-full bg-accent"
            style={{ width: Math.max(0, box.w - 16), transform: `translateX(${box.x + 8}px)` }}
          />
        )}
      </nav>
      {hidden.length > 0 && <TabMore hidden={hidden} attention={attention} onPick={onChange} />}
      {/* Invisible copy of the bar, the only way to know each tab's width before deciding which fit; clipped so its width cannot scroll the window. */}
      <div aria-hidden="true" className="pointer-events-none invisible absolute inset-x-0 top-0 -z-10 overflow-hidden">
        <div ref={ruler} className="flex w-max gap-0.5 whitespace-nowrap px-3">
          {tabs.map((tab) => (
            <span
              key={tab.id}
              data-ruler
              data-label={count(tab.id) > 0 ? `${tab.label} ${count(tab.id)}` : tab.label}
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
    </div>
  );
}
