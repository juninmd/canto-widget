import { api, type AgendaItem, type AlertOutcome } from "../lib/api";
import { kindOf, toneOf } from "../lib/alerts";
import { t } from "../i18n";
import AlertActions from "./AlertActions";
import { summary, TONE } from "./AlertStrip";

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
  const dismiss = (outcome?: AlertOutcome) => {
    void api.alertClose(event.id, outcome).finally(onSettled);
    onGone(event.id);
  };
  return (
    <div className={`flex min-w-0 flex-col gap-2 rounded-xl border p-3 ${tone.card} ${className}`}>
      <div className="min-w-0">
        <p className={`text-[11px] uppercase tracking-widest ${tone.text}`}>{kind}</p>
        <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-fg">{event.title}</h2>
        {note !== kind && <p className="text-[11px] text-muted">{note}</p>}
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
    </div>
  );
}
