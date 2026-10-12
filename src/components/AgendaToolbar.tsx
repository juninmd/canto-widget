import { t } from "../i18n";
import { clockLabel } from "../lib/clockLabel";
import Spinner from "./Spinner";

type Props = { isToday: boolean; loading: boolean; fetchedAt?: number | null; onTestAlert: () => void; onRefresh: () => void };

const BTN = "canto-hit inline-flex min-h-[24px] items-center gap-1 rounded-md px-1.5 hover:bg-hover hover:text-fg active:bg-active disabled:opacity-60";

export default function AgendaToolbar({ isToday, loading, fetchedAt, onTestAlert, onRefresh }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-2 text-[11px] text-faint">
      <span className="min-w-0">
        {isToday ? t("agenda.header") : ""}
        {fetchedAt ? `${isToday ? " · " : ""}${t("common.updatedAt", { time: clockLabel(fetchedAt) })}` : ""}
      </span>
      <span className="flex gap-0.5">
        <button type="button" title={t("agenda.testAlertTitle")} onClick={onTestAlert} className={BTN}>
          {t("agenda.testAlert")}
        </button>
        <button type="button" aria-busy={loading} disabled={loading} onClick={onRefresh} className={BTN}>
          {loading && <Spinner />}
          {t("agenda.refresh")}
        </button>
      </span>
    </div>
  );
}
