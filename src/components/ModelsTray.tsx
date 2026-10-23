import { SERIES } from "../lib/modelsCompare";
import { t } from "../i18n";

/** Pinned under the ranking while models are picked: their colors, the count, and the way into Comparar. */
export default function ModelsTray({ ids, onGo }: { ids: readonly string[]; onGo: () => void }) {
  return (
    <div className="sticky bottom-0 mt-2 flex items-center gap-2 bg-gradient-to-t from-panel from-60% to-transparent pt-3 text-[11px] text-muted">
      <span className="flex" aria-hidden="true">
        {ids.map((id, k) => (
          <i key={id} className="-ml-1 size-4 rounded-full border-2 border-panel first:ml-0" style={{ background: SERIES[k] }} />
        ))}
      </span>
      <span>{ids.length === 1 ? t("models.tray.one") : t("models.tray.many", { n: ids.length })}</span>
      <button
        type="button"
        disabled={ids.length < 2}
        onClick={onGo}
        className="canto-hit ml-auto min-h-7 rounded-lg bg-accent px-3 font-semibold text-on-accent disabled:opacity-50"
      >
        {t("models.tray.go")} →
      </button>
    </div>
  );
}
