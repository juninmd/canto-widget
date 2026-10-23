import type { GmailAction } from "../lib/api";
import { t } from "../i18n";
import { MINI } from "./GmailRow";

type Props = { count: number; total: number; onAll: () => void; onClear: () => void; onAct: (action: GmailAction) => void };

/** Rises from the bottom while mail is selected: the same actions as a row, for all of them at once. */
export default function GmailBulkBar({ count, total, onAll, onClear, onAct }: Props) {
  return (
    <div
      role="toolbar"
      aria-label={t("gmail.selected", { n: count })}
      className="canto-bar-up wx-glass sticky bottom-0 z-10 flex shrink-0 flex-wrap items-center gap-1 border border-accent/40 bg-panel/95 p-2 backdrop-blur"
    >
      <span key={count} className="canto-roll mr-auto text-[11px] font-semibold text-accent-text">{t("gmail.selected", { n: count })}</span>
      {count < total && (
        <button type="button" className={`${MINI} bg-edge/60 hover:bg-hover`} onClick={onAll}>
          {t("gmail.selectAll")}
        </button>
      )}
      <button type="button" className={`${MINI} bg-accent/15 text-accent-text hover:bg-accent/25`} onClick={() => onAct("read")}>
        {t("gmail.markRead")}
      </button>
      <button type="button" className={`${MINI} bg-edge/60 hover:bg-hover`} onClick={() => onAct("archive")}>
        {t("gmail.archive")}
      </button>
      <button type="button" className={`${MINI} bg-edge/60 hover:bg-danger/20 hover:text-danger`} onClick={() => onAct("trash")}>
        {t("gmail.trash")}
      </button>
      <button type="button" aria-label={t("gmail.clearSelection")} className={`${MINI} text-muted hover:bg-hover`} onClick={onClear}>
        ✕
      </button>
    </div>
  );
}
