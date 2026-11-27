import { expect, test } from "bun:test";
import type { PrFile } from "../../lib/api";
import { buildTree, isPicture } from "./fileTree";

const f = (name: string): PrFile => ({ name, status: "modified", additions: 1, deletions: 0, patch: "", truncated: false });
const shape = (files: string[]) => buildTree(files.map(f)).map((r) => (r.kind === "dir" ? `${"  ".repeat(r.depth)}${r.path}/` : `${"  ".repeat(r.depth)}${r.label}`));

test("folders come first, a chain of single folders is one path, files follow alphabetically", () => {
  expect(shape(["src/features/forge/B.tsx", "src/features/forge/A.tsx", "README.md", "docs/prints/a.png", "assets/logo.png"])).toEqual([
    "assets/",
    "  logo.png",
    "docs/prints/",
    "  a.png",
    "src/features/forge/",
    "  A.tsx",
    "  B.tsx",
    "README.md",
  ]);
});

test("a folder that holds a file and a folder is not folded into one path", () => {
  expect(shape(["src/a.ts", "src/lib/b.ts"])).toEqual(["src/", "  lib/", "    b.ts", "  a.ts"]);
});

test("only raster pictures are previewed", () => {
  expect(["a.PNG", "b.jpeg", "c.webp", "d.gif"].every(isPicture)).toBe(true);
  expect(isPicture("logo.svg")).toBe(false);
  expect(isPicture("readme.md")).toBe(false);
});
