import type { Rsvp, RsvpAnswer } from "../../lib/api";
import { t } from "../../i18n";

const OPTIONS: { answer: RsvpAnswer; icon: string; tone: string }[] = [
  { answer: "accepted", icon: "✓", tone: "border-ok/60 text-ok" },
  { answer: "tentative", icon: "?", tone: "border-warn/60 text-warn" },
  { answer: "declined", icon: "✕", tone: "border-danger/60 text-danger" },
];

type Props = { current: Rsvp; busy?: boolean; onAnswer: (answer: RsvpAnswer) => void };

/** Accept, maybe or decline: the user's current answer is pressed, and a click on it does nothing. */
export default function RsvpActions({ current, busy = false, onAnswer }: Props) {
  return (
    <div role="group" aria-label={t("agenda.respond")} className="mt-1.5 flex flex-wrap items-center gap-1.5">
      {OPTIONS.map(({ answer, icon, tone }) => {
        const pressed = current === answer;
        return (
          <button
            key={answer}
            type="button"
            aria-pressed={pressed}
            disabled={busy || pressed}
            onClick={() => onAnswer(answer)}
            className={`inline-flex min-h-7 items-center gap-1 rounded-full border px-2.5 text-[11px] font-semibold transition hover:bg-hover disabled:cursor-default ${tone} ${pressed ? "bg-edge" : ""} ${busy && !pressed ? "opacity-50" : ""}`}
          >
            <span aria-hidden="true">{icon}</span>
            {t(`agenda.respond.${answer}`)}
          </button>
        );
      })}
    </div>
  );
}
