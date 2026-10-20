import { forwardRef, useState } from "react";
import { api, type AgendaItem, type AlertOutcome } from "../lib/api";
import { kindOf, STATUS_PREFIX } from "../lib/alerts";
import { TASK_PREFIX } from "../lib/reminders";
import { t } from "../i18n";
import SnoozeButton from "./SnoozeButton";

type Props = {
  event: AgendaItem;
  onDismiss: (outcome?: AlertOutcome) => void;
  /** Leaves the overlay without telling Rust, for when Rust already dropped the alert (a snooze). */
  onHide: () => void;
  /** Every alert leaves at once; with it the close button grows a chevron for the queue. */
  onCloseAll?: () => void;
  onCompleted?: () => void;
  onOpenModels?: () => void;
};

const PRIMARY = "min-w-24 flex-[1.6] rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-on-accent";
const SECONDARY = "flex-1 rounded-lg bg-edge px-3 py-2 text-sm text-fg";

/** Buttons change with the kind of alert: only calendar events and tasks can be snoozed, only services muted. */
const AlertActions = forwardRef<HTMLButtonElement, Props>(function AlertActions(
  { event, onDismiss, onHide, onCloseAll, onCompleted, onOpenModels },
  primary,
) {
  const [menu, setMenu] = useState(false);
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
    <div className="flex gap-2">
      {kind === "task" && (
        <button
          ref={primary}
          type="button"
          onClick={() => void api.taskComplete(event.id.slice(TASK_PREFIX.length)).then(onCompleted).finally(() => onDismiss("done"))}
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
      {onCloseAll ? <CloseWithAll onClose={() => onDismiss()} onCloseAll={onCloseAll} open={menu} setOpen={setMenu} /> : (
        <button type="button" onClick={() => onDismiss()} title="Esc" className="rounded-lg px-3 py-2 text-sm text-muted hover:bg-edge hover:text-fg">
          {t("alert.close")}
        </button>
      )}
    </div>
  );
});

/** "fechar" with a chevron that opens the one other way out: closing the whole queue at once. */
function CloseWithAll({
  onClose,
  onCloseAll,
  open,
  setOpen,
}: {
  onClose: () => void;
  onCloseAll: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  // Esc closes the menu first; the overlay's own Esc (close one alert) only gets it with the menu shut.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && open) {
      e.stopPropagation();
      setOpen(false);
    }
  };
  return (
    <div
      className="relative flex"
      onKeyDown={onKeyDown}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && setOpen(false)}
    >
      <button type="button" onClick={onClose} title="Esc" className="rounded-l-lg bg-edge px-3 py-2 text-sm text-muted">
        {t("alert.close")}
      </button>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("alert.closeMore")}
        className="rounded-r-lg border-l border-panel bg-edge px-2 text-xs text-muted"
      >
        <span aria-hidden="true">▾</span>
      </button>
      {open && (
        <div role="menu" className="absolute bottom-full right-0 z-10 mb-1 flex flex-col overflow-hidden rounded-lg border border-line bg-panel shadow-lg">
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onCloseAll();
            }}
            className="whitespace-nowrap px-4 py-2 text-left text-sm text-fg hover:bg-edge"
          >
            {t("alert.closeAll")}
          </button>
        </div>
      )}
    </div>
  );
}

export default AlertActions;
