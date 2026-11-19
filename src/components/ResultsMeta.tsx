import { t } from "../i18n";

/** "12 de 87" while a search or a filter hides some of the list, with the way back. Silent when nothing is hidden. */
export default function ResultsMeta({ shown, total, filtering, onClear }: { shown: number; total: number; filtering: boolean; onClear: () => void }) {
  if (!filtering) return null;
  return (
    <p role="status" className="flex items-center gap-2 px-0.5 text-[11px] text-faint">
      <span className="tabular-nums">{t("browse.count", { shown, total })}</span>
      <button type="button" onClick={onClear} className="canto-hit text-accent-text underline underline-offset-2 hover:brightness-110">
        {t("browse.clearFilters")}
      </button>
    </p>
  );
}
