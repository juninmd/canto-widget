import { catalogLoaders } from "./loaders";
import { localeFor } from "./languages";
import { loadChoice, resolveLanguage, type Language } from "./language";
import type { ptBR } from "./pt-BR";

export type MessageKey = keyof typeof ptBR;
type Params = Record<string, string | number>;

/** Resolved once at startup: module-level labels (tabs, shortcuts) read it, so a change reloads the page. */
export const LANGUAGE: Language = resolveLanguage(
  loadChoice(),
  typeof navigator === "undefined" ? [] : (navigator.languages ?? [navigator.language]),
);

/** BCP 47 tag for `Intl` / `toLocale*` calls, kept next to the messages it matches. */
export const LOCALE = localeFor(LANGUAGE);

// Only the chosen catalog is fetched and parsed at startup (each is ~80 kB); it lands before any label is computed.
const messages = await catalogLoaders[LANGUAGE]();

/** Looks up a user-facing string; `{name}` placeholders are filled from `params`. */
export function t(key: MessageKey, params?: Params): string {
  const text = messages[key];
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (whole: string, name: string) => (name in params ? String(params[name]) : whole));
}
