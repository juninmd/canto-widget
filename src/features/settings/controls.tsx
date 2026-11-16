import type { ReactNode } from "react";

/** One setting per row: the name and its hint on the left, the control on the right. */
export function Row({ label, hint, children, htmlFor }: { label: string; hint?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="flex min-h-[40px] items-center justify-between gap-3 px-3 py-2">
      <div className="min-w-0 flex-1">
        <label htmlFor={htmlFor} className="block text-xs font-medium text-fg">
          {label}
        </label>
        {hint && <p className="mt-0.5 text-[11px] leading-snug text-faint">{hint}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">{children}</div>
    </div>
  );
}

/** Rows of one group share a frame and hairlines, like a native settings list. */
export function RowGroup({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex flex-col divide-y divide-edge overflow-hidden rounded-xl border border-edge bg-ink/40 ${className}`}>{children}</div>;
}

type SwitchProps = { checked: boolean; onChange: (on: boolean) => void; label: string; hint?: string };

/** An on/off row. A real checkbox underneath, so labels, keyboard and tests behave as before. */
export function SwitchRow({ checked, onChange, label, hint }: SwitchProps) {
  return (
    <label className="flex min-h-[40px] cursor-pointer items-center justify-between gap-3 px-3 py-2 hover:bg-hover/50">
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-medium text-fg">{label}</span>
        {hint && <span className="mt-0.5 block text-[11px] leading-snug text-faint">{hint}</span>}
      </span>
      <Switch checked={checked} onChange={onChange} label={label} />
    </label>
  );
}

/** The bare switch; its accessible name comes from the checkbox, the visible text from whoever wraps it. */
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (on: boolean) => void; label: string }) {
  return (
    <span className="relative inline-flex h-5 w-9 shrink-0">
      <input
        type="checkbox"
        role="switch"
        aria-label={label}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer appearance-none rounded-full opacity-0"
      />
      <span aria-hidden className="absolute inset-0 rounded-full border border-line bg-ink transition-colors peer-checked:border-accent peer-checked:bg-accent peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent" />
      <span aria-hidden className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-muted shadow transition-transform peer-checked:translate-x-4 peer-checked:bg-on-accent" />
    </span>
  );
}

type Option<V extends string | number> = { value: V; label: string };

/** A few exclusive choices as one segmented control (radio buttons, so arrows move and select). */
export function Segmented<V extends string | number>({ label, options, value, onChange, name }: {
  label: string;
  options: Option<V>[];
  value: V;
  onChange: (v: V) => void;
  name: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-0.5 rounded-lg border border-edge bg-ink/60 p-0.5 text-xs">
      {options.map((o) => (
        <label
          key={o.value}
          className={`canto-hit relative flex min-h-[24px] cursor-pointer items-center rounded-md px-2.5 py-0.5 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent ${
            value === o.value ? "bg-accent font-semibold text-on-accent" : "text-muted hover:bg-hover hover:text-fg"
          }`}
        >
          <input type="radio" name={name} checked={value === o.value} onChange={() => onChange(o.value)} aria-label={o.label} className="absolute inset-0 m-0 cursor-pointer appearance-none opacity-0" />
          <span aria-hidden>{o.label}</span>
        </label>
      ))}
    </div>
  );
}

/** A slider with its value beside it. */
export function SliderRow({ label, hint, value, min, max, step, unit, onChange }: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <Row label={label} hint={hint}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        aria-label={label}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-28 accent-[var(--color-accent)]"
      />
      <span className="tnum w-12 text-right text-xs text-muted">{value}{unit}</span>
    </Row>
  );
}
