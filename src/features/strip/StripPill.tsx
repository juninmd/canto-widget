import type { ReactNode } from "react";
import { BellIcon, CalendarIcon, PullIcon, PulseIcon } from "../../components/Icons";
import { t } from "../../i18n";
import type { StripItem, StripSnapshot } from "../../lib/api";
import { levelOf, pillText, type Level } from "./stripModel";

const TONE: Record<Level, string> = { "": "text-fg", warn: "text-warn", danger: "text-danger" };

const RamIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
    <rect x="3" y="8" width="18" height="8" rx="1.5" />
    <path d="M7 12h.01M12 12h.01M17 12h.01" />
  </svg>
);

const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
  </svg>
);

export const ICONS: Record<StripItem, ReactNode> = {
  cpu: <PulseIcon size={14} />,
  memory: <RamIcon />,
  weather: <SunIcon />,
  event: <CalendarIcon />,
  reviews: <PullIcon />,
  notices: <BellIcon on={false} />,
};

type Props = { items: StripItem[]; snap: StripSnapshot | null; open: boolean; onToggle: () => void };

/** One line of a few numbers; the whole pill is the button, so the target is as big as the pill. */
export default function StripPill({ items, snap, open, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-label={t("strip.aria")}
      className={`canto-hit flex h-7 items-center gap-3 whitespace-nowrap rounded-full border bg-panel px-3 text-xs font-medium shadow-lg ${open ? "border-accent" : "border-edge"}`}
    >
      {snap &&
        items.map((item) => {
          const text = pillText(item, snap);
          if (text === null) return null;
          return (
            <span key={item} className={`tnum flex items-center gap-1 ${TONE[levelOf(item, snap)]}`}>
              <span className="text-muted">{ICONS[item]}</span>
              {text}
            </span>
          );
        })}
    </button>
  );
}
