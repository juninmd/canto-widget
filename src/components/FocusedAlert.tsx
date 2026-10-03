import { api, type AgendaItem } from "../lib/api";
import { kindOf, toneOf } from "../lib/alerts";
import { t } from "../i18n";
import AlertActions from "./AlertActions";
import { summary, TONE } from "./AlertStrip";

type Props = {
  event: AgendaItem;
  /** Rust drops the alert as well: closing here must not leave it ringing in the dock. */
  onGone: (id: string) => void;
  onCompleted: () => void;
  onOpenModels: () => void;
};

/** The alert the user came for, on top of the normal window, with the same actions as the pop-up. */
export default function FocusedAlert({ event, onGone, onCompleted, onOpenModels }: Props) {
  const tone = TONE[toneOf(event)];
  const dismiss = () => {
    void api.alertClose(event.id);
    onGone(event.id);
  };
  return (
    <section
      aria-label={t("app.focus.label")}
      className={`mx-3 mt-2 flex shrink-0 flex-col gap-2 rounded-xl border p-3 motion-safe:animate-surgir motion-reduce:animate-fade ${tone.card}`}
    >
      <div>
        <p className={`text-[11px] uppercase tracking-widest ${tone.text}`}>{t(`alert.kind.${kindOf(event)}`)}</p>
        <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-fg">{event.title}</h2>
        <p className="text-[11px] text-muted">{summary(event)}</p>
      </div>
      <AlertActions
        event={event}
        onDismiss={dismiss}
        onHide={() => onGone(event.id)}
        onCompleted={onCompleted}
        onOpenModels={onOpenModels}
      />
    </section>
  );
}
