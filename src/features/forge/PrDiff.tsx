import { useState } from "react";
import { t } from "../../i18n";
import type { PrConvEntry, PrFile } from "../../lib/api";
import type { Loaded } from "./usePrLoad";
import Skeleton from "../../components/Skeleton";
import { parsePatch } from "./patchLines";
import { commentsByLine, groupThreads } from "./prThreads";

const ROW = { add: "bg-ok/15", del: "bg-danger/15", ctx: "", hunk: "bg-edge/60 text-muted" };

/** The patch of every file (or just one), with line numbers and the threads left on its lines. */
export default function PrDiff({ files, conv, only, onAll, onThreads }: { files: Loaded<PrFile[]>; conv: PrConvEntry[] | null; only: string | null; onAll: () => void; onThreads: () => void }) {
  const [shut, setShut] = useState<Record<string, boolean>>({});
  if (files.error)
    return (
      <p role="alert" className="m-0 text-[11px] text-danger">
        {files.error}
      </p>
    );
  if (!files.data) return <Skeleton label={t("forge.pr.filesLoading")} rows={3} />;
  const marks = commentsByLine(groupThreads(conv ?? []));
  const list = files.data.filter((f) => only === null || f.name === only);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[11px] text-muted">
        <button type="button" aria-pressed={only === null} onClick={onAll} className="canto-hit min-h-[24px] rounded-full border border-edge px-2.5 aria-pressed:border-accent aria-pressed:text-accent-text">
          {t("forge.pr.allFiles", { n: files.data.length })}
        </button>
        {only && <span className="min-w-0 truncate font-mono">{only}</span>}
      </div>
      {list.map((f) => {
        const lines = parsePatch(f.patch);
        const closed = shut[f.name] === true;
        return (
          <section key={f.name} aria-label={t("forge.pr.diffOf", { name: f.name })} className="overflow-hidden rounded-xl border border-edge bg-ink/60">
            <button type="button" aria-expanded={!closed} onClick={() => setShut({ ...shut, [f.name]: !closed })} className="canto-hit flex w-full items-center gap-2 bg-edge/40 px-2.5 py-1.5 text-left text-xs hover:bg-hover">
              <span aria-hidden="true">{closed ? "▸" : "▾"}</span>
              <span className="min-w-0 flex-1 break-all font-mono text-fg">{f.name}</span>
              <span className="font-mono text-[11px] tabular-nums text-ok">+{f.additions}</span>
              <span className="font-mono text-[11px] tabular-nums text-danger">−{f.deletions}</span>
            </button>
            {!closed && (lines.length === 0 ? (
              <p className="m-0 px-2.5 py-2 text-[11px] text-faint">{t("forge.pr.noPatch")}</p>
            ) : (
              <div className="overflow-x-auto font-mono text-[10.5px] leading-[1.5]">
                {lines.map((l, i) => {
                  const here = l.newNo !== null && l.kind !== "del" ? marks.get(`${f.name}:${l.newNo}`) : undefined;
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
            ))}
            {f.truncated && <p className="m-0 px-2.5 py-1 text-[11px] text-faint">{t("forge.pr.patchCut")}</p>}
          </section>
        );
      })}
    </div>
  );
}
