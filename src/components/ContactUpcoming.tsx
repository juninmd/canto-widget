import type { CSSProperties } from "react";
import type { Contact } from "../lib/api";
import { t } from "../i18n";
import ContactAvatar from "./ContactAvatar";

type Props = { people: { contact: Contact; in: number }[]; photos: Record<string, string>; onShow: (id: string) => void };

/** The next birthdays as a row of avatars that pop in one after another, each with how many days are left. */
export default function ContactUpcoming({ people, photos, onShow }: Props) {
  if (people.length === 0) return null;
  return (
    <section aria-label={t("contacts.upcoming.title")} data-upcoming className="wx-glass wx-rise shrink-0 p-3">
      <h3 className="pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted">{t("contacts.upcoming.title")}</h3>
      <ul className="flex gap-2 overflow-x-auto pb-0.5">
        {people.map(({ contact, in: days }, i) => (
          <li key={contact.id} className="canto-stack shrink-0" style={{ "--i": i } as CSSProperties}>
            <button type="button" onClick={() => onShow(contact.id)} className="canto-hit flex w-14 flex-col items-center gap-1 rounded-lg p-1 hover:bg-hover">
              <ContactAvatar contact={contact} photos={photos} className="size-9 ring-2 ring-warn/40" />
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
