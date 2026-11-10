/** A row of pill toggles where one is on; `count` is shown beside the label when given. */
export default function SteamChips<K extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: K;
  onChange: (key: K) => void;
  options: { key: K; label: string; count?: number }[];
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          aria-pressed={value === o.key}
          onClick={() => onChange(o.key)}
          className={`canto-hit inline-flex items-center gap-1 rounded-full border px-2.5 text-[11px] transition-colors ${
            value === o.key
              ? "border-accent bg-accent font-semibold text-on-accent"
              : "border-edge bg-ink text-muted hover:border-line hover:text-fg"
          }`}
        >
          {o.label}
          {o.count !== undefined && <span className="font-mono text-[10px] opacity-80">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}
