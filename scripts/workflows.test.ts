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
