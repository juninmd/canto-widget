import { forwardRef } from "react";
import { api, type AgendaItem, type AlertOutcome } from "../lib/api";
import { kindOf, STATUS_PREFIX } from "../lib/alerts";
import { TASK_PREFIX } from "../lib/reminders";
import { t } from "../i18n";
import SnoozeButton from "./SnoozeButton";
import { CrossIcon } from "./Icons";

type Props = {
  event: AgendaItem;
  onDismiss: (outcome?: AlertOutcome) => void;
  /** Leaves the overlay without telling Rust, for when Rust already dropped the alert (a snooze). */
  onHide: () => void;
  /** Every alert leaves at once; with it a visible "fechar todos" joins the row. */
  onCloseAll?: () => void;
  /** How many alerts "fechar todos" takes with it. */
  count?: number;
  /** The pop-up has its own ✕ in the corner, so the row drops the "fechar" button. */
  hideClose?: boolean;
  onCompleted?: () => void;
  onOpenModels?: () => void;
};

const PRIMARY =
  "h-8 whitespace-nowrap rounded-lg bg-accent px-3 text-[13px] font-semibold text-on-accent shadow-md shadow-accent/30 transition hover:brightness-110";
const SECONDARY = "h-8 whitespace-nowrap rounded-lg bg-edge px-3 text-[13px] text-fg transition hover:brightness-125";

/** Buttons change with the kind of alert: only calendar events and tasks can be snoozed, only services muted. */
const AlertActions = forwardRef<HTMLButtonElement, Props>(function AlertActions(
  { event, onDismiss, onHide, onCloseAll, count, hideClose, onCompleted, onOpenModels },
  primary,
) {
  const kind = kindOf(event);
  const open = (url: string) => () => void api.openLink(url);
  const snooze = (minutes: number) => void api.alertSnooze(event.id, minutes).then(onHide, () => onDismiss());
  const mute = async () => {
    try {
      const watched = await api.statusAlertsGet();
      await api.statusAlertsSet(watched.filter((id) => id !== event.id.slice(STATUS_PREFIX.length)));
    } finally {
      onDismiss("muted");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {kind === "task" && (
        <button
          ref={primary}
          type="button"
          onClick={() =>
            void api
              .taskComplete(event.id.slice(TASK_PREFIX.length))
              .then(onCompleted)
              .finally(() => onDismiss("done"))
          }
          className={PRIMARY}
        >
          {t("alert.completeTask")}
        </button>
      )}
      {(kind === "pr" || kind === "mention") && event.link && (
        <button
          ref={primary}
          type="button"
          onClick={() => {
            open(event.link)();
            onDismiss("done");
          }}
          className={PRIMARY}
        >
          {t(kind === "pr" ? "alert.openPr" : "alert.openMention")}
        </button>
      )}
      {kind === "meeting" && event.meet && (
        <button
          ref={primary}
          type="button"
          onClick={() => {
            void api.openLink(event.meet);
            onDismiss("done");
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
            onDismiss("done");
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
      {(kind === "meeting" || kind === "task") && <SnoozeButton onSnooze={snooze} />}
      {onCloseAll && (
        <button
          type="button"
          onClick={onCloseAll}
          aria-label={t("alert.closeAll")}
          className="ml-auto flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg px-2 text-[13px] text-muted transition hover:bg-edge hover:text-fg"
        >
          <CrossIcon />
          {t("alert.closeAll")}
          {count ? <span className="font-mono text-[11px] text-faint">{count}</span> : null}
        </button>
      )}
      {!hideClose && (
        <button
          type="button"
          onClick={() => onDismiss()}
          title="Esc"
          className={`${onCloseAll ? "" : "ml-auto "}h-8 rounded-lg px-3 text-[13px] text-muted hover:bg-edge hover:text-fg`}
        >
          {t("alert.close")}
        </button>
      )}
    </div>
  );
});

export default AlertActions;
