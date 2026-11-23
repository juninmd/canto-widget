import { t } from "../../i18n";
import type { ForgeLists } from "../../lib/api";
import type { Forge } from "./forge";
import type { CiMap } from "./forgeChecks";
import type { SummaryFocus } from "./forgeFocus";
import { summarize } from "./forgeTotals";

type Props = { forge: Forge; lists: ForgeLists; ci?: CiMap; focus: SummaryFocus | null; onFocus: (f: SummaryFocus | null) => void; /** Items that ask for me right now; drawn as the ring on the left. */ need?: number };

const CIRCLE = 2 * Math.PI * 36;

/** Four numbers that say what needs attention; each is also a toggle that narrows the lists to its group. */
export default function ForgeSummary({ forge, lists, ci, focus, onFocus, need = 0 }: Props) {
  const s = summarize(lists, ci);
  const pr = forge === "gitlab" ? "MRs" : "PRs";
  const tiles: { key: SummaryFocus; label: string; n: number; hot: string }[] = [
    { key: "reviews", label: t("forge.summary.reviews"), n: s.reviews, hot: s.reviews > 0 ? "text-accent-text" : "" },
    // GitLab has no third-party PRs list, so the tile only exists for GitHub.
    ...(forge === "github"
      ? [{ key: "others" as const, label: t("forge.summary.others"), n: s.others, hot: s.others > 0 ? "text-warn" : "" }]
      : []),
    { key: "mine", label: t("forge.summary.mine", { pr }), n: s.mine, hot: "" },
    ...(s.failing === null ? [] : [{ key: "failing" as const, label: t("forge.summary.failing"), n: s.failing, hot: s.failing > 0 ? "text-danger" : "" }]),
    { key: "issues", label: t("forge.summary.issues"), n: s.issues, hot: "" },
  ];
  const total = s.reviews + s.others + s.mine + s.issues;
  const share = total > 0 ? Math.min(1, need / total) : 0;
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-edge bg-gradient-to-br from-accent/10 to-cat-meet/10 p-2.5">
      <div role="img" aria-label={t("forge.radar.label", { n: need, total })} className="relative size-[88px] shrink-0">
        <svg viewBox="0 0 92 92" className="size-full -rotate-90" aria-hidden="true">
          <circle cx="46" cy="46" r="36" fill="none" strokeWidth="9" className="stroke-edge" />
          <circle cx="46" cy="46" r="36" fill="none" strokeWidth="9" strokeLinecap="round" className="stroke-danger" strokeDasharray={`${CIRCLE * share} ${CIRCLE}`} />
        </svg>
        <span className="absolute inset-0 grid place-content-center text-center" aria-hidden="true">
          <b className="text-xl leading-none tabular-nums text-fg">{need}</b>
          <small className="text-[9px] leading-tight text-muted">{t("forge.radar.center")}</small>
        </span>
      </div>
    <div role="group" aria-label={t("forge.summary.label")} className="grid min-w-0 flex-1 gap-1.5" style={{ gridTemplateColumns: `repeat(${tiles.length > 4 ? 3 : 2}, minmax(0, 1fr))` }}>
      {tiles.map((x) => {
        const on = focus === x.key;
        return (
          <button
            key={x.key}
            type="button"
            aria-pressed={on}
            title={t("uiForge.tileTitle", { label: x.label })}
            onClick={() => onFocus(on ? null : x.key)}
            className={`canto-hit rounded-xl border px-1.5 py-1 text-center transition-colors ${
              on ? "border-accent bg-accent/10" : "border-edge bg-panel hover:bg-hover active:bg-active"
            }`}
          >
            <span className={`block text-base font-semibold tabular-nums ${x.hot || "text-fg"}`}>{x.n}</span>
            <span className="block truncate text-[10px] text-muted">{x.label}</span>
          </button>
        );
      })}
    </div>
    </div>
  );
}
