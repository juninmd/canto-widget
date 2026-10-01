import type { Guest } from "../lib/api";
import { t } from "../i18n";
import { GUEST_ICON } from "./RsvpBadge";

const TEXT: Record<string, string> = { accepted: "text-ok", declined: "text-danger", tentative: "text-warn" };

/** Every listed guest with their answer; the box scrolls when the card is too short for all of them. */
export default function AlertGuests({ guests, total }: { guests: Guest[]; total: number }) {
  const hidden = total - guests.length;
  return (
    <>
      <ul className="mt-1 space-y-0.5">
        {guests.map((g) => (
          <li key={g.email || g.name} title={g.email} className="flex min-w-0 items-center gap-1.5 text-xs">
            <span aria-hidden="true" className={`w-3 shrink-0 text-center ${TEXT[g.response] ?? "text-muted"}`}>
              {GUEST_ICON[g.response || "needsAction"]}
            </span>
            <span className={`truncate ${g.response === "declined" ? "text-faint line-through" : "text-fg"}`}>
              {g.name || g.email}
            </span>
          </li>
        ))}
      </ul>
      {hidden > 0 && <p className="mt-1 text-xs text-faint">{t("agenda.guestsMore", { n: hidden })}</p>}
    </>
  );
}
