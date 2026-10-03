import { expect, test } from "bun:test";
import { releaseNotes } from "../../scripts/release-notes";
import { plainNotes } from "./releaseNotes";

const candidate = { sha: "a".repeat(40), tag: "v0.4.0", version: "0.4.0", previousTag: "v0.3.1" };
const repo = "juninmd/canto-widget";

test("the updater card reads the release notes as plain sentences: no symbols, no links, no install table", () => {
  const md = releaseNotes("Merge pull request #24 from x\n\nfeat: aba Status [API]", candidate, repo, [
    { sha: "b".repeat(40), subject: "feat(status): *novo* feed" },
    { sha: "c".repeat(40), subject: "fix: ring twice" },
  ]);
  const plain = plainNotes(md);
  expect(plain.split("\n")[0]).toBe("✨ 1 novidade · 🐛 1 correção");
  expect(plain).toContain("• status · *novo* feed (bbbbbbb)");
  for (const symbol of ["**", "](", "##", "http", "|", "Baixar", "compare"]) expect(plain).not.toContain(symbol);
});

test("text that only looks like Markdown survives and an empty body stays empty", () => {
  expect(plainNotes("Veja [isto] (não é link) e a\\*b")).toBe("Veja [isto] (não é link) e a*b");
  expect(plainNotes("")).toBe("");
});

test("blank lines are dropped: the card is short and every line should carry something", () => {
  expect(plainNotes("## A\n\n\n\n- x\n\n\n- y")).toBe("A\n• x\n• y");
});
