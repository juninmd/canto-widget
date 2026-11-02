import type { CSSProperties, ReactNode } from "react";
import { LEVEL_BG, LEVEL_TEXT, type Level } from "../lib/system";
import { t } from "../i18n";

/** A filled bar for a share (memory, disk, battery capacity), in the level's color. */
export function Meter({ value, level = "ok", label }: { value: number; level?: Level; label?: string }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(width)} aria-label={label} className="h-1.5 overflow-hidden rounded-full bg-edge">
      <div className={`canto-grow-x h-full rounded-full ${LEVEL_BG[level]}`} style={{ width: `${width}%` }} />
    </div>
  );
}

/** The big number of a card: "54" with a small "%" or "°C". */
export function Big({ value, unit, level }: { value: string; unit?: string; level?: Level }) {
  return (
    <span className={`shrink-0 tabular-nums ${level && level !== "ok" ? LEVEL_TEXT[level] : "text-fg"}`}>
      <span className="text-[26px] font-semibold leading-none tracking-tight">{value}</span>
      {unit && <span className="ml-0.5 text-[11px] font-medium text-muted">{unit}</span>}
    </span>
  );
}

type CardProps = {
  title: ReactNode;
  aside?: ReactNode;
  /** Opens the card's sub-tab; the card is then one big button. */
  onOpen?: () => void;
  index?: number;
  className?: string;
  children?: ReactNode;
};

/** The glass card every section of the tab is drawn in. */
export function Card({ title, aside, onOpen, index = 0, className = "", children }: CardProps) {
  const head = (
    <div className="flex items-start justify-between gap-2">
      <h3 className="flex min-w-0 items-center gap-1 text-[12px] font-semibold text-fg">
        {title}
        {onOpen && (
          <span aria-hidden="true" className="text-faint transition-transform group-hover:translate-x-0.5">
            ›
          </span>
        )}
      </h3>
      {aside}
    </div>
  );
  const style = { "--i": index } as CSSProperties;
  const base = `wx-glass wx-rise flex min-w-0 flex-col gap-2 p-3 text-left ${className}`;
  if (onOpen) {
    return (
      <button type="button" onClick={onOpen} style={style} className={`group ${base} canto-hit transition-colors hover:border-line/60 hover:bg-hover/40`}>
        {head}
        {children}
      </button>
    );
  }
  return (
    <section style={style} className={base}>
      {head}
      {children}
    </section>
  );
}

/** A small label/value tile ("Média 1 min · 41%"). */
export function Stat({ label, value, unit, index = 0 }: { label: string; value: string; unit?: string; index?: number }) {
  return (
    <div className="wx-glass wx-rise flex min-w-0 flex-col gap-1 px-2.5 py-2" style={{ "--i": index } as CSSProperties}>
      <span className="truncate text-[10.5px] text-muted">{label}</span>
      <span className="tabular-nums text-fg">
        <span className="text-[17px] font-semibold leading-none">{value}</span>
        {unit && <span className="ml-0.5 text-[10px] text-muted">{unit}</span>}
      </span>
    </div>
  );
}

/** One "label ........ value" line of a details list. */
export function Row({ label, value, tone }: { label: string; value: ReactNode; tone?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-0.5 text-[11.5px]">
      <dt className="text-muted">{label}</dt>
      <dd className={`tabular-nums ${tone ?? "text-fg"}`}>{value}</dd>
    </div>
  );
}

export function Foot({ left, right }: { left: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 text-[10.5px] text-muted">
      <span className="min-w-0 truncate">{left}</span>
      {right && <span className="shrink-0">{right}</span>}
    </div>
  );
}

export const lastMinute = () => t("system.lastMinute");
