import type { PrFile } from "../../lib/api";

export type TreeRow = { kind: "dir"; path: string; depth: number } | { kind: "file"; file: PrFile; label: string; depth: number };

type Node = { dirs: Map<string, Node>; files: PrFile[] };

/** Pictures the diff can show: SVG is left out on purpose, it can carry script. */
export const isPicture = (name: string) => /\.(png|jpe?g|gif|webp)$/i.test(name);

/** Folders first, then files, each alphabetical; a folder with a single folder inside is written as one path. */
export function buildTree(files: PrFile[]): TreeRow[] {
  const root: Node = { dirs: new Map(), files: [] };
  for (const f of files) {
    const parts = f.name.split("/");
    let node = root;
    for (const dir of parts.slice(0, -1)) {
      let next = node.dirs.get(dir);
      if (!next) node.dirs.set(dir, (next = { dirs: new Map(), files: [] }));
      node = next;
    }
    node.files.push(f);
  }
  const rows: TreeRow[] = [];
  const walk = (node: Node, depth: number) => {
    for (const [name, child] of [...node.dirs].sort((a, b) => a[0].localeCompare(b[0]))) {
      let path = name;
      let cur = child;
      while (cur.files.length === 0 && cur.dirs.size === 1) {
        const [[n, next]] = [...cur.dirs];
        path += `/${n}`;
        cur = next;
      }
      rows.push({ kind: "dir", path, depth });
      walk(cur, depth + 1);
    }
    for (const file of [...node.files].sort((a, b) => a.name.localeCompare(b.name))) rows.push({ kind: "file", file, label: file.name.split("/").at(-1) ?? file.name, depth });
  };
  walk(root, 0);
  return rows;
}
