import { posix } from "node:path";
import { languageNames } from "../src/i18n/languages";

export const readmeLanguages = languageNames;

/** Repo-relative location of each README. The English README stays at the repo root. */
export function readmePath(code: string): string {
  return code === "en" ? "README.md" : `docs/readmes/README.${code}.md`;
}

/** Language navigation, with links relative to the file at `from` (defaults to the code's own README). */
export function readmeNavigation(current: string, from: string = readmePath(current)): string {
  const dir = posix.dirname(from);
  return `<sub>${readmeLanguages.map(([code, name]) =>
    code === current ? `**${name}**` : `[${name}](${posix.relative(dir, readmePath(code))})`,
  ).join(" · ")}</sub>`;
}
