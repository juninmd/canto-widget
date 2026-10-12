import { useRef, useState } from "react";
import { api, errText, type AgendaItem, type AlertOutcome } from "../lib/api";
import { kindOf, toneOf } from "../lib/alerts";
import { t } from "../i18n";
import AlertActions from "./AlertActions";
import SenderLine from "./SenderLine";
import { summary, TONE } from "./AlertStrip";
import ErrorBanner from "./ErrorBanner";

type Props = {
  event: AgendaItem;
  /** The alert left the list: closed here, or handed back to Rust (a snooze). */
  onGone: (id: string) => void;
  onCompleted: () => void;
  onOpenModels: () => void;
  /** Rust has handled a close; the column reads the log again from here. */
  onSettled?: () => void;
  className?: string;
};

/** One alert with the same actions as the pop-up; the focused banner and the notifications column both use it. */
export default function AlertCard({ event, onGone, onCompleted, onOpenModels, onSettled, className = "" }: Props) {
  const tone = TONE[toneOf(event)];
  const kind = t(`alert.kind.${kindOf(event)}`);
  // A task reminder's summary repeats its kind; say it once.
  const note = summary(event);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const outcome = useRef<AlertOutcome | undefined>(undefined);
  // The card only leaves once Rust has closed the alert; a failure keeps it here with the reason and a retry.
  const dismiss = async (next?: AlertOutcome) => {
    outcome.current = next;
    setBusy(true);
    try {
      await api.alertClose(event.id, next);
      setError("");
      onGone(event.id);
    } catch (e) {
      setError(t("notif.closeFailed", { error: errText(e) }));
    } finally {
      setBusy(false);
      onSettled?.();
    }
  };
  return (
    <div className={`flex min-w-0 flex-col gap-2 rounded-xl border p-3 ${tone.card} ${className}`}>
      <div className="min-w-0">
        <p className={`text-[11px] uppercase tracking-widest ${tone.text}`}>{kind}</p>
        <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-fg">{event.title}</h2>
        {event.sender ? <SenderLine sender={event.sender} /> : note !== kind && <p className="text-[11px] text-muted">{note}</p>}
      </div>
      <AlertActions
        event={event}
        onDismiss={dismiss}
        onHide={() => {
          onGone(event.id);
          onSettled?.();
        }}
        onCompleted={onCompleted}
        onOpenModels={onOpenModels}
      />
      {error && <ErrorBanner message={error} busy={busy} onRetry={() => void dismiss(outcome.current)} />}
    </div>
  );
}
