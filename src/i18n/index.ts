import { en } from "./en";
import { loadChoice, resolveLanguage, type Language } from "./language";
import { ptBR } from "./pt-BR";

export type MessageKey = keyof typeof ptBR;
type Params = Record<string, string | number>;

const CATALOGS: Record<Language, Record<MessageKey, string>> = { "pt-BR": ptBR, en };

/** Resolved once at startup: module-level labels (tabs, shortcuts) read it, so a change reloads the page. */
export const LANGUAGE: Language = resolveLanguage(
  loadChoice(),
  typeof navigator === "undefined" ? [] : (navigator.languages ?? [navigator.language]),
);

/** BCP 47 tag for `Intl` / `toLocale*` calls, kept next to the messages it matches. */
export const LOCALE = LANGUAGE === "en" ? "en-US" : "pt-BR";

const messages = CATALOGS[LANGUAGE];

/** Looks up a user-facing string; `{name}` placeholders are filled from `params`. */
export function t(key: MessageKey, params?: Params): string {
  const text = messages[key];
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (whole: string, name: string) => (name in params ? String(params[name]) : whole));
}
