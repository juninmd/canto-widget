type Props<K extends string> = { label: string; tabs: { key: K; label: string }[]; value: K; onChange: (key: K) => void };

/** The small segmented switch under a tab's header (Status API, GitHub, GitLab). */
export default function SubTabs<K extends string>({ label, tabs, value, onChange }: Props<K>) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-0.5 self-start rounded-xl border border-edge bg-ink/60 p-0.5 text-xs">
      {tabs.map((s) => (
        <button
          key={s.key}
          type="button"
          role="tab"
          aria-selected={value === s.key}
          onClick={() => onChange(s.key)}
          className={`canto-hit min-h-7 rounded-lg px-3 transition-colors ${value === s.key ? "bg-raised font-semibold text-accent-text shadow-[var(--shadow-raised)]" : "text-muted hover:bg-hover hover:text-fg active:bg-active"}`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
