import type { ReactNode } from "react";
import type { Contact } from "../lib/api";
import { birthdayLabel, whatsappLink } from "../lib/contactExtras";
import { t } from "../i18n";

export const MINI = "canto-hit rounded-md px-2 py-0.5 text-[11px]";
const WA = `${MINI} bg-ok/15 text-ok hover:bg-ok/25`;

type Props = { contact: Contact; onCopy: (value: string) => void; onOpen: (url: string) => void };

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-[4.75rem] shrink-0 pt-0.5 text-[10px] uppercase tracking-wider text-faint">{label}</span>
      <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">{children}</span>
    </div>
  );
}

const Value = ({ text, wrap = false }: { text: string; wrap?: boolean }) => (
  <span className={`min-w-0 flex-1 select-text text-xs text-fg ${wrap ? "whitespace-pre-line break-words" : "truncate"}`}>{text}</span>
);

/** Everything Google keeps about a contact, with copy, WhatsApp and link buttons where they make sense. */
export default function ContactDetails({ contact, onCopy, onOpen }: Props) {
  const copyButton = (value: string) => (
    <button type="button" aria-label={t("contacts.copy", { value })} onClick={() => onCopy(value)} className={`${MINI} bg-edge/60 hover:bg-hover`}>
      {t("contacts.copyShort")}
    </button>
  );
  const plain = (label: string, values: string[], wrap = false) =>
    values.filter(Boolean).map((value) => (
      <Row key={`${label}${value}`} label={label}>
        <Value text={value} wrap={wrap} />
      </Row>
    ));
  const hasMore = [contact.nickname, contact.department, contact.note, ...contact.addresses, ...contact.urls, ...contact.relations].some(Boolean);
  return (
    <div className="flex flex-col gap-1.5 bg-ink/40 px-3 pb-2.5 pt-1.5 motion-safe:animate-aba">
      {contact.emails.map((value) => (
        <Row key={value} label={t("contacts.email")}>
          <Value text={value} />
          {copyButton(value)}
        </Row>
      ))}
      {contact.phones.map((value) => {
        const wa = whatsappLink(value);
        return (
          <Row key={value} label={t("contacts.phone")}>
            <Value text={value} />
            {wa && (
              <button type="button" aria-label={t("contacts.whatsapp", { value })} onClick={() => onOpen(wa)} className={WA}>
                {t("contacts.whatsappShort")}
              </button>
            )}
            {copyButton(value)}
          </Row>
        );
      })}
      {plain(t("contacts.nickname"), [contact.nickname])}
      {plain(t("contacts.department"), [contact.department])}
      {contact.birthday && plain(t("contacts.birthday"), [birthdayLabel(contact)])}
      {contact.addresses.map((value) => (
        <Row key={value} label={t("contacts.address")}>
          <Value text={value} wrap />
          {copyButton(value)}
        </Row>
      ))}
      {contact.urls.map((url) => (
        <Row key={url} label={t("contacts.url")}>
          <button type="button" aria-label={t("contacts.openLink", { value: url })} onClick={() => onOpen(url)} className="canto-hit min-w-0 flex-1 truncate text-left text-xs text-accent-text hover:underline">
            {url}
          </button>
        </Row>
      ))}
      {plain(t("contacts.relation"), contact.relations)}
      {plain(t("contacts.note"), [contact.note], true)}
      {contact.emails.length + contact.phones.length === 0 && !hasMore && !contact.birthday && (
        <p className="text-[11px] text-faint">{t("contacts.noDetails")}</p>
      )}
      {contact.link && (
        <button type="button" onClick={() => onOpen(contact.link)} className={`${MINI} self-start bg-accent/15 text-accent-text hover:bg-accent/25`}>
          {t("contacts.open")}
        </button>
      )}
    </div>
  );
}
