import { api, type AgendaItem, type ResolvedAlert } from "../lib/api";
import { outcomeLabel, resolvedToday, toneOf } from "../lib/alerts";
import { LOCALE, t } from "../i18n";
import AlertCard from "./AlertCard";
import { TONE } from "./AlertStrip";
import { CheckIcon } from "./Icons";

const SHOWN = 8;
const heading = "flex items-center gap-2 text-[10px] uppercase tracking-widest text-faint";
const count = "inline-flex h-4 min-w-4 items-center justify-center rounded-md bg-edge/70 px-1 text-[10px] tabular-nums text-muted";

type Props = {
  alerts: AgendaItem[];
  log: ResolvedAlert[];
  onGone: (id: string) => void;
  /** Re-reads the alerts and the log after Rust handled a close or a snooze. */
  onRefresh: () => void;
  onCompleted: () => void;
  onOpenModels: () => void;
};

/** The extra column of the maximized mode: what is pending, with its actions, and what was handled today. */
export default function NotificationsColumn({ alerts, log, onGone, onRefresh, onCompleted, onOpenModels }: Props) {
  const done = resolvedToday(log);

  function dismissAll() {
    for (const a of alerts) {
      void api.alertClose(a.id).finally(onRefresh);
      onGone(a.id);
    }
  }

  return (
    <aside
      aria-label={t("notif.title")}
      className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-y-auto p-3 motion-safe:animate-entrar motion-reduce:animate-fade"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className={heading}>
          {t("notif.title")} <span className={count}>{alerts.length}</span>
        </h2>
        {alerts.length > 1 && (
          <button
            type="button"
            onClick={dismissAll}
            className="canto-hit min-h-[24px] whitespace-nowrap rounded-md px-1.5 text-[11px] text-muted hover:bg-hover hover:text-fg active:bg-active"
          >
            {t("notif.dismissAll")}
          </button>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-edge bg-ink/60 p-3 text-xs text-muted">
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent/15 text-accent-text">
            <CheckIcon />
          </span>
          <span>
            {t("notif.empty")}
            <span className="block text-[11px] text-faint">{t("notif.emptyHint")}</span>
          </span>
        </div>
      ) : (
        <ul aria-label={t("notif.pending")} className="flex flex-col gap-2">
          {alerts.map((e) => (
            <li key={e.id} className="motion-safe:animate-surgir motion-reduce:animate-fade">
              <AlertCard event={e} onGone={onGone} onSettled={onRefresh} onCompleted={onCompleted} onOpenModels={onOpenModels} />
            </li>
          ))}
        </ul>
      )}

      <h2 className={`${heading} mt-2`}>
        {t("notif.resolved")} <span className={count}>{done.length}</span>
      </h2>
      {done.length === 0 ? (
        <p className="text-xs text-muted">{t("notif.resolvedEmpty")}</p>
      ) : (
        <ul className="flex flex-col">
          {done.slice(0, SHOWN).map((r, i) => (
            <li key={`${r.item.id}-${r.at}-${i}`} className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-xs hover:bg-hover">
              <span
                aria-hidden="true"
                className={`grid size-5 shrink-0 place-items-center rounded-full bg-edge/70 ${r.outcome === "done" ? TONE[toneOf(r.item)].text : "text-faint"}`}
              >
                <CheckIcon />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-muted">{r.item.title}</span>
                <span className="block text-[11px] text-faint">{outcomeLabel(r.item, r.outcome)}</span>
              </span>
              <time dateTime={new Date(r.at).toISOString()} className="shrink-0 text-[11px] tabular-nums text-faint">
                {new Date(r.at).toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" })}
              </time>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
