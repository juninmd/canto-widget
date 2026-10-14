import { languageNames } from "../src/i18n/languages";

export const readmeLanguages = languageNames;

export function readmePath(code: string): string {
  return code === "en" ? "README.md" : `README.${code}.md`;
}

export function readmeNavigation(current: string): string {
  return `<sub>${readmeLanguages.map(([code, name]) =>
    code === current ? `**${name}**` : `[${name}](${readmePath(code)})`,
  ).join(" · ")}</sub>`;
}
