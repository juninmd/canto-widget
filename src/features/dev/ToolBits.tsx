import type { ReactNode } from "react";
import { t } from "../../i18n";
import { span } from "./tools";

export function Area({ id, value, onChange, label, rows = 4 }: { id: string; value: string; onChange: (v: string) => void; label: string; rows?: number }) {
  return (
    <label className="flex shrink-0 flex-col gap-1">
      <span className="text-[10.5px] font-semibold uppercase tracking-wider text-faint">{label}</span>
      <textarea id={id} value={value} rows={rows} spellCheck={false} onChange={(e) => onChange(e.target.value)} className="canto-field w-full resize-y px-2.5 py-2 font-mono text-[11.5px] leading-snug" />
    </label>
  );
}

export function Line({ id, value, onChange, label, placeholder }: { id: string; value: string; onChange: (v: string) => void; label: string; placeholder?: string }) {
  return (
    <label className="flex shrink-0 flex-col gap-1">
      <span className="text-[10.5px] font-semibold uppercase tracking-wider text-faint">{label}</span>
      <input id={id} value={value} placeholder={placeholder} spellCheck={false} onChange={(e) => onChange(e.target.value)} className="canto-field h-8 w-full px-2.5 font-mono text-[11.5px]" />
    </label>
  );
}

export const Label = ({ children }: { children: ReactNode }) => <p className="shrink-0 text-[10.5px] font-semibold uppercase tracking-wider text-faint">{children}</p>;

export const Note = ({ tone = "muted", children }: { tone?: "ok" | "danger" | "warn" | "muted"; children: ReactNode }) => (
  <span className={`text-[11.5px] font-medium ${{ ok: "text-ok", danger: "text-danger", warn: "text-warn", muted: "text-muted" }[tone]}`}>{children}</span>
);

/** "in 3 d" or "3 d ago", from a signed span in milliseconds. */
export function relative(ms: number): string {
  const { n, unit } = span(ms);
  return t(ms < 0 ? "dev.span.ago" : "dev.span.in", { x: t(`dev.span.${unit}`, { n }) });
}

export const Pre = ({ children, max = "max-h-48" }: { children: ReactNode; max?: string }) => (
  <pre className={`${max} shrink-0 overflow-auto rounded-lg bg-ink/80 p-2.5 font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-all text-fg`}>{children}</pre>
);
