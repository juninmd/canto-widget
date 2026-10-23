import { LOCALE } from "../i18n";
import type { Contact } from "./api";

export type ContactFilter = "all" | "starred" | "email" | "phone" | "birthday";

const plain = (text: string) => text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
const digits = (text: string) => text.replace(/\D/g, "");

/** Name, company, title, e-mail or phone, without caring for accents or case; digits match a phone however it is spaced. */
export function matchesContact(contact: Contact, query: string): boolean {
  const q = plain(query.trim());
  if (!q) return true;
  const text = plain([contact.name, contact.nickname, contact.org, contact.title, contact.department, ...contact.emails].join(" "));
  if (text.includes(q)) return true;
  const wanted = digits(q);
  return wanted.length >= 3 && contact.phones.some((phone) => digits(phone).includes(wanted));
}

export function filterContacts(items: Contact[], filter: ContactFilter, query: string): Contact[] {
  return items.filter((c) => {
    if (filter === "starred" && !c.starred) return false;
    if (filter === "email" && c.emails.length === 0) return false;
    if (filter === "phone" && c.phones.length === 0) return false;
    if (filter === "birthday" && !c.birthday) return false;
    return matchesContact(c, query);
  });
}

/** The heading a contact sits under: its first letter without accent, or "#" for digits and symbols. */
export function letterOf(name: string): string {
  const first = plain(name.trim()).charAt(0).toUpperCase();
  return /[A-Z]/.test(first) ? first : "#";
}

/** A to Z in the locale's order, with "#" last. */
export function groupByLetter(items: Contact[]): { letter: string; items: Contact[] }[] {
  const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name, LOCALE, { sensitivity: "base" }));
  const groups = new Map<string, Contact[]>();
  for (const contact of sorted) {
    const letter = letterOf(contact.name);
    groups.set(letter, [...(groups.get(letter) ?? []), contact]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => (a === "#" ? 1 : b === "#" ? -1 : a.localeCompare(b)))
    .map(([letter, list]) => ({ letter, items: list }));
}

/** "Diretora · Vértice", or whichever half exists; the first e-mail stands in when there is neither. */
export function subtitle(contact: Contact): string {
  return [contact.title, contact.org].filter(Boolean).join(" · ") || contact.emails[0] || contact.phones[0] || "";
}
