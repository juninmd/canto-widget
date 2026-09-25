import type { Guest } from "../lib/api";
import { tally } from "../lib/agenda";
import { t } from "../i18n";
import Avatar from "./Avatar";
import { GUEST_ICON } from "./RsvpBadge";

const ICON_TONE: Record<string, string> = { accepted: "text-accent", declined: "text-danger", tentative: "text-amber-500" };

/** Who's invited and how each one answered; `total` counts guests Rust left off the capped list. */
export default function AgendaGuests({ guests, total }: { guests: Guest[]; total: number }) {
  if (guests.length === 0) return null;
  const hidden = total - guests.length;
  return (
    <section aria-label={t("agenda.guestList")} className="space-y-1">
      <p className="text-faint">{t("agenda.guestTally", tally(guests))}</p>
      <ul className="max-h-40 space-y-1 overflow-y-auto pr-1">
        {guests.map((g) => {
          const answer = t(`agenda.guest.${g.response || "needsAction"}`);
          const tags = [g.organizer && t("agenda.guest.organizer"), g.optional && t("agenda.guest.optional"), g.me && t("agenda.guest.me")].filter(Boolean);
          return (
            <li key={g.email || g.name} className="flex items-center gap-1.5" title={g.email}>
              <Avatar name={g.name} email={g.email} />
              <span className={`min-w-0 flex-1 truncate ${g.response === "declined" ? "text-faint line-through" : "text-fg"}`}>
                {g.name}
                {tags.length > 0 && <span className="text-faint"> · {tags.join(" · ")}</span>}
              </span>
              <span className={`shrink-0 font-semibold ${ICON_TONE[g.response] ?? "text-muted"}`} title={answer}>
                <span aria-hidden="true">{GUEST_ICON[g.response]}</span>
                <span className="sr-only">{answer}</span>
              </span>
            </li>
          );
        })}
      </ul>
      {hidden > 0 && <p className="text-faint">{t("agenda.guestsMore", { n: hidden })}</p>}
    </section>
  );
}
