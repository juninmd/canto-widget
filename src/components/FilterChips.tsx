import { t } from "../i18n";

export type Chip<K extends string> = { key: K; label: string; count?: number };

type Props<K extends string> = {
  /** Names the group for readers ("tipo", "estado"). */
  label?: string;
  /** Shown before the chips, as a small caption. */
  caption?: string;
  chips: readonly Chip<K>[];
  /** `null` means "all": no chip is pressed and the first one (the "all" chip) is lit. */
  value: K | null;
  onChange: (key: K | null) => void;
  /** Text of the chip that clears the filter; omitted when the group needs no "all". */
  allLabel?: string;
  allCount?: number;
};

/** Pill filters with counts. Pressing the pressed chip again clears it, like the "all" chip. */
export default function FilterChips<K extends string>({ label, caption, chips, value, onChange, allLabel, allCount }: Props<K>) {
  const pill = (active: boolean) =>
    `canto-hit inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs transition-colors ${
      active ? "border-accent bg-accent/15 text-accent-text" : "border-edge bg-ink/60 text-muted hover:bg-hover hover:text-fg"
    }`;
  const count = (n?: number) => (n === undefined ? null : <span className="font-mono text-[10px] opacity-75">{n}</span>);
  return (
    <div role="group" aria-label={label ?? t("browse.filters")} className="flex flex-wrap items-center gap-1.5">
      {caption && <span className="text-[11px] text-faint">{caption}</span>}
      {allLabel && (
        <button type="button" aria-pressed={value === null} onClick={() => onChange(null)} className={pill(value === null)}>
          {allLabel}
          {count(allCount)}
        </button>
      )}
      {chips.map((chip) => (
        <button key={chip.key} type="button" aria-pressed={value === chip.key} onClick={() => onChange(value === chip.key ? null : chip.key)} className={pill(value === chip.key)}>
          {chip.label}
          {count(chip.count)}
        </button>
      ))}
    </div>
  );
}
