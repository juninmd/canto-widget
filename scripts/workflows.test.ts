import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

function clippyCommands(workflow: string): string[] {
  const text = readFileSync(new URL(`../.github/workflows/${workflow}`, import.meta.url), "utf8");
  return text.split(/\r?\n/).filter((line) => line.includes("cargo clippy"));
}

// A red CI is fixed in the code. A bot once dropped -D warnings to get green, and the release queue then
// stalled on a commit whose lint could not be fixed anymore.
test.each(["ci.yml", "release-commit.yml"])("%s fails on any clippy warning", (workflow) => {
  const commands = clippyCommands(workflow);
  expect(commands.length).toBeGreaterThan(0);
  for (const command of commands) expect(command).toContain("-D warnings");
});

test.each(["ci.yml", "release-commit.yml"])("%s waives no lint", (workflow) => {
  for (const command of clippyCommands(workflow)) expect(command).not.toContain(" -A ");
});

// A resumed draft keeps the commit it was first made for. Plan may have folded that commit into a later cut,
// so the draft is pointed at the commit being built, or its publish would tag a commit the token cannot tag.
test("a resumed draft is retargeted to the commit being released", () => {
  const text = readFileSync(new URL("../.github/workflows/release-commit.yml", import.meta.url), "utf8");
  const edit = text.split(/\r?\n/).find((line) => line.includes("gh release edit") && line.includes("--notes-file"));
  expect(edit).toContain('--target "$RELEASE_SHA"');
});
