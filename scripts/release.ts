import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  createReleaseManifest,
  hasRequiredAssets,
  type Manifest,
  type Release,
  verifyReleaseManifest,
} from "./release-manifest";

export { createReleaseManifest, hasRequiredAssets, verifyReleaseManifest } from "./release-manifest";

export type Candidate = { sha: string; tag: string; version: string; previousTag: string };
export type Commit = { sha: string; message: string };
export type ReleaseState = { draft: boolean; assets: string[] };
export type ReleaseBump = "major" | "minor" | "patch";

export function commitTitle(message: string): string {
  const lines = message.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return lines[0]?.startsWith("Merge pull request") ? lines[1] ?? lines[0] : lines[0] ?? "";
}

export function releaseBump(message: string): ReleaseBump | undefined {
  const title = commitTitle(message);
  if (/^[a-z][\w-]*(?:\([^\r\n()]+\))?!:/i.test(title) || /^BREAKING[ -]CHANGE\s*:/im.test(message)) return "major";
  const type = /^([a-z][\w-]*)(?:\([^\r\n()]+\))?:/i.exec(title)?.[1]?.toLowerCase();
  if (type === "feat") return "minor";
  if (type === "fix") return "patch";
  return undefined;
}

export function bumpVersion(version: string, bump: ReleaseBump): string {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) throw new Error(`Versão inválida: ${version}`);
  const [, majorText, minorText, patchText] = match;
  const [major, minor, patch] = [Number(majorText), Number(minorText), Number(patchText)];
  if (bump === "major") return `${major + 1}.0.0`;
  if (bump === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

export function planReleases(
  commits: Commit[],
  tags: ReadonlyMap<string, string>,
  releases: ReadonlyMap<string, ReleaseState>,
  previousTag: string,
): Candidate[] {
  let version = previousTag.replace(/^v/, "");
  let priorTag = previousTag;
  const candidates: Candidate[] = [];
  for (const commit of commits) {
    if (!/^[0-9a-f]{40}$/.test(commit.sha)) throw new Error(`Commit inválido: ${commit.sha}`);
    const bump = releaseBump(commit.message);
    if (!bump) continue;
    version = bumpVersion(version, bump);
    const tag = `v${version}`;
    const taggedSha = tags.get(tag);
    if (taggedSha && taggedSha !== commit.sha) throw new Error(`${tag} já aponta para outro commit`);
    if (releases.has(tag) && !taggedSha) throw new Error(`${tag} tem release sem tag local`);
    const release = releases.get(tag);
    if (release && !release.draft) {
      if (!hasRequiredAssets(release.assets, version)) throw new Error(`${tag} foi publicada sem os instaladores completos`);
    } else {
      candidates.push({ sha: commit.sha, tag, version, previousTag: priorTag });
    }
    priorTag = tag;
  }
  return candidates;
}

export function releaseNotes(message: string, candidate: Candidate, repository: string): string {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository)) throw new Error("Repositório inválido");
  const title = commitTitle(message);
  if (!title) throw new Error("Commit sem título");
  const markdownSpecials = new Set("\\`*_{}[]()<>#+.!|");
  const safeTitle = Array.from(title.slice(0, 240), (char) => (markdownSpecials.has(char) ? `\\${char}` : char)).join("");
  const root = `https://github.com/${repository}`;
  return `## Alterações\n\n- ${safeTitle} ([${candidate.sha.slice(0, 7)}](${root}/commit/${candidate.sha}))\n\n[Comparar com ${candidate.previousTag}](${root}/compare/${candidate.previousTag}...${candidate.tag})\n`;
}

function run(command: string, args: string[]): string {
  return execFileSync(command, args, { encoding: "utf8" }).trim();
}

function compareVersions(left: string, right: string): number {
  const leftParts = left.split(".").map(Number);
  const rightParts = right.split(".").map(Number);
  for (let index = 0; index < 3; index += 1) {
    const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (difference) return difference;
  }
  return 0;
}

function plan(): void {
  const repository = process.env.GITHUB_REPOSITORY ?? run("gh", ["repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner"]);
  const tagNames = run("git", ["tag", "--list", "v[0-9]*.[0-9]*.[0-9]*"]);
  const tags = new Map((tagNames ? tagNames.split("\n") : []).map((tag) => [tag, run("git", ["rev-parse", `${tag}^{commit}`])]));
  const releaseRows = run("gh", ["api", "--paginate", `repos/${repository}/releases?per_page=100`, "--jq", ".[] | {tag: .tag_name, draft: .draft, assets: [.assets[].name]} | @json"]);
  const releases = new Map((releaseRows ? releaseRows.split("\n") : []).map((line) => {
    const row = JSON.parse(line) as { tag: string; draft: boolean; assets: string[] };
    return [row.tag, { draft: row.draft, assets: row.assets }] as const;
  }));
  const publishedTags = [...releases.entries()]
    .filter(([tag, release]) => /^v\d+\.\d+\.\d+$/.test(tag) && !release.draft && tags.has(tag))
    .sort(([left], [right]) => compareVersions(right.slice(1), left.slice(1)));
  const previousTag = publishedTags.find(([tag]) => {
    try {
      run("git", ["merge-base", "--is-ancestor", tag, "origin/main"]);
      return true;
    } catch {
      return false;
    }
  })?.[0];
  if (!previousTag) throw new Error("Nenhuma release SemVer publicada foi encontrada em main");
  const previousRelease = releases.get(previousTag)!;
  if (!hasRequiredAssets(previousRelease.assets, previousTag.slice(1))) throw new Error(`${previousTag} foi publicada sem os instaladores completos`);
  const history = run("git", ["rev-list", "--first-parent", "--reverse", `${previousTag}..origin/main`]);
  const commits = (history ? history.split("\n") : []).map((sha) => ({ sha, message: run("git", ["log", "-1", "--format=%B", sha]) }));
  const pending = planReleases(commits, tags, releases, previousTag);
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `candidate=${JSON.stringify(pending[0] ?? {})}\n`);
    appendFileSync(process.env.GITHUB_OUTPUT, `more=${pending.length > 1}\n`);
  }
  console.log(JSON.stringify(pending));
}

function notes(): void {
  const [tag, sha, previousTag, path] = process.argv.slice(3);
  if (!tag || !sha || !previousTag || !path || !/^v\d+\.\d+\.\d+$/.test(tag)) throw new Error("Argumentos inválidos");
  const repository = process.env.GITHUB_REPOSITORY ?? run("gh", ["repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner"]);
  writeFileSync(path, releaseNotes(run("git", ["log", "-1", "--format=%B", sha]), { sha, tag, version: tag.slice(1), previousTag }, repository));
}

function manifest(): void {
  const [releasePath, signaturesPath, notesPath, outputPath, tag, version] = process.argv.slice(3);
  if (!releasePath || !signaturesPath || !notesPath || !outputPath || !tag || !version) throw new Error("Argumentos inválidos");
  const release = JSON.parse(readFileSync(releasePath, "utf8")) as Release;
  const signatures = new Map(readdirSync(signaturesPath).filter((name) => name.endsWith(".sig"))
    .map((name) => [name, readFileSync(join(signaturesPath, name), "utf8")]));
  const repository = process.env.GITHUB_REPOSITORY ?? run("gh", ["repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner"]);
  const result = createReleaseManifest(release, signatures, tag, version, readFileSync(notesPath, "utf8"), repository);
  writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
}

function verify(): void {
  const [manifestPath, releasePath, tag, version] = process.argv.slice(3);
  if (!manifestPath || !releasePath || !tag || !version) throw new Error("Argumentos inválidos");
  const manifestValue = JSON.parse(readFileSync(manifestPath, "utf8")) as Manifest;
  const release = JSON.parse(readFileSync(releasePath, "utf8")) as Release;
  const repository = process.env.GITHUB_REPOSITORY ?? run("gh", ["repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner"]);
  verifyReleaseManifest(manifestValue, release, tag, version, repository);
  console.log(`Updater ${tag} validado`);
}

if (import.meta.main) {
  if (process.argv[2] === "plan") plan();
  else if (process.argv[2] === "notes") notes();
  else if (process.argv[2] === "manifest") manifest();
  else if (process.argv[2] === "verify") verify();
  else throw new Error("Use plan, notes, manifest ou verify");
}
