import { CLIP_KINDS, KIND_LABEL, type ClipKind } from "../lib/clip";
import { t } from "../i18n";

export type KindFilter = ClipKind | "all";

const CHIP = "canto-hit inline-flex min-h-[28px] items-center gap-1.5 rounded-full border px-2.5 text-[11.5px] transition-colors";

/** Filter by type with the count of what is loaded; a type with nothing in it hides unless it is the active one. */
export default function ClipKindChips({ counts, total, value, onChange }: { counts: Record<ClipKind, number>; total: number; value: KindFilter; onChange: (k: KindFilter) => void }) {
  const chips: [KindFilter, string, number][] = [["all", t("clipui.chipAll"), total], ...CLIP_KINDS.filter((k) => counts[k] > 0 || k === value).map((k): [KindFilter, string, number] => [k, KIND_LABEL[k], counts[k]])];
  return (
    <div role="group" aria-label={t("clipboard.kindFilterLabel")} className="flex flex-wrap gap-1.5">
      {chips.map(([k, label, n]) => (
        <button
          key={k}
          type="button"
          aria-pressed={value === k}
          onClick={() => onChange(k)}
          className={`${CHIP} ${value === k ? "border-accent/60 bg-accent/10 font-semibold text-accent-text" : "border-edge text-muted hover:bg-hover hover:text-fg active:bg-active"}`}
        >
          <span className="first-letter:uppercase">{label}</span>{" "}
          <span className="font-mono tabular-nums text-faint">{n}</span>
        </button>
      ))}
    </div>
  );
}
