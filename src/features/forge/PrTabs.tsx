import { useEffect, useRef } from "react";
import { t, type MessageKey } from "../../i18n";
import { useTabLayout } from "../../shell/tabLayout";
import PrTabIcon from "./PrTabIcon";
import { useDragScroll } from "./useDragScroll";
import type { PrTab } from "./PrView";

export type PrTabDef = { key: PrTab; label: MessageKey; count?: number };

const OPEN = "group-hover/rail:w-[160px] group-has-[:focus-visible]/rail:w-[160px] group-data-[pinned=true]/rail:w-[160px]";
const SHOWN = "hidden group-hover/rail:inline group-has-[:focus-visible]/rail:inline group-data-[pinned=true]/rail:inline";

const Count = ({ n, on }: { n?: number; on: boolean }) =>
  n === undefined ? null : <span className={`rounded-full px-1.5 text-[10px] tabular-nums ${on ? "bg-accent text-on-accent" : "bg-edge text-muted"}`}>{n}</span>;

/** The pill bar: scrolls sideways when the window is narrow, and the chosen tab is brought into view. */
export function PrTabBar({ tabs, tab, onChange }: { tabs: PrTabDef[]; tab: PrTab; onChange: (t: PrTab) => void }) {
  const row = useRef<HTMLDivElement>(null);
  useDragScroll(row);
  useEffect(() => {
    row.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  }, [tab]);
  return (
    <div ref={row} className="-mx-1 overflow-x-auto px-1 pb-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div role="tablist" aria-label={t("forge.pr.tabs")} className="inline-flex gap-0.5 rounded-xl border border-edge bg-edge/40 p-[3px]">
        {tabs.map(({ key, label, count }) => (
          <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => onChange(key)} className={`canto-hit inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[9px] px-2.5 py-1.5 text-xs ${tab === key ? "bg-panel font-semibold text-accent-text shadow-sm ring-1 ring-edge" : "text-muted hover:bg-hover hover:text-fg"}`}>
            <PrTabIcon tab={key} />
            {t(label)}
            <Count n={count} on={tab === key} />
          </button>
        ))}
      </div>
    </div>
  );
}

/** The vertical twin of the app's rail: icons only until the pointer or the keyboard arrives, with the same pin. */
export function PrTabRail({ tabs, tab, onChange }: { tabs: PrTabDef[]; tab: PrTab; onChange: (t: PrTab) => void }) {
  const { pinned, setPinned } = useTabLayout();
  return (
    <div data-pinned={pinned} className="group/rail relative z-30 w-[52px] shrink-0 data-[pinned=true]:w-[160px]">
      <div className={`absolute inset-y-0 left-0 flex w-[52px] flex-col overflow-hidden border-r border-edge bg-panel px-1.5 py-2 transition-[width,box-shadow] motion-reduce:transition-none group-data-[pinned=false]/rail:group-hover/rail:shadow-2xl ${OPEN}`}>
        <div role="tablist" aria-orientation="vertical" aria-label={t("forge.pr.tabs")} className="flex flex-1 flex-col gap-0.5">
          {tabs.map(({ key, label, count }) => (
            <button key={key} type="button" role="tab" aria-selected={tab === key} aria-label={`${t(label)}${count === undefined ? "" : ` ${count}`}`} title={t(label)} onClick={() => onChange(key)} className={`canto-hit flex h-9 w-full shrink-0 items-center gap-3 rounded-lg px-2.5 text-xs ${tab === key ? "bg-accent/15 font-semibold text-accent-text shadow-[inset_3px_0_0_var(--color-accent)]" : "text-muted hover:bg-hover hover:text-fg"}`}>
              <PrTabIcon tab={key} />
              <span aria-hidden="true" className={`${SHOWN} min-w-0 flex-1 truncate text-left`}>
                {t(label)}
              </span>
              <span aria-hidden="true" className={SHOWN}>
                <Count n={count} on={tab === key} />
              </span>
            </button>
          ))}
        </div>
        <button type="button" aria-pressed={pinned} title={pinned ? t("tabs.rail.unpin") : t("tabs.rail.pin")} aria-label={pinned ? t("tabs.rail.unpin") : t("tabs.rail.pin")} onClick={() => setPinned(!pinned)} className="canto-hit mt-1 flex h-8 w-full shrink-0 items-center gap-3 rounded-lg border-t border-edge px-2.5 text-xs text-faint hover:bg-hover hover:text-fg">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
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
