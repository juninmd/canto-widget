import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { readmeLanguages, readmeNavigation, readmePath } from "./readme-languages";

test("each interface language has a README with complete language navigation and intact development commands", () => {
  for (const [code] of readmeLanguages) {
    const text = readFileSync(new URL(`../${readmePath(code)}`, import.meta.url), "utf8");
    expect(text, code).toContain(readmeNavigation(code));
    expect(text, code).toContain("bun run tauri dev");
    expect(text, code).toContain("bun run lint && bun test");
    expect(text, code).toContain("bun run tauri build");
    expect(text, code).not.toContain("__CANTO_");
    expect(text.match(/^```/gm)?.length % 2, code).toBe(0);
  }
});

test("new README translations preserve local link targets from the canonical README", () => {
  const original = readFileSync(new URL("../README.md", import.meta.url), "utf8");
  const targets = (text: string) => new Set([...text.matchAll(/\]\(([^)]+)\)/g)]
    .map((match) => match[1]).filter((link) => !link.startsWith("#") && !link.startsWith("http") && !link.startsWith("README")));
  const existing = new Set(["en", "pt-BR", "es", "fr", "it", "ja", "zh", "de", "ru", "tr", "hi"]);
  for (const [code] of readmeLanguages.filter(([language]) => !existing.has(language))) {
    const text = readFileSync(new URL(`../${readmePath(code)}`, import.meta.url), "utf8");
    expect(targets(text), code).toEqual(targets(original));
  }
});

test("the Rust command boundary accepts exactly the interface language inventory", () => {
  const rust = readFileSync(new URL("../src-tauri/src/lang_catalogs.rs", import.meta.url), "utf8");
  const codes = rust.match(/pub const CODES:[^=]+?=\s*&\[([^]*?)\];/)?.[1] ?? "";
  expect([...codes.matchAll(/"([^"]+)"/g)].map((match) => match[1])).toEqual(readmeLanguages.map(([code]) => code));
});
