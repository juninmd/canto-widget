import { LOCALE } from "../i18n";
import type { Contact } from "./api";

const leap = (year: number) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

/** A 29 February birthday is kept on the 28th when the year has no 29th. */
export function isBirthday(contact: Contact, today: Date): boolean {
  const b = contact.birthday;
  if (!b) return false;
  const month = today.getMonth() + 1;
  const day = b.month === 2 && b.day === 29 && !leap(today.getFullYear()) ? 28 : b.day;
  return b.month === month && day === today.getDate();
}

/** Who turns a year older today, by name. */
export const birthdaysToday = (items: Contact[], today: Date): Contact[] =>
  items.filter((c) => isBirthday(c, today)).sort((a, b) => a.name.localeCompare(b.name));

/** The age being turned today; null when Google has no year or it makes no sense. */
export function ageToday(contact: Contact, today: Date): number | null {
  const year = contact.birthday?.year;
  if (!year) return null;
  const age = today.getFullYear() - year;
  return age > 0 && age < 130 ? age : null;
}

/** Digits wa.me accepts, with the country code: "+" or "00" mark an international number, and a bare 10 or 11 digit
 * number (DDD + number, optionally after a trunk 0) is read as Brazilian. Anything shorter can't be dialled abroad. */
export function whatsappNumber(phone: string): string | null {
  const trimmed = phone.trim();
  let digits = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("+")) return digits.length >= 8 && digits.length <= 15 ? digits : null;
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0") && (digits.length === 11 || digits.length === 12)) digits = `55${digits.slice(1)}`;
  else if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
  return digits.length >= 12 && digits.length <= 15 ? digits : null;
}

/** A wa.me link for the number, with an optional message already typed. */
export function whatsappLink(phone: string, text = ""): string | null {
  const number = whatsappNumber(phone);
  if (!number) return null;
  return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

/** "23/10" or "23/10/1990", in the locale's order. */
export function birthdayLabel(contact: Contact): string {
  const b = contact.birthday;
  if (!b) return "";
  const date = new Date(b.year ?? 2000, b.month - 1, b.day);
  return date.toLocaleDateString(LOCALE, b.year ? { day: "2-digit", month: "2-digit", year: "numeric" } : { day: "2-digit", month: "long" });
}
