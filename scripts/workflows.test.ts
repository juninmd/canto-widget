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

test("ci.yml waives no lint", () => {
  for (const command of clippyCommands("ci.yml")) expect(command).not.toContain(" -A ");
});

// 50491a0 reached main with a map_or that Rust 1.99 flags and history cannot be edited, so the release verify
// waives that one lint for that one commit. Drop it, and this test, with a ci: commit once v0.25.0 is out.
test("the release verify waives one lint for one commit and nothing else", () => {
  const [command] = clippyCommands("release-commit.yml");
  expect(command?.match(/-A [\w:]+/g)).toEqual(["-A clippy::unnecessary_map_or"]);
  expect(command).toContain("inputs.sha == '50491a00449c2b98dd9c49d211e7e65573edef41'");
});
