import { expect, test } from "bun:test";
import { hasRequiredAssets, planReleases, releaseNotes, verifyReleaseManifest, versionNotes } from "./release";

const a = "a".repeat(40);
const b = "b".repeat(40);

test("assigns one stable patch version to each mainline commit, including batched pushes", () => {
  const c = "c".repeat(40);
  expect(planReleases([a, b], new Map([["v0.3.0", c]]), new Map(), c)).toEqual([
    { sha: c, tag: "v0.3.0", version: "0.3.0", previousTag: "v0.2.0" },
    { sha: a, tag: "v0.3.1", version: "0.3.1", previousTag: "v0.3.0" },
    { sha: b, tag: "v0.3.2", version: "0.3.2", previousTag: "v0.3.1" },
  ]);
});

test("retries drafts and missing releases, and skips only published releases", () => {
  const tags = new Map([["v0.3.0", a], ["v0.3.1", b]]);
  expect(planReleases([b], tags, new Map([
    ["v0.3.0", { draft: false, assets: assets("0.3.0") }],
    ["v0.3.1", { draft: true, assets: [] }],
  ]), a)).toEqual([
    { sha: b, tag: "v0.3.1", version: "0.3.1", previousTag: "v0.3.0" },
  ]);
  expect(planReleases([], new Map([["v0.3.0", a]]), new Map(), a)).toHaveLength(1);
});

function assets(version: string): string[] {
  const bundles = [
    `Canto_${version}_x64-setup.exe`, `Canto_${version}_aarch64.app.tar.gz`,
    `Canto_${version}_x64.app.tar.gz`, `Canto_${version}_amd64.AppImage`,
  ];
  return ["latest.json", ...bundles.flatMap((name) => [name, `${name}.sig`])];
}

test("published releases missing an updater or a signed installer are rejected", () => {
  expect(hasRequiredAssets(assets("0.3.1"), "0.3.1")).toBe(true);
  expect(() => planReleases([], new Map([["v0.3.0", a]]), new Map([
    ["v0.3.0", { draft: false, assets: assets("0.3.0").filter((name) => !name.endsWith(".AppImage.sig")) }],
  ]), a)).toThrow("instaladores completos");
});

test("updater links must resolve to assets of the same draft release", () => {
  const names = assets("0.3.1");
  const release = {
    tag_name: "v0.3.1", draft: true, body: "## Alterações\n", assets: names.map((name, index) => ({ id: index + 1, name })),
  };
  const platforms = Object.fromEntries([
    ["windows-x86_64", "_x64-setup.exe"], ["darwin-aarch64", "_aarch64.app.tar.gz"],
    ["darwin-x86_64", "_x64.app.tar.gz"], ["linux-x86_64", "_amd64.AppImage"],
  ].map(([platform, suffix]) => {
    const asset = release.assets.find(({ name }) => name.endsWith(suffix))!;
    return [platform, { signature: "assinatura", url: `https://api.github.com/repos/juninmd/canto-widget/releases/assets/${asset.id}` }];
  }));
  const manifest = { version: "0.3.1", notes: "## Alterações\n", platforms };
  expect(() => verifyReleaseManifest(manifest, release, "v0.3.1", "0.3.1", "juninmd/canto-widget")).not.toThrow();
  manifest.platforms["windows-x86_64"].url = "https://api.github.com/repos/juninmd/canto-widget/releases/assets/999";
  expect(() => verifyReleaseManifest(manifest, release, "v0.3.1", "0.3.1", "juninmd/canto-widget")).toThrow("windows-x86_64");
});

test("refuses to reuse a version whose tag points to another commit", () => {
  expect(() => planReleases([], new Map([["v0.3.0", b]]), new Map(), a)).toThrow("outro commit");
});

test("uses the merged pull request title for Portuguese release notes", () => {
  const notes = releaseNotes(`Merge pull request #24 from feature\n\nfeat: aba Status [API]`, {
    sha: a, tag: "v0.3.1", version: "0.3.1", previousTag: "v0.3.0",
  }, "juninmd/canto-widget");
  expect(notes).toContain("feat: aba Status \\[API\\]");
  expect(notes).toContain("/compare/v0.3.0...v0.3.1");
  expect(notes).not.toContain("Merge pull request");
});

test("recovers the existing draft from its 0.3.0 changelog section", () => {
  const changelog = "## [Não publicado]\n\n## [0.3.0] - 2026-09-22\n\n### Corrigido\n\n- Falha.\n\n## [0.2.0]";
  expect(versionNotes(changelog, "0.3.0")).toBe("## Alterações\n\n### Corrigido\n\n- Falha.\n");
});
