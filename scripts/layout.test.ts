import { expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SRC = new URL("../src/", import.meta.url).pathname;
const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
const code = walk(SRC).filter((file) => /\.tsx?$/.test(file) && !/\.test\.tsx?$/.test(file));

test("no two modules in a folder differ only by letter case", () => {
  // Windows and macOS resolve `./AlertFx` and `./alertFx` to the same file.
  const seen = new Map<string, string>();
  const clashes: string[] = [];
  for (const file of code) {
    const key = file.replace(/\.tsx?$/, "").toLowerCase();
    if (seen.has(key)) clashes.push(`${seen.get(key)} <> ${file}`);
    seen.set(key, file);
  }
  expect(clashes).toEqual([]);
});

test("shared code never imports a feature or the shell", () => {
  // `lib/api.ts` is the IPC contract: it re-exports the types each feature declares.
  const shared = code.filter((file) => /\/src\/(lib|components)\//.test(file) && !file.endsWith("/lib/api.ts"));
  const leaks = shared.filter((file) => /from "\.\.\/(features|shell)\//.test(readFileSync(file, "utf8")));
  expect(leaks).toEqual([]);
});

test("features and the shell sit one folder deep", () => {
  const nested = code.filter((file) => /\/src\/(features\/[^/]+|shell)\/[^/]+\//.test(file));
  expect(nested).toEqual([]);
});

test("a Rust feature with a folder keeps none of its modules at the root", () => {
  const root = new URL("../src-tauri/src/", import.meta.url).pathname;
  const entries = readdirSync(root, { withFileTypes: true });
  const folders = entries.filter((e) => e.isDirectory() && e.name !== "locales").map((e) => e.name);
  expect(folders.length).toBeGreaterThan(15);
  const strays = entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((name) => folders.some((folder) => name === `${folder}.rs` || name.startsWith(`${folder}_`) || name.startsWith(`cmd_${folder}`)));
  expect(strays).toEqual([]);
});
