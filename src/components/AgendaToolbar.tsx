import { t } from "../i18n";
import { clockLabel } from "../lib/clockLabel";
import AgendaRefreshIcon from "./AgendaRefreshIcon";
import ClipAgendaMenu from "./ClipAgendaMenu";
import Spinner from "./Spinner";

type Props = { loading: boolean; fetchedAt?: number | null; onTestAlert: () => void; onRefresh: () => void };

const ICON_BUTTON = "canto-hit grid h-[28px] w-[28px] shrink-0 place-items-center rounded-lg text-muted hover:bg-hover hover:text-fg active:bg-active disabled:opacity-60";

/** The right end of the agenda row: an icon to refresh and a "···" menu with the alert test and the reminder lead. */
export default function AgendaToolbar({ loading, fetchedAt, onTestAlert, onRefresh }: Props) {
  const updated = fetchedAt ? t("common.updatedAt", { time: clockLabel(fetchedAt) }) : "";
  return (
    <>
      <button
        type="button"
        aria-label={t("agenda.refresh")}
        title={updated ? `${t("agenda.refresh")} · ${updated}` : t("agenda.refresh")}
        aria-busy={loading}
        disabled={loading}
        onClick={onRefresh}
        className={ICON_BUTTON}
      >
        {loading ? <Spinner /> : <AgendaRefreshIcon />}
      </button>
      <ClipAgendaMenu
        label={t("agendaui.more")}
        actions={[{ label: t("agendaui.testAlert"), title: t("agenda.testAlertTitle"), onSelect: onTestAlert }]}
        footer={
          <>
            <span className="block">{t("agendaui.lead")}</span>
            {updated && <span className="block">{updated}</span>}
          </>
        }
      />
    </>
  );
}
