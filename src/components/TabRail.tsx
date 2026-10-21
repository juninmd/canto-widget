import { useEffect, useRef } from "react";
import { TAB_GROUP } from "../lib/tabLayout";
import { t } from "../i18n";
import { panelId, tabId, type Tab, type TABS } from "./TabBar";
import TabIcon from "./TabIcon";

type Props = {
  current: Tab;
  onChange: (t: Tab) => void;
  tabs: typeof TABS;
  pinned: boolean;
  onPinned: (pinned: boolean) => void;
};

// The rail opens over the content on hover or focus, so the labels cost no width until someone wants them.
const OPEN = "group-hover/rail:w-[178px] group-focus-within/rail:w-[178px] group-data-[pinned=true]/rail:w-[178px]";
const SHOWN = "hidden group-hover/rail:inline group-focus-within/rail:inline group-data-[pinned=true]/rail:inline";

/** The vertical twin of TabBar: the same WAI-ARIA tabs pattern with up/down arrows, and every tab always in reach. */
export default function TabRail({ current, onChange, tabs, pinned, onPinned }: Props) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const focusCurrent = useRef(false);

  useEffect(() => {
    if (!focusCurrent.current) return;
    focusCurrent.current = false;
    refs.current[current]?.focus();
  }, [current]);

  function onKeyDown(e: React.KeyboardEvent) {
    const i = tabs.findIndex((tab) => tab.id === current);
    const target = {
      ArrowDown: (i + 1) % tabs.length,
      ArrowUp: (i - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    }[e.key];
    if (target === undefined) return;
    e.preventDefault();
    focusCurrent.current = true;
    onChange(tabs[target].id);
  }

  const items = tabs.filter((tab) => tab.id !== "settings");
  const settings = tabs.find((tab) => tab.id === "settings");

  const tabButton = (tab: (typeof TABS)[number]) => {
    const i = tabs.indexOf(tab);
    const on = current === tab.id;
    return (
      <button
        key={tab.id}
        ref={(el) => {
          refs.current[tab.id] = el;
        }}
        id={tabId(tab.id)}
        type="button"
        role="tab"
        aria-selected={on}
        aria-label={tab.label}
        aria-controls={on ? panelId(tab.id) : undefined}
        aria-keyshortcuts={i < 9 ? `Alt+${i + 1}` : undefined}
        tabIndex={on ? 0 : -1}
        title={`${tab.label}${i < 9 ? ` · Alt+${i + 1}` : ""}`}
        onClick={() => onChange(tab.id)}
        className={`relative canto-hit flex h-8 w-full shrink-0 items-center gap-3 rounded-lg px-2.5 text-xs transition-colors active:bg-active ${
          on
            ? "bg-edge/70 font-semibold text-fg before:absolute before:-left-1.5 before:inset-y-2 before:w-[3px] before:rounded-r before:bg-accent"
            : "text-muted hover:bg-hover hover:text-fg"
        }`}
      >
        <span className={on ? "text-accent-text" : ""}>
          <TabIcon tab={tab.id} />
        </span>
        <span aria-hidden="true" className={`${SHOWN} truncate`}>
          {tab.label}
        </span>
      </button>
    );
  };

  let last: string | undefined;
  return (
    <div data-pinned={pinned} className="group/rail relative z-10 w-[52px] shrink-0 data-[pinned=true]:w-[178px]">
      <div
        className={`absolute inset-y-0 left-0 flex w-[52px] flex-col overflow-hidden border-r border-edge bg-panel px-1.5 py-2 transition-[width,box-shadow] motion-reduce:transition-none group-data-[pinned=false]/rail:group-hover/rail:shadow-2xl ${OPEN}`}
      >
        <nav
          role="tablist"
          aria-orientation="vertical"
          aria-label={t("tabs.label")}
          onKeyDown={onKeyDown}
          className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden [scrollbar-width:none]"
        >
          {items.map((tab) => {
            const group = TAB_GROUP[tab.id];
            const heading = group && group !== last ? group : undefined;
            const gap = heading && last !== undefined;
            last = group ?? last;
            return (
              <div key={tab.id} className="contents">
                {heading && (
                  <div aria-hidden="true" className={`flex h-4 shrink-0 items-center px-2.5 ${gap ? "mt-1.5" : ""}`}>
                    <span className={`${SHOWN} truncate text-[10px] font-semibold uppercase tracking-widest text-faint`}>
                      {t(`tabs.group.${heading}`)}
                    </span>
                    <span className="h-px flex-1 bg-edge group-hover/rail:hidden group-focus-within/rail:hidden group-data-[pinned=true]/rail:hidden" />
                  </div>
                )}
                {tabButton(tab)}
              </div>
            );
          })}
          <div className="min-h-2 flex-1" />
          {settings && tabButton(settings)}
        </nav>
        <button
          type="button"
          aria-pressed={pinned}
          title={pinned ? t("tabs.rail.unpin") : t("tabs.rail.pin")}
          aria-label={pinned ? t("tabs.rail.unpin") : t("tabs.rail.pin")}
          onClick={() => onPinned(!pinned)}
          className="canto-hit mt-1 flex h-8 w-full shrink-0 items-center gap-3 rounded-lg border-t border-edge px-2.5 text-xs text-faint hover:bg-hover hover:text-fg"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
            <path d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM9 4v16" />
          </svg>
          <span aria-hidden="true" className={`${SHOWN} truncate`}>
            {pinned ? t("tabs.rail.unpin") : t("tabs.rail.pin")}
          </span>
        </button>
      </div>
    </div>
  );
}
