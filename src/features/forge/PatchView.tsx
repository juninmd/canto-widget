import { t } from "../../i18n";
import type { PrConvEntry, PrFile } from "../../lib/api";
import { parsePatch } from "./patchLines";
import { commentsByLine, groupThreads } from "./prThreads";

const ROW = { add: "bg-ok/15", del: "bg-danger/15", ctx: "", hunk: "bg-edge/60 text-muted" };

/** The patch of one file with line numbers and the threads left on its lines. */
export default function PatchView({ file, conv, onThreads }: { file: PrFile; conv: PrConvEntry[] | null; onThreads: () => void }) {
  const lines = parsePatch(file.patch);
  const marks = commentsByLine(groupThreads(conv ?? []));
  if (lines.length === 0) return <p className="m-0 px-2.5 py-2 text-[11px] text-faint">{t("forge.pr.noPatch")}</p>;
  return (
    <>
      <div className="overflow-x-auto font-mono text-[10.5px] leading-[1.5]">
        {lines.map((l, i) => {
          const here = l.newNo !== null && l.kind !== "del" ? marks.get(`${file.name}:${l.newNo}`) : undefined;
          return (
            <div key={i}>
              <div className={`flex min-w-max whitespace-pre ${ROW[l.kind]}`}>
                <span aria-hidden="true" className="w-9 shrink-0 select-none pr-2 text-right text-faint">{l.newNo ?? l.oldNo ?? ""}</span>
                <span className={l.kind === "add" ? "text-ok" : l.kind === "del" ? "text-danger" : ""}>{l.kind === "add" ? "+ " : l.kind === "del" ? "− " : l.kind === "ctx" ? "  " : ""}{l.text}</span>
              </div>
              {here?.map((th) => (
                <div key={th.key} className="sticky left-9 my-1 ml-9 mr-2 max-w-[calc(100%-2.75rem)] whitespace-normal rounded-lg border border-edge bg-panel px-2 py-1 font-sans text-xs">
                  <b>@{th.root.author}</b> {th.root.body}{" "}
                  <button type="button" onClick={onThreads} className="canto-hit text-accent-text underline">
                    {t(th.resolved ? "forge.pr.threadDone" : "forge.pr.threadOpen")}
                  </button>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      {file.truncated && <p className="m-0 px-2.5 py-1 text-[11px] text-faint">{t("forge.pr.patchCut")}</p>}
    </>
  );
}
