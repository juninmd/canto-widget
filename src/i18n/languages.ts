export const languageNames = [
  ["en", "English"], ["pt-BR", "Português"], ["es", "Español"], ["fr", "Français"],
  ["it", "Italiano"], ["ja", "日本語"], ["zh", "中文"], ["de", "Deutsch"],
  ["ru", "Русский"], ["tr", "Türkçe"], ["hi", "हिन्दी"], ["ar", "العربية"],
  ["he", "עברית"], ["fa", "فارسی"], ["ko", "한국어"], ["nl", "Nederlands"],
  ["pl", "Polski"], ["uk", "Українська"], ["cs", "Čeština"], ["sk", "Slovenčina"],
  ["ro", "Română"], ["hu", "Magyar"], ["sv", "Svenska"], ["da", "Dansk"],
  ["nb", "Norsk bokmål"], ["fi", "Suomi"], ["el", "Ελληνικά"], ["bg", "Български"],
  ["hr", "Hrvatski"], ["sr", "Српски"], ["sl", "Slovenščina"], ["lt", "Lietuvių"],
  ["lv", "Latviešu"], ["et", "Eesti"], ["id", "Bahasa Indonesia"], ["ms", "Bahasa Melayu"],
  ["vi", "Tiếng Việt"], ["th", "ไทย"], ["bn", "বাংলা"], ["ta", "தமிழ்"],
  ["sw", "Kiswahili"], ["ca", "Català"],
] as const;


export type Language = typeof languageNames[number][0];
export const NATIVE_NAMES = Object.fromEntries(languageNames) as Record<Language, string>;
export const RTL_LANGUAGES: readonly Language[] = ["ar", "he", "fa"];
export function localeFor(language: Language): string {
  return ({ en: "en-US", zh: "zh-CN", es: "es-419" } as Partial<Record<Language, string>>)[language] ?? language;
}
