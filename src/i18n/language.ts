export type Language = "pt-BR" | "en" | "es";
export type LanguageChoice = "auto" | Language;

export const LANGUAGE_CHOICES: readonly LanguageChoice[] = ["auto", "pt-BR", "en", "es"];
const KEY = "canto.language";

/** "auto" follows the OS: Portuguese for `pt*`, Spanish for `es*`, English for everything else. */
export function resolveLanguage(choice: LanguageChoice, systemLanguages: readonly string[]): Language {
  if (choice !== "auto") return choice;
  const first = systemLanguages[0]?.toLowerCase() ?? "";
  if (first === "" || first.startsWith("pt")) return "pt-BR";
  return first.startsWith("es") ? "es" : "en";
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
