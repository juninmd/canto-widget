import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { drift, renderManifests, type Asset } from "./packaging";

const WINGET_INSTALLER = "packaging/winget/Juninmd.Canto.installer.yaml";
const WINGET_VERSION = "packaging/winget/Juninmd.Canto.yaml";
const WINGET_LOCALE = "packaging/winget/Juninmd.Canto.locale.en-US.yaml";
const HOMEBREW = "packaging/homebrew/canto.rb";

const DIGEST_A = "a".repeat(64);
const DIGEST_B = "b".repeat(64);
const DIGEST_C = "c".repeat(64);

function release(version: string, installer = DIGEST_A, arm = DIGEST_B, intel = DIGEST_C): Asset[] {
  return [
    { name: `Canto_${version}_x64-setup.exe`, digest: `sha256:${installer}` },
    { name: `Canto_${version}_aarch64.dmg`, digest: `sha256:${arm}` },
    { name: `Canto_${version}_x64.dmg`, digest: `sha256:${intel}` },
  ];
}

function rendered(path: string, assets: Asset[]): string {
  const file = renderManifests("v9.9.9", assets).find((candidate) => candidate.path === path);
  if (!file) throw new Error(`o gerador não produziu ${path}`);
  return file.content;
}

test("every release generates the four files winget and Homebrew need", () => {
  const paths = renderManifests("v9.9.9", release("9.9.9")).map((file) => file.path);
  expect(paths).toEqual([WINGET_VERSION, WINGET_LOCALE, WINGET_INSTALLER, HOMEBREW]);
});

test("the version of the tag reaches every file, and each one ends with a newline", () => {
  for (const file of renderManifests("v9.9.9", release("9.9.9"))) {
    expect(file.content, file.path).toContain("9.9.9");
    expect(file.content.endsWith("\n"), file.path).toBe(true);
  }
  expect(rendered(HOMEBREW, release("9.9.9"))).toContain('version "9.9.9"');
  expect(rendered(WINGET_VERSION, release("9.9.9"))).toContain("PackageVersion: 9.9.9");
  // Only the download URLs keep the tag's `v`; the declared version is always bare.
  expect(rendered(WINGET_VERSION, release("9.9.9"))).not.toContain("v9.9.9");
  expect(rendered(WINGET_LOCALE, release("9.9.9"))).not.toContain("v9.9.9");
});

test("the Windows hash is upper case and the macOS ones stay lower case", () => {
  const installer = rendered(WINGET_INSTALLER, release("9.9.9"));
  expect(installer).toContain(`InstallerSha256: ${DIGEST_A.toUpperCase()}`);
  expect(installer).not.toContain(DIGEST_A);
  const cask = rendered(HOMEBREW, release("9.9.9"));
  expect(cask).toContain(`"${DIGEST_B}"`);
  expect(cask).toContain(`"${DIGEST_C}"`);
  expect(cask).not.toContain(DIGEST_B.toUpperCase());
});

test("the download URLs point at the tag's own assets", () => {
  const installer = rendered(WINGET_INSTALLER, release("9.9.9"));
  expect(installer).toContain(
    "InstallerUrl: https://github.com/juninmd/canto-widget/releases/download/v9.9.9/Canto_9.9.9_x64-setup.exe",
  );
  expect(rendered(HOMEBREW, release("9.9.9"))).toContain(
    'url "https://github.com/juninmd/canto-widget/releases/download/v#{version}/Canto_#{version}_#{arch}.dmg"',
  );
});

test("a missing asset names the file the release did not publish", () => {
  const partial = release("9.9.9").filter((asset) => !asset.name.endsWith("aarch64.dmg"));
  expect(() => renderManifests("v9.9.9", partial)).toThrow("Canto_9.9.9_aarch64.dmg");
});

test("a digest that is not a full sha256 is refused instead of written", () => {
  const short = release("9.9.9", "deadbeef");
  expect(() => renderManifests("v9.9.9", short)).toThrow("digest inesperado");
});

test("a tag that is not semantic is refused", () => {
  expect(() => renderManifests("nightly", release("9.9.9"))).toThrow("tag sem versão semântica");
});

test("drift ignores the checkout's line endings and reports a real difference", () => {
  const [file] = renderManifests("v9.9.9", release("9.9.9"));
  expect(file).toBeDefined();
  expect(drift(file!, file!.content)).toBeUndefined();
  expect(drift(file!, file!.content.replaceAll("\n", "\r\n"))).toBeUndefined();
  expect(drift(file!, `${file!.content}x`)).toBe(file!.path);
});

/** The trap the README warns about: a release that bumps one manifest and forgets the others. */
test("the committed manifests agree on one version and carry well-formed hashes", () => {
  const cat = (path: string) => readFileSync(path, "utf8").replaceAll("\r\n", "\n");
  const installer = cat(WINGET_INSTALLER);
  const version = /^PackageVersion: (\S+)$/m.exec(cat(WINGET_VERSION))?.[1];
  expect(version).toMatch(/^\d+\.\d+\.\d+$/);
  expect(/^PackageVersion: (\S+)$/m.exec(installer)?.[1]).toBe(version);
  expect(/^PackageVersion: (\S+)$/m.exec(cat(WINGET_LOCALE))?.[1]).toBe(version);
  expect(/^  version "(\S+)"$/m.exec(cat(HOMEBREW))?.[1]).toBe(version);

  const installerSha = /^    InstallerSha256: (\S+)$/m.exec(installer)?.[1] ?? "";
  expect(installerSha).toMatch(/^[0-9A-F]{64}$/);
  expect(installer).toContain(`Canto_${version}_x64-setup.exe`);

  const cask = cat(HOMEBREW);
  const arm = /^  sha256 arm:   "(\w+)",$/m.exec(cask)?.[1] ?? "";
  const intel = /^         intel: "(\w+)"$/m.exec(cask)?.[1] ?? "";
  expect(arm).toMatch(/^[0-9a-f]{64}$/);
  expect(intel).toMatch(/^[0-9a-f]{64}$/);
  expect(arm).not.toBe(intel);
});
