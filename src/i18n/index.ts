import { ptBR } from "./pt-BR";

export type MessageKey = keyof typeof ptBR;
type Params = Record<string, string | number>;

/** BCP 47 tag for `Intl` / `toLocale*` calls, kept next to the messages it matches. */
export const LOCALE = "pt-BR";

const messages: Record<MessageKey, string> = ptBR;

/** Looks up a user-facing string; `{name}` placeholders are filled from `params`. */
export function t(key: MessageKey, params?: Params): string {
  const text = messages[key];
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (whole: string, name: string) => (name in params ? String(params[name]) : whole));
}
