import type { CSSProperties } from "react";
import type { Contact } from "../../lib/api";
import DataTable, { type Column } from "../../components/DataTable";
import { t } from "../../i18n";
import ContactAvatar from "./ContactAvatar";
import { birthdayLabel } from "./contactExtras";
import { subtitle } from "./contacts";

type Props = { contacts: Contact[]; photos: Record<string, string>; open: string; onToggle: (id: string) => void };

/** Contacts as cards with a big avatar; the open one gets its details under the grid, full width. */
export function ContactGrid({ contacts, photos, open, onToggle }: Props) {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-2">
      {contacts.map((contact, i) => (
        <li key={contact.id} data-contact={contact.id} className="wx-rise" style={{ "--i": Math.min(i, 12) } as CSSProperties}>
          <button
            type="button"
            aria-expanded={open === contact.id}
            onClick={() => onToggle(contact.id)}
            className={`canto-hit flex w-full flex-col items-center gap-1.5 rounded-xl border p-2.5 text-center hover:bg-hover ${open === contact.id ? "border-accent/60 bg-accent/10" : "border-edge bg-ink/60"}`}
          >
            <ContactAvatar contact={contact} photos={photos} className="size-11" />
            <span className="w-full truncate text-xs font-semibold text-fg">
              {contact.starred && <span className="text-warn">★ </span>}
              <span>{contact.name}</span>
            </span>
            <span className="w-full truncate text-[11px] text-muted">{subtitle(contact)}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function contactColumns(onToggle: (id: string) => void): Column<Contact>[] {
  return [
    {
      key: "name",
      label: t("contacts.col.name"),
      render: (c) => (
        <button type="button" data-contact={c.id} onClick={() => onToggle(c.id)} className="canto-hit max-w-full truncate text-left font-medium text-fg hover:underline">
          {c.starred && <span className="text-warn">★ </span>}
          <span>{c.name}</span>
        </button>
      ),
      sort: (c) => c.name,
    },
    { key: "email", label: t("contacts.col.email"), render: (c) => c.emails[0] ?? "—", sort: (c) => c.emails[0] ?? "" },
    { key: "phone", label: t("contacts.col.phone"), render: (c) => c.phones[0] ?? "—", sort: (c) => c.phones[0] ?? "" },
    { key: "org", label: t("contacts.col.org"), render: (c) => c.org || "—", sort: (c) => c.org },
    {
      key: "birthday",
      label: t("contacts.col.birthday"),
      render: (c) => birthdayLabel(c) || "—",
      sort: (c) => (c.birthday ? c.birthday.month * 100 + c.birthday.day : 9999),
    },
  ];
}

export function ContactTable({ contacts, onToggle }: Pick<Props, "contacts" | "onToggle">) {
  return <DataTable label={t("contacts.tab")} columns={contactColumns(onToggle)} rows={contacts} rowKey={(c) => c.id} />;
}
