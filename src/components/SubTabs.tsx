type Tab<K extends string> = { key: K; label: string; badge?: number; tone?: "hot" | "info" };
type Props<K extends string> = { label: string; tabs: Tab<K>[]; value: K; onChange: (key: K) => void };

/** The small segmented switch under a tab's header (Status API, GitHub, GitLab, Steam). */
export default function SubTabs<K extends string>({ label, tabs, value, onChange }: Props<K>) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex max-w-full shrink-0 gap-0.5 self-start overflow-x-auto rounded-xl border border-edge bg-ink/60 p-0.5 text-xs"
    >
      {tabs.map((s) => (
        <button
          key={s.key}
          type="button"
          role="tab"
          aria-selected={value === s.key}
          onClick={() => onChange(s.key)}
          className={`canto-hit min-h-7 shrink-0 whitespace-nowrap rounded-lg px-3 transition-colors ${value === s.key ? "bg-raised font-semibold text-accent-text shadow-[var(--shadow-raised)]" : "text-muted hover:bg-hover hover:text-fg active:bg-active"}`}
        >
          {s.label}
          {!!s.badge && (
            <span
              aria-hidden="true"
              className={`canto-pop ml-1 inline-grid h-3.5 min-w-3.5 place-items-center rounded-full px-1 align-[1px] text-[9px] font-bold ${s.tone === "hot" ? "steam-hot-badge" : "bg-[#66c0f4] text-black"}`}
            >
              {s.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
