import { forwardRef } from "react";
import { api, type AgendaItem } from "../lib/api";
import { kindOf, STATUS_PREFIX } from "../lib/alerts";
import { TASK_PREFIX } from "../lib/reminders";
import { t } from "../i18n";

const SNOOZE_OPTIONS = [1, 5, 10];

type Props = {
  event: AgendaItem;
  onDismiss: () => void;
  /** Leaves the overlay without telling Rust, for when Rust already dropped the alert (a snooze). */
  onHide: () => void;
  onCompleted?: () => void;
  onOpenModels?: () => void;
};

const PRIMARY = "flex-[1.6] rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-on-accent";
const SECONDARY = "flex-1 rounded-lg bg-edge px-3 py-2 text-sm text-fg";

/** Buttons change with the kind of alert: only calendar events and tasks can be snoozed, only services muted. */
const AlertActions = forwardRef<HTMLButtonElement, Props>(function AlertActions(
  { event, onDismiss, onHide, onCompleted, onOpenModels },
  primary,
) {
  const kind = kindOf(event);
  const open = (url: string) => () => void api.openLink(url);
  const snooze = (minutes: number) => () => void api.alertSnooze(event.id, minutes).then(onHide, onDismiss);
  const mute = async () => {
    try {
      const watched = await api.statusAlertsGet();
      await api.statusAlertsSet(watched.filter((id) => id !== event.id.slice(STATUS_PREFIX.length)));
    } finally {
      onDismiss();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {(kind === "meeting" || kind === "task") && (
        <div role="group" aria-label={t("alert.snoozeLabel")} className="flex items-center gap-2">
          <span className="text-xs text-faint">{t("alert.snoozeLabel")}</span>
          {SNOOZE_OPTIONS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={snooze(m)}
              aria-label={t("alert.snooze", { minutes: m })}
              className="flex-1 rounded-lg bg-edge px-2 py-1.5 text-sm text-fg"
            >
              {t("alert.snoozeOption", { minutes: m })}
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        {kind === "task" && (
          <button
            ref={primary}
            type="button"
            onClick={() => void api.taskComplete(event.id.slice(TASK_PREFIX.length)).then(onCompleted).finally(onDismiss)}
            className={PRIMARY}
          >
            {t("alert.completeTask")}
          </button>
        )}
        {kind === "pr" && event.link && (
          <button
            ref={primary}
            type="button"
            onClick={() => {
              open(event.link)();
              onDismiss();
            }}
            className={PRIMARY}
          >
            {t("alert.openPr")}
          </button>
        )}
        {kind === "meeting" && event.meet && (
          <button
            ref={primary}
            type="button"
            onClick={() => {
              void api.openLink(event.meet);
              onDismiss();
            }}
            className={PRIMARY}
          >
            {t("alert.joinMeet")}
          </button>
        )}
        {kind === "status" && event.link && (
          <button ref={primary} type="button" onClick={open(event.link)} className={PRIMARY}>
            {t("alert.openStatus")}
          </button>
        )}
        {kind === "model" && onOpenModels && (
          <button
            ref={primary}
            type="button"
            onClick={() => {
              onOpenModels();
              onDismiss();
            }}
            className={PRIMARY}
          >
            {t("alert.openModels")}
          </button>
        )}
        {kind === "meeting" && event.link && (
          <button
            ref={event.meet ? undefined : primary}
            type="button"
            onClick={open(event.link)}
            className={event.meet ? SECONDARY : PRIMARY}
          >
            {t("alert.openCalendar")}
          </button>
        )}
        {kind === "status" && (
          <button type="button" onClick={() => void mute()} className={SECONDARY}>
            {t("alert.silence")}
          </button>
        )}
        <button type="button" onClick={onDismiss} title="Esc" className="rounded-lg bg-edge px-3 py-2 text-sm text-muted">
          {t("alert.close")}
        </button>
      </div>
    </div>
  );
});

export default AlertActions;
