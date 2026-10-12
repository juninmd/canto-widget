import { t } from "../i18n";
import { CrossIcon } from "./Icons";

/** Says which tag the list is narrowed to (set by clicking a card's tag) and clears it in one click. */
export default function NoteFilterChip({ query, total, onClear }: { query: string; total: number; onClear: () => void }) {
  if (!query.trim().startsWith("#") || query.trim().length < 2) return null;
  const tag = query.trim();
  return (
    <div className="flex items-center gap-2 text-[11px] text-muted">
      <span className="inline-flex items-center gap-1 rounded-md bg-edge py-0.5 pl-2 pr-0.5 text-fg">
        <span className="max-w-[20ch] truncate">{tag}</span>
        <button
          type="button"
          onClick={onClear}
          aria-label={t("notes.clearFilter", { tag })}
          title={t("notes.clearFilter", { tag })}
          className="canto-hit grid size-5 place-items-center rounded hover:bg-active hover:text-danger"
        >
          <CrossIcon />
        </button>
      </span>
      <span className="tabular-nums">{t("notes.filterCount", { n: total })}</span>
    </div>
  );
}
