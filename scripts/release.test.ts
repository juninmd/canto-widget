import { expect, test } from "bun:test";
import {
  bumpVersion,
  createReleaseManifest,
  hasRequiredAssets,
  planReleases,
  releaseBump,
  releaseNotes,
  verifyReleaseManifest,
} from "./release";

const a = "a".repeat(40);
const b = "b".repeat(40);
const c = "c".repeat(40);
const d = "d".repeat(40);

function assets(version: string): string[] {
  const bundles = [
    `Canto_${version}_x64-setup.exe`,
    `Canto_${version}_x64_en-US.msi`,
    `Canto_${version}_aarch64.app.tar.gz`,
    `Canto_${version}_x64.app.tar.gz`,
    `Canto_${version}_amd64.AppImage`,
    `Canto_${version}_amd64.deb`,
    `Canto-${version}-1.x86_64.rpm`,
  ];
  return ["latest.json", ...bundles.flatMap((name) => [name, `${name}.sig`])];
}

test("uses Conventional Commits for patch, minor and major releases", () => {
  expect(planReleases([
    { sha: a, message: "docs: update README" },
    { sha: b, message: "fix(sync): avoid duplicate upload" },
    { sha: c, message: "feat: add compact mode" },
    { sha: d, message: "feat(api)!: replace the vault format" },
  ], new Map(), new Map(), "v0.3.1")).toEqual([
    { sha: b, tag: "v0.3.2", version: "0.3.2", previousTag: "v0.3.1" },
    { sha: c, tag: "v0.4.0", version: "0.4.0", previousTag: "v0.3.2" },
    { sha: d, tag: "v1.0.0", version: "1.0.0", previousTag: "v0.4.0" },
  ]);
  expect(bumpVersion("4.9.8", "patch")).toBe("4.9.9");
});

test("reads the conventional title and breaking footer from merge commits", () => {
  expect(releaseBump("Merge pull request #31 from feature\n\nfeat(settings): compact mode")).toBe("minor");
  expect(releaseBump("Merge pull request #32 from refactor\n\nrefactor: vault\n\nBREAKING CHANGE: new envelope")).toBe("major");
  expect(releaseBump("chore: refresh dependencies")).toBeUndefined();
});

test("retries drafts and skips published releases with complete installers", () => {
  const tags = new Map([["v0.3.2", a], ["v0.3.3", b]]);
  expect(planReleases([
    { sha: a, message: "fix: first" },
    { sha: b, message: "fix: second" },
  ], tags, new Map([
    ["v0.3.2", { draft: false, assets: assets("0.3.2") }],
    ["v0.3.3", { draft: true, assets: [] }],
  ]), "v0.3.1")).toEqual([
    { sha: b, tag: "v0.3.3", version: "0.3.3", previousTag: "v0.3.2" },
  ]);
});

test("published releases missing a signed installer are rejected", () => {
  expect(hasRequiredAssets(assets("0.3.2"), "0.3.2")).toBe(true);
  expect(() => planReleases([{ sha: a, message: "fix: release" }], new Map([["v0.3.2", a]]), new Map([
    ["v0.3.2", { draft: false, assets: assets("0.3.2").filter((name) => !name.endsWith(".AppImage.sig")) }],
  ]), "v0.3.1")).toThrow("instaladores completos");
});

test("builds and verifies one updater manifest after parallel uploads", () => {
  const names = assets("0.3.2");
  const release = {
    tag_name: "v0.3.2",
    draft: true,
    body: "## Alterações\n",
    assets: names.map((name, index) => ({ id: index + 1, name })),
  };
  const signatures = new Map(names.filter((name) => name.endsWith(".sig")).map((name) => [name, `signature:${name}`]));
  const manifest = createReleaseManifest(
    release,
    signatures,
    "v0.3.2",
    "0.3.2",
    release.body,
    "juninmd/canto-widget",
    "2026-09-22T00:00:00.000Z",
  );
  expect(Object.keys(manifest.platforms)).toHaveLength(11);
  expect(() => verifyReleaseManifest(manifest, release, "v0.3.2", "0.3.2", "juninmd/canto-widget")).not.toThrow();
  manifest.platforms["windows-x86_64"].url = "https://api.github.com/repos/juninmd/canto-widget/releases/assets/999";
  expect(() => verifyReleaseManifest(manifest, release, "v0.3.2", "0.3.2", "juninmd/canto-widget")).toThrow("windows-x86_64");
});

test("manifest generation rejects a missing signature", () => {
  const names = assets("0.3.2");
  const release = {
    tag_name: "v0.3.2",
    draft: true,
    body: "notas",
    assets: names.map((name, index) => ({ id: index + 1, name })),
  };
  expect(() => createReleaseManifest(release, new Map(), "v0.3.2", "0.3.2", "notas", "juninmd/canto-widget"))
    .toThrow("assinatura ausente");
});

test("refuses to reuse a semantic version whose tag points to another commit", () => {
  expect(() => planReleases([{ sha: a, message: "fix: release" }], new Map([["v0.3.2", b]]), new Map(), "v0.3.1"))
    .toThrow("outro commit");
});

test("uses the merged pull request title for Portuguese release notes", () => {
  const notes = releaseNotes("Merge pull request #24 from feature\n\nfeat: aba Status [API]", {
    sha: a, tag: "v0.4.0", version: "0.4.0", previousTag: "v0.3.1",
  }, "juninmd/canto-widget");
  expect(notes).toContain("feat: aba Status \\[API\\]");
  expect(notes).toContain("/compare/v0.3.1...v0.4.0");
  expect(notes).not.toContain("Merge pull request");
});
