import { api, type PrJob } from "../../lib/api";
import { t } from "../../i18n";
import type { PrBackend } from "./prApi";
import { CiPill, Pill } from "./ForgePills";

function span(seconds: number): string {
  if (seconds <= 0) return "";
  return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/** Jobs of the head pipeline, grouped by stage on GitLab; each one opens its log on the forge. */
export default function PrPipeline({ back, jobs }: { back: PrBackend; jobs: PrJob[] }) {
  if (jobs.length === 0) return <p className="m-0 text-[11px] text-faint">{t("forge.peek.noJobs")}</p>;
  const stages: [string, PrJob[]][] = [];
  for (const j of jobs) {
    const name = j.stage || t("forge.pr.stageDefault");
    const held = stages.find(([s]) => s === name);
    if (held) held[1].push(j);
    else stages.push([name, [j]]);
  }
  return (
    <div className="space-y-3">
      {stages.map(([stage, list]) => (
        <section key={stage} aria-label={t("forge.pr.stage", { name: stage })} className="space-y-1.5">
          <h3 className="m-0 text-[10.5px] font-semibold uppercase tracking-wide text-faint">{stage}</h3>
          <ul className="m-0 list-none space-y-1.5 p-0">
            {list.map((j) => (
              <li key={`${j.name}|${j.url}`} className="flex items-center gap-2 rounded-lg border border-edge bg-ink/60 px-2.5 py-1.5 text-xs">
                <span className="min-w-0 flex-1 truncate font-mono text-fg">{j.name}</span>
                {span(j.seconds) && <span className="font-mono text-[11px] tabular-nums text-faint">{span(j.seconds)}</span>}
                {j.label ? <Pill tone="neutral">{j.label}</Pill> : <CiPill status={j.state} />}
                {j.url && (
                  <button type="button" onClick={() => void api.openLink(j.url).catch(() => {})} aria-label={t("forge.pr.openJob", { name: j.name, host: back.host })} title={t("forge.pr.openJob", { name: j.name, host: back.host })} className="canto-hit grid size-6 shrink-0 place-items-center rounded-md text-faint hover:text-fg">
                    ↗
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
