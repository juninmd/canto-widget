/**
 * Keeps `packaging/winget` and `packaging/homebrew` in step with a published release: the version and
 * every SHA-256 come from the release assets' own `digest`, never from a hand-copied value.
 *
 * Usage:
 *   bun scripts/packaging.ts check vX.Y.Z   # fails when the committed files are stale
 *   bun scripts/packaging.ts write vX.Y.Z   # regenerates them from the release
 */
import { readFileSync, writeFileSync } from "node:fs";
import { run } from "./release-git";

export type Asset = { name: string; digest: string };
export type Generated = { path: string; content: string };

const REPOSITORY = "juninmd/canto-widget";
const WINGET_MANIFEST_VERSION = "1.6.0";

const windowsInstaller = (version: string) => `Canto_${version}_x64-setup.exe`;
const macDmg = (version: string, arch: string) => `Canto_${version}_${arch}.dmg`;

function versionOf(tag: string): string {
  const version = tag.replace(/^v/, "");
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error(`tag sem versão semântica: ${tag}`);
  return version;
}

function downloadUrl(tag: string, name: string): string {
  return `https://github.com/${REPOSITORY}/releases/download/${tag}/${name}`;
}

/** `sha256:<hex>` from the release API, rejecting anything that is not a full digest. */
function digest(assets: readonly Asset[], name: string): string {
  const asset = assets.find((candidate) => candidate.name === name);
  if (!asset) throw new Error(`a release não publicou o arquivo esperado ${name}`);
  const hex = asset.digest.replace(/^sha256:/i, "").toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(hex)) throw new Error(`digest inesperado para ${name}: ${asset.digest}`);
  return hex;
}

function wingetVersion(version: string): string {
  return `# yaml-language-server: $schema=https://aka.ms/winget-manifest.version.${WINGET_MANIFEST_VERSION}.schema.json
PackageIdentifier: Juninmd.Canto
PackageVersion: ${version}
DefaultLocale: en-US
ManifestType: version
ManifestVersion: ${WINGET_MANIFEST_VERSION}
`;
}

function wingetLocale(version: string): string {
  return `# yaml-language-server: $schema=https://aka.ms/winget-manifest.defaultLocale.${WINGET_MANIFEST_VERSION}.schema.json
PackageIdentifier: Juninmd.Canto
PackageVersion: ${version}
PackageLocale: en-US
Publisher: Antonio Carlos
PublisherUrl: https://github.com/juninmd
PublisherSupportUrl: https://github.com/${REPOSITORY}/issues
PackageName: Canto
PackageUrl: https://github.com/${REPOSITORY}
License: MIT
LicenseUrl: https://github.com/${REPOSITORY}/blob/main/LICENSE
ShortDescription: Encrypted desktop widget for tasks, notes, clipboard history and agenda
Description: >-
  Canto is a desktop widget that keeps tasks, notes, clipboard history, meeting transcripts,
  the Google Calendar agenda and GitHub/GitLab issues and PRs in an encrypted local vault
  (Argon2id + AES-256-GCM).
Tags:
  - productivity
  - widget
  - tasks
  - notes
  - clipboard-manager
ManifestType: defaultLocale
ManifestVersion: ${WINGET_MANIFEST_VERSION}
`;
}

/** winget stores the hash in upper case, so the API's lower-case digest is re-cased here. */
function wingetInstaller(version: string, sha: string, tag: string): string {
  return `# yaml-language-server: $schema=https://aka.ms/winget-manifest.installer.${WINGET_MANIFEST_VERSION}.schema.json
PackageIdentifier: Juninmd.Canto
PackageVersion: ${version}
InstallerLocale: en-US
InstallerType: nullsoft
Scope: user
InstallModes:
  - interactive
  - silent
InstallerSwitches:
  Silent: /S
  SilentWithProgress: /S
UpgradeBehavior: install
Installers:
  - Architecture: x64
    InstallerUrl: ${downloadUrl(tag, windowsInstaller(version))}
    InstallerSha256: ${sha.toUpperCase()}
ManifestType: installer
ManifestVersion: ${WINGET_MANIFEST_VERSION}
`;
}

function homebrewCask(version: string, armSha: string, intelSha: string): string {
  return `cask "canto" do
  arch arm: "aarch64", intel: "x64"

  version "${version}"
  sha256 arm:   "${armSha}",
         intel: "${intelSha}"

  url "https://github.com/${REPOSITORY}/releases/download/v#{version}/Canto_#{version}_#{arch}.dmg"
  name "Canto"
  desc "Encrypted desktop widget for tasks, notes, clipboard history and agenda"
  homepage "https://github.com/${REPOSITORY}"

  auto_updates true

  app "Canto.app"

  zap trash: [
    "~/Library/Application Support/com.junin.canto",
    "~/Library/Caches/com.junin.canto",
    "~/Library/Saved Application State/com.junin.canto.savedState",
  ]
end
`;
}

/** The four files that must be republished by hand on every release, rebuilt from the assets' digests. */
export function renderManifests(tag: string, assets: readonly Asset[]): Generated[] {
  const version = versionOf(tag);
  return [
    { path: "packaging/winget/Juninmd.Canto.yaml", content: wingetVersion(version) },
    { path: "packaging/winget/Juninmd.Canto.locale.en-US.yaml", content: wingetLocale(version) },
    {
      path: "packaging/winget/Juninmd.Canto.installer.yaml",
      content: wingetInstaller(version, digest(assets, windowsInstaller(version)), tag),
    },
    {
      path: "packaging/homebrew/canto.rb",
      content: homebrewCask(
        version,
        digest(assets, macDmg(version, "aarch64")),
        digest(assets, macDmg(version, "x64")),
      ),
    },
  ];
}

/** Line endings are normalised away: the checkout's `core.autocrlf` must not look like drift. */
export function drift(generated: Generated, current: string): string | undefined {
  return current.replaceAll("\r\n", "\n") === generated.content ? undefined : generated.path;
}

function releaseAssets(tag: string): Asset[] {
  const json = run("gh", ["release", "view", tag, "--json", "assets"]);
  const parsed = JSON.parse(json) as { assets?: Asset[] };
  if (!parsed.assets || parsed.assets.length === 0) throw new Error(`a release ${tag} não tem arquivos publicados`);
  return parsed.assets;
}

function tagFromArgs(): string {
  const tag = process.argv[3];
  if (!tag) throw new Error("Informe a tag, por exemplo: bun scripts/packaging.ts check v0.1.0");
  return tag;
}

function check(tag: string): void {
  const stale = renderManifests(tag, releaseAssets(tag))
    .filter((file) => drift(file, readFileSync(file.path, "utf8")) !== undefined)
    .map((file) => file.path);
  if (stale.length > 0) {
    throw new Error(`desatualizados para ${tag} (rode \`bun scripts/packaging.ts write ${tag}\`): ${stale.join(", ")}`);
  }
  console.log(`Manifestos de ${tag} em dia`);
}

function write(tag: string): void {
  for (const file of renderManifests(tag, releaseAssets(tag))) {
    writeFileSync(file.path, file.content);
    console.log(file.path);
  }
}

if (import.meta.main) {
  const mode = process.argv[2];
  if (mode === "check") check(tagFromArgs());
  else if (mode === "write") write(tagFromArgs());
  else throw new Error("Use check ou write");
}
