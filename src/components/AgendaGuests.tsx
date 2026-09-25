import type { Guest } from "../lib/api";
import { tally } from "../lib/agenda";
import { t } from "../i18n";
import Avatar from "./Avatar";
import { GUEST_ICON } from "./RsvpBadge";

/** Semantic tokens, not the accent: in some skins the accent is red and "accepted" would read as a refusal. */
const TONE: Record<string, { card: string; text: string }> = {
  accepted: { card: "border-ok/40 bg-ok/5", text: "text-ok" },
  declined: { card: "border-edge bg-ink/40 opacity-60", text: "text-danger" },
  tentative: { card: "border-warn/40 bg-warn/5", text: "text-warn" },
};
const PENDING = { card: "border-edge bg-ink/60", text: "text-muted" };

/** Who's invited and how each one answered, as mini cards; `total` counts guests Rust left off the capped list. */
export default function AgendaGuests({ guests, total }: { guests: Guest[]; total: number }) {
  if (guests.length === 0) return null;
  const hidden = total - guests.length;
  return (
    <section aria-label={t("agenda.guestList")} className="space-y-1.5">
      <p className="text-faint">{t("agenda.guestTally", tally(guests))}</p>
      <ul className="grid max-h-56 grid-cols-2 gap-1.5 overflow-y-auto pr-1">
        {guests.map((g) => {
          const answer = t(`agenda.guest.${g.response || "needsAction"}`);
          const tone = TONE[g.response] ?? PENDING;
          const tags = [
            g.organizer && t("agenda.guest.organizer"),
            g.optional && t("agenda.guest.optional"),
            g.me && t("agenda.guest.me"),
          ].filter((tag): tag is string => Boolean(tag));
          return (
            <li
              key={g.email || g.name}
              title={g.email}
              data-response={g.response || "needsAction"}
              className={`flex min-w-0 items-center gap-2 rounded-lg border p-1.5 ${tone.card}`}
            >
              <Avatar name={g.name} email={g.email} size="md" />
              <span className="flex min-w-0 flex-col">
                <span className={`truncate text-[11px] font-semibold ${g.response === "declined" ? "text-faint line-through" : "text-fg"}`}>
                  {g.name}
                </span>
                <span className={`truncate text-[10px] font-medium ${tone.text}`}>
                  <span aria-hidden="true">{GUEST_ICON[g.response]} </span>
                  {answer}
                </span>
                {tags.length > 0 && (
                  <span className="flex flex-wrap gap-1 pt-0.5">
                    {tags.map((tag) => (
                      <span key={tag} className="rounded bg-edge px-1 text-[9px] leading-4 text-muted">
                        {tag}
                      </span>
                    ))}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
      {hidden > 0 && <p className="text-faint">{t("agenda.guestsMore", { n: hidden })}</p>}
    </section>
  );
}
