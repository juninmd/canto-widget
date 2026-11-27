import { useState } from "react";
import { t } from "../../i18n";
import type { PrConvEntry, PrFile } from "../../lib/api";
import type { Loaded } from "./usePrLoad";
import type { PrBackend } from "./prApi";
import Skeleton from "../../components/Skeleton";
import { buildTree, isPicture } from "./fileTree";
import PatchView from "./PatchView";
import PrImageDiff from "./PrImageDiff";

const SEG = "canto-hit grid min-h-[26px] place-items-center rounded-md px-2 text-xs text-muted aria-pressed:bg-panel aria-pressed:text-accent-text";

function FileCard({ file, label, open, back, conv, base, head, onToggle, onThreads }: { file: PrFile; label: string; open: boolean; back: PrBackend; conv: PrConvEntry[] | null; base: string; head: string; onToggle: () => void; onThreads: () => void }) {
  const talk = conv?.filter((c) => c.path === file.name && !c.reply).length ?? 0;
  return (
    <section aria-label={t("forge.pr.diffOf", { name: file.name })} className="overflow-hidden rounded-xl border border-edge bg-panel">
      <button type="button" aria-expanded={open} onClick={onToggle} className="canto-hit flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs hover:bg-hover">
        <span aria-hidden="true" className="w-3 text-faint">{open ? "▾" : "▸"}</span>
        <span aria-hidden="true">{isPicture(file.name) ? "🖼" : "📄"}</span>
        <span className="min-w-0 flex-1 break-all font-mono text-fg">{label}</span>
        {file.status !== "modified" && <span className="rounded-full bg-edge px-1.5 text-[10.5px] text-muted">{t(`forge.pr.status.${file.status}`)}</span>}
        {talk > 0 && <span className="text-[10.5px] text-warn">{t("forge.pr.threadsCount", { n: talk })}</span>}
        <span className="font-mono text-[11px] tabular-nums text-ok">+{file.additions}</span>
        <span className="font-mono text-[11px] tabular-nums text-danger">−{file.deletions}</span>
      </button>
      {open && <div className="border-t border-edge">{isPicture(file.name) ? <PrImageDiff back={back} file={file} base={base} head={head} /> : <PatchView file={file} conv={conv} onThreads={onThreads} />}</div>}
    </section>
  );
}

/** Every changed file, as a folder tree or a flat list, each opening its own diff (or before/after for a picture). */
export default function PrFiles({ back, files, conv, base, head, onThreads }: { back: PrBackend; files: Loaded<PrFile[]>; conv: PrConvEntry[] | null; base: string; head: string; onThreads: () => void }) {
  const [view, setView] = useState<"tree" | "list">("tree");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Set<string>>(new Set());
  if (files.error)
    return (
      <p role="alert" className="m-0 text-[11px] text-danger">
        {files.error}
      </p>
    );
  if (!files.data) return <Skeleton label={t("forge.pr.filesLoading")} rows={3} />;
  if (files.data.length === 0) return <p className="m-0 text-[11px] text-faint">{t("forge.pr.filesEmpty")}</p>;
  const all = files.data;
  const needle = q.trim().toLowerCase();
  const shown = all.filter((f) => f.name.toLowerCase().includes(needle));
  const flip = (name: string) => setOpen((s) => (s.has(name) ? new Set([...s].filter((n) => n !== name)) : new Set(s).add(name)));
  const adds = all.reduce((n, f) => n + f.additions, 0);
  const dels = all.reduce((n, f) => n + f.deletions, 0);
  const card = (f: PrFile, label: string) => <FileCard key={f.name} file={f} label={label} open={open.has(f.name)} back={back} conv={conv} base={base} head={head} onToggle={() => flip(f.name)} onThreads={onThreads} />;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <input value={q} onChange={(e) => setQ(e.target.value)} aria-label={t("forge.pr.filter.files")} placeholder={t("forge.pr.filter.files")} className="canto-field min-w-0 flex-1 px-2 py-1 text-xs" />
        <div role="group" aria-label={t("forge.pr.view")} className="flex shrink-0 gap-0.5 rounded-lg bg-edge/50 p-0.5">
          <button type="button" aria-pressed={view === "tree"} onClick={() => setView("tree")} className={SEG} aria-label={t("forge.pr.view.tree")} title={t("forge.pr.view.tree")}>
            ⛶
          </button>
          <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")} className={SEG} aria-label={t("forge.pr.view.list")} title={t("forge.pr.view.list")}>
            ☰
          </button>
        </div>
        <button type="button" onClick={() => setOpen(open.size ? new Set() : new Set(shown.map((f) => f.name)))} className="canto-hit min-h-[26px] shrink-0 rounded-md border border-edge px-2 text-[11px] text-muted hover:bg-hover hover:text-fg">
          {t(open.size ? "forge.pr.collapseAll" : "forge.pr.expandAll")}
        </button>
      </div>
      <p className="m-0 text-[11px] text-muted">
        {t("forge.pr.filesTotal", { n: all.length })} · <span className="text-ok">+{adds}</span> <span className="text-danger">−{dels}</span>
      </p>
      {shown.length === 0 && <p className="m-0 text-[11px] text-faint">{t("forge.pr.noMatch")}</p>}
      <div className="space-y-1.5">
        {view === "list" || needle
          ? shown.map((f) => card(f, f.name))
          : buildTree(shown).map((r) =>
              r.kind === "dir" ? (
                <p key={`d:${r.path}:${r.depth}`} style={{ marginLeft: r.depth * 14 }} className="m-0 flex items-center gap-1.5 pt-1 text-[11.5px] font-semibold text-muted">
                  <span aria-hidden="true">📁</span>
                  {r.path}
                </p>
              ) : (
                <div key={r.file.name} style={{ marginLeft: r.depth * 14 }}>
                  {card(r.file, r.label)}
                </div>
              ),
            )}
      </div>
    </div>
  );
}
