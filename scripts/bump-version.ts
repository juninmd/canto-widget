#!/usr/bin/env bun
// Invoked by semantic-release's exec plugin (see .releaserc.json) as the
// `prepareCmd` for a release: writes the next version into every file that
// duplicates it, and turns CHANGELOG.md's running "Não publicado" section
// into a dated one, opening a fresh empty section for whatever comes next.
// Lockfiles are NOT touched here: `cargo check` (run right after this
// script, see .releaserc.json) syncs Cargo.lock's version entry on its own;
// bun.lock doesn't track the workspace root's own version at all.
import { readFileSync, writeFileSync } from "node:fs";

const version = process.argv[2];
if (!version) {
  console.error("usage: bump-version.ts <version>");
  process.exit(1);
}

function bumpJsonVersion(path: string) {
  const raw = readFileSync(path, "utf8");
  const next = raw.replace(/"version":\s*"[^"]+"/, `"version": "${version}"`);
  if (next === raw) throw new Error(`${path}: campo "version" não encontrado`);
  writeFileSync(path, next);
}

bumpJsonVersion("package.json");
bumpJsonVersion("src-tauri/tauri.conf.json");

{
  const path = "src-tauri/Cargo.toml";
  const raw = readFileSync(path, "utf8");
  // Only the [package] version, at line start — a dependency pinned as `version = "..."` never sits at column 0.
  const next = raw.replace(/^version = "[^"]+"/m, `version = "${version}"`);
  if (next === raw) throw new Error(`${path}: linha "version = ..." não encontrada`);
  writeFileSync(path, next);
}

{
  const path = "CHANGELOG.md";
  const raw = readFileSync(path, "utf8");
  const date = new Date().toISOString().slice(0, 10);
  const marker = "## [Não publicado]";
  const next = raw.replace(marker, `${marker}\n\n## [${version}] - ${date}`);
  if (next === raw) throw new Error(`${path}: seção "${marker}" não encontrada`);
  writeFileSync(path, next);
}

console.log(`bump-version: ${version}`);
