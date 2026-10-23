import type { CSSProperties } from "react";
import type { Contact } from "../lib/api";
import { avatarTone } from "../lib/agenda";
import { ageToday, whatsappLink } from "../lib/contactExtras";
import { initials } from "../lib/google";
import { t } from "../i18n";
import { MINI } from "./ContactDetails";

type Props = { people: Contact[]; today: Date; onOpen: (url: string) => void; onShow: (id: string) => void };

/** Today's birthdays on top of the address book, each with a WhatsApp greeting already typed when there is a number. */
export default function ContactBirthdays({ people, today, onOpen, onShow }: Props) {
  if (people.length === 0) return null;
  return (
    <section
      aria-label={t("contacts.birthdays.title")}
      data-birthdays
      className="wx-glass wx-rise shrink-0 bg-gradient-to-br from-warn/15 via-warn/5 to-transparent p-3"
    >
      <h3 className="flex items-center gap-1.5 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-warn">
        <span aria-hidden="true" className="canto-wiggle inline-block text-sm">🎂</span>
        {t("contacts.birthdays.title")}
        <span className="tabular-nums opacity-70">{people.length}</span>
      </h3>
      <ul className="flex flex-col gap-1.5">
        {people.map((contact, i) => {
          const age = ageToday(contact, today);
          const first = contact.nickname || contact.name.split(/\s+/)[0];
          const wa = contact.phones.map((p) => whatsappLink(p, t("contacts.birthdays.greet", { name: first }))).find(Boolean);
          return (
            <li key={contact.id} className="canto-pop flex items-center gap-2.5" style={{ "--i": i } as CSSProperties}>
              <button type="button" onClick={() => onShow(contact.id)} className="canto-hit flex min-w-0 flex-1 items-center gap-2.5 text-left">
                <span
                  aria-hidden="true"
                  className={`canto-glow grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-bold text-fg ring-2 ring-warn/60 ${avatarTone(contact.emails[0] ?? contact.name)}`}
                >
                  {initials(contact.name)}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-xs font-semibold text-fg">{contact.name}</span>
                  {age !== null && <span className="text-[11px] text-muted">{t("contacts.birthdays.age", { age })}</span>}
                </span>
              </button>
              {wa && (
                <button
                  type="button"
                  aria-label={t("contacts.greet", { name: contact.name })}
                  onClick={() => onOpen(wa)}
                  className={`${MINI} shrink-0 bg-ok/15 text-ok hover:bg-ok/25`}
                >
                  {t("contacts.greetShort")}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
