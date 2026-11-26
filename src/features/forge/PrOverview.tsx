import { t } from "../../i18n";
import type { PrDetail } from "../../lib/api";
import { CiPill } from "./ForgePills";

const BOX = "rounded-xl border border-edge bg-ink/60 p-2.5";

/** The glance: what the change says, how its checks stand and who answered. */
export default function PrOverview({ detail }: { detail: PrDetail }) {
  const state = detail.jobs.some((j) => j.state === "failure") ? "failure" : detail.jobs.some((j) => j.state === "running") ? "running" : detail.jobs.length ? "success" : "none";
  const approved = detail.reviewers.filter((r) => r.state === "approved").length;
  const changes = detail.reviewers.some((r) => r.state === "changes");
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <div className={BOX}>
          <h3 className="m-0 text-[10.5px] font-semibold uppercase tracking-wide text-faint">{t("forge.pr.checks")}</h3>
          <div className="mt-1">
            <CiPill status={state} />
          </div>
          <p className="m-0 mt-1 text-[11px] text-muted">{t("forge.pr.jobsCount", { n: detail.jobs.length })}</p>
        </div>
        <div className={BOX}>
          <h3 className="m-0 text-[10.5px] font-semibold uppercase tracking-wide text-faint">{t("forge.pr.reviews")}</h3>
          <p className={`m-0 mt-1 text-xs font-semibold ${changes ? "text-danger" : approved > 0 ? "text-ok" : "text-muted"}`}>
            {changes ? t("forge.item.changes") : t("forge.pr.approvedCount", { n: approved })}
          </p>
          <p className="m-0 mt-1 text-[11px] text-muted">{t("forge.pr.askedCount", { n: detail.reviewers.length })}</p>
        </div>
      </div>
      <section className={BOX}>
        <h3 className="m-0 text-[10.5px] font-semibold uppercase tracking-wide text-faint">{t("forge.pr.description")}</h3>
        <p className={`m-0 mt-1 whitespace-pre-wrap break-words text-xs ${detail.body ? "text-fg" : "text-faint"}`}>{detail.body || t("forge.peek.noBody")}</p>
      </section>
      <p className="m-0 text-[11px] text-muted">{t("forge.peek.files", { n: detail.changed_files })}</p>
    </>
  );
}
