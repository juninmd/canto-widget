export type DiffLine = { kind: "hunk" | "add" | "del" | "ctx"; text: string; oldNo: number | null; newNo: number | null };

const HUNK = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/;

/** A unified patch as numbered lines; the "\ No newline" marker is dropped. */
export function parsePatch(patch: string): DiffLine[] {
  const out: DiffLine[] = [];
  let oldNo = 0;
  let newNo = 0;
  for (const raw of patch.split("\n")) {
    const hunk = HUNK.exec(raw);
    if (hunk) {
      oldNo = Number(hunk[1]);
      newNo = Number(hunk[2]);
      out.push({ kind: "hunk", text: raw, oldNo: null, newNo: null });
    } else if (raw.startsWith("+")) out.push({ kind: "add", text: raw.slice(1), oldNo: null, newNo: newNo++ });
    else if (raw.startsWith("-")) out.push({ kind: "del", text: raw.slice(1), oldNo: oldNo++, newNo: null });
    else if (raw === "" || raw.startsWith("\\")) continue;
    else out.push({ kind: "ctx", text: raw.slice(1), oldNo: oldNo++, newNo: newNo++ });
  }
  return out;
}
