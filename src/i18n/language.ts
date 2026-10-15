import { languageNames, type Language } from "./languages";
export type { Language } from "./languages";
export type LanguageChoice = "auto" | Language;

export const LANGUAGE_CHOICES: readonly LanguageChoice[] = ["auto", ...languageNames.map(([code]) => code)];
const KEY = "canto.language";

/** Regional variants use their base catalog; an unsupported primary language falls back to English. */
export function resolveLanguage(choice: LanguageChoice, systemLanguages: readonly string[]): Language {
  if (choice !== "auto") return choice;
  const first = systemLanguages[0]?.toLowerCase() ?? "";
  if (!first || first === "pt" || first.startsWith("pt-")) return "pt-BR";
  const base = first.split("-")[0];
  const code = base === "iw" ? "he" : base === "no" ? "nb" : base;
  return languageNames.find(([language]) => language === code)?.[0] ?? "en";
}

export function parseChoice(raw: string | null): LanguageChoice {
  return (LANGUAGE_CHOICES as readonly string[]).includes(raw ?? "") ? (raw as LanguageChoice) : "auto";
}

export function loadChoice(): LanguageChoice {
  try {
    return parseChoice(localStorage.getItem(KEY));
  } catch {
    return "auto";
  }
}

export function saveChoice(choice: LanguageChoice) {
  try {
    localStorage.setItem(KEY, choice);
  } catch {
    // Private storage off: the choice just doesn't survive a restart.
  }
}
