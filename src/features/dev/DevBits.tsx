import type { ReactNode } from "react";
import { useCopied } from "../../lib/useCopied";
import { t } from "../../i18n";
import { CheckIcon, CrossIcon, SearchIcon } from "../../components/Icons";

export const copyText = (text: string) => void navigator.clipboard?.writeText(text).catch(() => {});

/** A command or value to read and copy; the button says "copiado" for a moment. */
export function CopyLine({ text, label }: { text: string; label?: string }) {
  const [copied, flash] = useCopied();
  return (
    <div className="flex items-center gap-1 rounded-lg bg-ink/70 py-0.5 pl-2.5 pr-0.5 font-mono text-[11px] text-muted">
      <code className="min-w-0 flex-1 truncate select-all" title={text}>
        {text}
      </code>
      <button
        type="button"
        aria-label={label ?? t("dev.copy")}
        title={copied ? t("dev.copied") : t("dev.copy")}
        onClick={() => (copyText(text), flash(text))}
        className="canto-hit grid size-7 shrink-0 place-items-center rounded-md text-faint hover:bg-hover hover:text-fg"
      >
        {copied ? <CheckIcon /> : <CopyGlyph />}
      </button>
    </div>
  );
}

export const CopyGlyph = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V6a1 1 0 0 1 1-1h9" />
  </svg>
);

export function SearchField({ value, onChange, placeholder, id }: { value: string; onChange: (v: string) => void; placeholder: string; id?: string }) {
  return (
    <label className="canto-field flex h-8 shrink-0 items-center gap-1.5 px-2.5 text-[12px] text-muted">
      <SearchIcon />
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && value && (e.stopPropagation(), onChange(""))}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-0 flex-1 bg-transparent text-fg outline-none placeholder:text-faint"
      />
      {value && (
        <button type="button" aria-label={t("dev.cancel")} onClick={() => onChange("")} className="canto-hit grid place-items-center rounded text-faint hover:text-fg">
          <CrossIcon />
        </button>
      )}
    </label>
  );
}

/** Numbers in one quiet line instead of a row of boxes. */
export function StatLine({ items }: { items: { text: string; tone?: "warn" | "danger" | "info" }[] }) {
  const tone = { warn: "text-warn", danger: "text-danger", info: "text-accent-text" };
  return (
    <p className="flex shrink-0 flex-wrap gap-x-3 text-[11.5px] text-muted tabular-nums">
      {items.map((i) => (
        <span key={i.text} className={i.tone ? tone[i.tone] : ""}>
          {i.text}
        </span>
      ))}
    </p>
  );
}

export function Chip({ on, onClick, children, label }: { on: boolean; onClick: () => void; children: ReactNode; label?: string }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={label}
      onClick={onClick}
      className={`canto-hit min-h-[24px] rounded-md px-2 text-[11.5px] font-medium transition-colors ${on ? "bg-accent/15 text-accent-text" : "text-muted hover:bg-hover hover:text-fg"}`}
    >
      {children}
    </button>
  );
}

export function IconButton({ label, onClick, children, danger = false, on = false, disabled = false }: { label: string; onClick: () => void; children: ReactNode; danger?: boolean; on?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`canto-hit grid size-7 shrink-0 place-items-center rounded-md transition-colors disabled:opacity-40 ${on ? "bg-accent/15 text-accent-text" : danger ? "text-faint hover:bg-danger/15 hover:text-danger" : "text-faint hover:bg-hover hover:text-fg"}`}
    >
      {children}
    </button>
  );
}

export function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={`relative h-[18px] w-8 shrink-0 rounded-full transition-colors ${on ? "bg-accent" : "bg-edge"}`}>
      <span className={`absolute top-0.5 size-3.5 rounded-full bg-fg transition-[left] ${on ? "left-[16px] bg-on-accent" : "left-0.5"}`} />
    </button>
  );
}

export const Row = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <li className={`flex min-h-12 items-center gap-2.5 border-b border-edge/60 px-0.5 py-2 text-[12px] last:border-b-0 hover:bg-hover/40 ${className}`}>{children}</li>
);

export const Sub = ({ children }: { children: ReactNode }) => <p className="mt-0.5 truncate text-[11px] text-faint">{children}</p>;

export const Section = ({ title, children, right }: { title: string; children: ReactNode; right?: ReactNode }) => (
  <section className="flex shrink-0 flex-col gap-1.5">
    <div className="flex items-center gap-2">
      <h3 className="flex-1 text-[10.5px] font-semibold uppercase tracking-wider text-faint">{title}</h3>
      {right}
    </div>
    {children}
  </section>
);

export const Panel = ({ children, className = "" }: { children: ReactNode; className?: string }) => <div className={`flex shrink-0 flex-col gap-2 rounded-xl bg-ink/50 p-2.5 ${className}`}>{children}</div>;
