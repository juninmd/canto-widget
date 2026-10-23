import type { CSSProperties } from "react";
import type { Contact } from "../lib/api";
import { avatarTone } from "../lib/agenda";
import { initials } from "../lib/google";
import { t } from "../i18n";

type Props = { people: { contact: Contact; in: number }[]; onShow: (id: string) => void };

/** The next birthdays as a row of avatars that pop in one after another, each with how many days are left. */
export default function ContactUpcoming({ people, onShow }: Props) {
  if (people.length === 0) return null;
  return (
    <section aria-label={t("contacts.upcoming.title")} data-upcoming className="wx-glass wx-rise shrink-0 p-3">
      <h3 className="pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted">{t("contacts.upcoming.title")}</h3>
      <ul className="flex gap-2 overflow-x-auto pb-0.5">
        {people.map(({ contact, in: days }, i) => (
          <li key={contact.id} className="canto-stack shrink-0" style={{ "--i": i } as CSSProperties}>
            <button type="button" onClick={() => onShow(contact.id)} className="canto-hit flex w-14 flex-col items-center gap-1 rounded-lg p-1 hover:bg-hover">
              <span
                aria-hidden="true"
                className={`grid size-9 place-items-center rounded-full text-[11px] font-bold text-fg ring-2 ring-warn/40 ${avatarTone(contact.emails[0] ?? contact.name)}`}
              >
                {initials(contact.name)}
              </span>
              <span className="w-full truncate text-center text-[10px] text-fg">{contact.nickname || contact.name.split(/\s+/)[0]}</span>
              <span className="whitespace-nowrap text-[10px] tabular-nums text-warn">
                {days === 1 ? t("contacts.upcoming.tomorrow") : t("contacts.upcoming.in", { n: days })}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
