import type { Rsvp } from "../lib/api";
import { t } from "../i18n";

const LOOK: Record<Rsvp, { icon: string; tone: string }> = {
  accepted: { icon: "✓", tone: "border-ok/60 text-ok" },
  declined: { icon: "✕", tone: "border-danger/60 text-danger line-through" },
  tentative: { icon: "?", tone: "border-warn/60 text-warn" },
  needsAction: { icon: "•", tone: "border-line text-muted" },
};

/** The user's own answer to the invite, with an icon so color isn't the only signal. */
export default function RsvpBadge({ response }: { response: Rsvp }) {
  const { icon, tone } = LOOK[response];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-1.5 text-[10px] font-semibold ${tone}`}>
      <span aria-hidden="true">{icon}</span>
      {t(`agenda.rsvp.${response}`)}
    </span>
  );
}

export const GUEST_ICON: Record<Rsvp | "", string> = { accepted: "✓", declined: "✕", tentative: "?", needsAction: "•", "": "•" };
