import { t } from "../i18n";
import type { ForgeLists } from "../lib/api";
import type { Forge } from "../lib/forge";
import type { CiMap } from "../lib/forgeChecks";
import { summarize } from "../lib/forgeSummary";

/** Four numbers that say what needs attention before the lists: reviews owed, my PRs/MRs, red CI, issues. */
export default function ForgeSummary({ forge, lists, ci }: { forge: Forge; lists: ForgeLists; ci?: CiMap }) {
  const s = summarize(lists, ci);
  const pr = forge === "gitlab" ? "MRs" : "PRs";
  const tiles = [
    { label: t("forge.summary.reviews"), n: s.reviews, hot: s.reviews > 0 ? "text-accent-text" : "" },
    { label: t("forge.summary.mine", { pr }), n: s.mine, hot: "" },
    ...(s.failing === null ? [] : [{ label: t("forge.summary.failing"), n: s.failing, hot: s.failing > 0 ? "text-danger" : "" }]),
    { label: t("forge.summary.issues"), n: s.issues, hot: "" },
  ];
  return (
    <div role="group" aria-label={t("forge.summary.label")} className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${tiles.length}, minmax(0, 1fr))` }}>
      {tiles.map((x) => (
        <div key={x.label} className="rounded-xl border border-edge bg-panel px-2 py-1.5 text-center">
          <div className={`text-base font-semibold tabular-nums ${x.hot || "text-fg"}`}>{x.n}</div>
          <div className="truncate text-[10px] text-muted">{x.label}</div>
        </div>
      ))}
    </div>
  );
}
