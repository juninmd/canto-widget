import { t } from "../../i18n";
import type { PrConvEntry, PrFile } from "../../lib/api";
import type { Loaded } from "./usePrLoad";
import Skeleton from "../../components/Skeleton";

/** Changed files with their counts; picking one opens its diff. */
export default function PrFiles({ files, conv, onPick }: { files: Loaded<PrFile[]>; conv: PrConvEntry[] | null; onPick: (name: string) => void }) {
  if (files.error)
    return (
      <p role="alert" className="m-0 text-[11px] text-danger">
        {files.error}
      </p>
    );
  if (!files.data) return <Skeleton label={t("forge.pr.filesLoading")} rows={3} />;
  if (files.data.length === 0) return <p className="m-0 text-[11px] text-faint">{t("forge.pr.filesEmpty")}</p>;
  return (
    <ul aria-label={t("forge.pr.filesLabel")} className="m-0 list-none divide-y divide-edge rounded-xl border border-edge bg-ink/60 p-0">
      {files.data.map((f) => {
        const talk = conv?.filter((c) => c.path === f.name && !c.reply).length ?? 0;
        return (
          <li key={f.name}>
            <button type="button" onClick={() => onPick(f.name)} aria-label={t("forge.pr.diffOf", { name: f.name })} className="canto-hit flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs hover:bg-hover">
              <span className="min-w-0 flex-1 break-all font-mono text-fg">{f.name}</span>
              {f.status !== "modified" && <span className="text-[10.5px] text-muted">{t(`forge.pr.status.${f.status}`)}</span>}
              {talk > 0 && <span className="text-[10.5px] text-warn">{t("forge.pr.threadsCount", { n: talk })}</span>}
              <span className="font-mono text-[11px] tabular-nums text-ok">+{f.additions}</span>
              <span className="font-mono text-[11px] tabular-nums text-danger">−{f.deletions}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
