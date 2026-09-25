import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";

const baseTag = "v0.3.0";
const previousBaseTag = "v0.2.0";

export type Candidate = { sha: string; tag: string; version: string; previousTag: string };
export type ReleaseState = { draft: boolean; assets: string[] };

const updaterBundles = {
  "windows-x86_64": /_x64-setup\.exe$/,
  "darwin-aarch64": /_aarch64\.app\.tar\.gz$/,
  "darwin-x86_64": /_x64\.app\.tar\.gz$/,
  "linux-x86_64": /_(?:amd64|x86_64)\.AppImage$/,
};

function bundleName(assets: string[], version: string, pattern: RegExp): string | undefined {
  return assets.find((name) => name.includes(`_${version}_`) && pattern.test(name) && assets.includes(`${name}.sig`));
}

export function hasRequiredAssets(assets: string[], version: string): boolean {
  return assets.includes("latest.json") && Object.values(updaterBundles).every((pattern) => bundleName(assets, version, pattern));
}

export function planReleases(
  commits: string[],
  tags: ReadonlyMap<string, string>,
  releases: ReadonlyMap<string, ReleaseState>,
  baseSha: string,
): Candidate[] {
  const candidates = [{ sha: baseSha, tag: baseTag, version: "0.3.0", previousTag: previousBaseTag },
    ...commits.map((sha, index) => ({
      sha,
      tag: `v0.3.${index + 1}`,
      version: `0.3.${index + 1}`,
      previousTag: `v0.3.${index}`,
    }))];
  return candidates.flatMap(({ sha, tag, version, previousTag }) => {
    if (!/^[0-9a-f]{40}$/.test(sha)) throw new Error(`Commit inválido: ${sha}`);
    const taggedSha = tags.get(tag);
    if (taggedSha && taggedSha !== sha) throw new Error(`${tag} já aponta para outro commit`);
    if (releases.has(tag) && !taggedSha) throw new Error(`${tag} tem release sem tag local`);
    const release = releases.get(tag);
    if (release && !release.draft) {
      if (!hasRequiredAssets(release.assets, version)) throw new Error(`${tag} foi publicada sem os instaladores completos`);
      return [];
    }
    return [{ sha, tag, version, previousTag }];
  });
}

type Platform = { signature: string; url: string };
type Manifest = { version: string; notes: string; platforms: Record<string, Platform> };
type Release = { tag_name: string; draft: boolean; body: string; assets: { id: number; name: string }[] };

export function verifyReleaseManifest(manifest: Manifest, release: Release, tag: string, version: string, repository: string): void {
  if (release.tag_name !== tag || !release.draft || manifest.version !== version || !manifest.notes?.trim()) {
    throw new Error("Tag, rascunho, versão ou changelog inválido");
  }
  if (manifest.notes.trim() !== release.body?.trim()) throw new Error("Changelog do updater difere da release");
  const names = release.assets.map((asset) => asset.name);
  if (!hasRequiredAssets(names, version)) throw new Error("Instaladores incompletos");
  const prefix = `https://api.github.com/repos/${repository}/releases/assets/`;
  for (const [platform, pattern] of Object.entries(updaterBundles)) {
    const entry = manifest.platforms?.[platform];
    const id = entry?.url?.startsWith(prefix) ? entry.url.slice(prefix.length) : "";
    const asset = /^\d+$/.test(id) ? release.assets.find((item) => item.id === Number(id)) : undefined;
    if (!entry?.signature || !asset || asset.name !== bundleName(names, version, pattern)) {
      throw new Error(`Updater inválido para ${platform}`);
    }
  }
}

export function releaseNotes(message: string, candidate: Candidate, repository: string): string {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository)) throw new Error("Repositório inválido");
  const lines = message.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const title = lines[0]?.startsWith("Merge pull request") ? lines[1] ?? lines[0] : lines[0];
  if (!title) throw new Error("Commit sem título");
  const markdownSpecials = new Set("\\`*_{}[]()<>#+.!|");
  const safeTitle = Array.from(title.slice(0, 240), (char) => (markdownSpecials.has(char) ? `\\${char}` : char))
    .join("");
  const root = `https://github.com/${repository}`;
  return `## Alterações\n\n- ${safeTitle} ([${candidate.sha.slice(0, 7)}](${root}/commit/${candidate.sha}))\n\n[Comparar com ${candidate.previousTag}](${root}/compare/${candidate.previousTag}...${candidate.tag})\n`;
}

export function versionNotes(changelog: string, version: string): string {
  const heading = `## [${version}]`;
  const start = changelog.indexOf(heading);
  if (start < 0) throw new Error(`Changelog de ${version} não encontrado`);
  const text = changelog.slice(start + heading.length).replace(/^\s*-\s*\d{4}-\d{2}-\d{2}\s*\r?\n/, "");
  const end = text.search(/^## \[/m);
  const notes = (end < 0 ? text : text.slice(0, end)).trim();
  if (!notes) throw new Error(`Changelog de ${version} vazio`);
  return `## Alterações\n\n${notes}\n`;
}

function run(command: string, args: string[]): string {
  return execFileSync(command, args, { encoding: "utf8" }).trim();
}

function plan(): void {
  const repository = process.env.GITHUB_REPOSITORY ?? run("gh", ["repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner"]);
  run("git", ["merge-base", "--is-ancestor", baseTag, "origin/main"]);
  const history = run("git", ["rev-list", "--first-parent", "--reverse", `${baseTag}..origin/main`]);
  const commits = history ? history.split("\n") : [];
  const tagNames = run("git", ["tag", "--list", "v0.3.*"]);
  const tags = new Map((tagNames ? tagNames.split("\n") : []).map((tag) => [
    tag,
    run("git", ["rev-parse", `${tag}^{commit}`]),
  ]));
  const releaseRows = run("gh", ["api", "--paginate", `repos/${repository}/releases?per_page=100`, "--jq", ".[] | {tag: .tag_name, draft: .draft, assets: [.assets[].name]} | @json"]);
  const releases = new Map((releaseRows ? releaseRows.split("\n") : []).map((line) => {
    const row = JSON.parse(line) as { tag: string; draft: boolean; assets: string[] };
    return [row.tag, { draft: row.draft, assets: row.assets }] as const;
  }));
  const pending = planReleases(commits, tags, releases, run("git", ["rev-parse", `${baseTag}^{commit}`]));
  const output = JSON.stringify(pending);
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `candidate=${JSON.stringify(pending[0] ?? {})}\n`);
    appendFileSync(process.env.GITHUB_OUTPUT, `more=${pending.length > 1}\n`);
  }
  console.log(output);
}

function notes(): void {
  const [tag, sha, previousTag, path] = process.argv.slice(3);
  if (!tag || !sha || !previousTag || !path || !/^v0\.3\.\d+$/.test(tag)) throw new Error("Argumentos inválidos");
  const version = tag.slice(1);
  const repository = process.env.GITHUB_REPOSITORY ?? run("gh", ["repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner"]);
  const notes = tag === baseTag
    ? versionNotes(run("git", ["show", `${sha}:CHANGELOG.md`]), version)
    : releaseNotes(run("git", ["log", "-1", "--format=%B", sha]), { sha, tag, version, previousTag }, repository);
  writeFileSync(path, notes);
}

function verify(): void {
  const [manifestPath, releasePath, tag, version] = process.argv.slice(3);
  if (!manifestPath || !releasePath || !tag || !version) throw new Error("Argumentos inválidos");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Manifest;
  const release = JSON.parse(readFileSync(releasePath, "utf8")) as Release;
  const repository = process.env.GITHUB_REPOSITORY ?? run("gh", ["repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner"]);
  verifyReleaseManifest(manifest, release, tag, version, repository);
  console.log(`Updater ${tag} validado`);
}

if (import.meta.main) {
  if (process.argv[2] === "plan") plan();
  else if (process.argv[2] === "notes") notes();
  else if (process.argv[2] === "verify") verify();
  else throw new Error("Use plan, notes ou verify");
}
