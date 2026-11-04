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

/** A round gauge for a share, the number in its middle; the arc sweeps in and then follows each reading. */
export function Ring({ value, level = "ok", size = 64, children, label }: { value: number; level?: Level; size?: number; children?: ReactNode; label?: string }) {
  const share = Math.max(0, Math.min(100, value));
  const tone = { ok: "var(--color-accent)", warn: "var(--color-warn)", danger: "var(--color-danger)" }[level];
  return (
    <div
      className="relative grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(share)}
      aria-label={label}
    >
      <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--color-edge)" strokeWidth="3" />
        <circle
          cx="18"
          cy="18"
          r="15.5"
          fill="none"
          stroke={tone}
          strokeWidth="3"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="100"
          className="canto-ring"
          style={{ strokeDashoffset: 100 - share } as CSSProperties}
        />
      </svg>
      <span className="relative tabular-nums">{children}</span>
    </div>
  );
}

const TONE_BADGE: Record<Level, string> = { ok: "bg-accent/12 text-accent-text", warn: "bg-warn/15 text-warn", danger: "bg-danger/15 text-danger" };

/** The tinted square an icon sits in at the head of a card. */
export function Badge({ icon, level = "ok" }: { icon: ReactNode; level?: Level }) {
  return (
    <span aria-hidden="true" className={`grid size-6 shrink-0 place-items-center rounded-lg transition-colors duration-500 ${TONE_BADGE[level]}`}>
      {icon}
    </span>
  );
}

type CardProps = {
  title: ReactNode;
  /** Drawn in a tinted badge before the title. */
  icon?: ReactNode;
  /** Tints the icon badge and the card's edge when the part needs a look. */
  level?: Level;
  aside?: ReactNode;
  /** Opens the card's sub-tab; the card is then one big button. */
  onOpen?: () => void;
  index?: number;
  className?: string;
  children?: ReactNode;
};

/** The glass card every section of the tab is drawn in. */
export function Card({ title, icon, level = "ok", aside, onOpen, index = 0, className = "", children }: CardProps) {
  const head = (
    <div className="flex items-start justify-between gap-2">
      <h3 className="flex min-w-0 items-center gap-2 text-[12px] font-semibold text-fg">
        {icon && <Badge icon={icon} level={level} />}
        <span className="min-w-0 truncate">{title}</span>
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
  const edge = level === "danger" ? "border-danger/40" : level === "warn" ? "border-warn/35" : "";
  const base = `wx-glass wx-rise flex min-w-0 flex-col gap-2 p-3 text-left ${edge} ${className}`;
  if (onOpen) {
    return (
      <button type="button" onClick={onOpen} style={style} className={`group ${base} canto-hit canto-raise transition-colors hover:border-line/60 hover:bg-hover/40`}>
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
