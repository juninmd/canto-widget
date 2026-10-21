import { t } from "../i18n";
import type { ForgeLists } from "../lib/api";
import type { Forge } from "../lib/forge";
import type { CiMap } from "../lib/forgeChecks";
import type { SummaryFocus } from "../lib/forgeFocus";
import { summarize } from "../lib/forgeSummary";

type Props = { forge: Forge; lists: ForgeLists; ci?: CiMap; focus: SummaryFocus | null; onFocus: (f: SummaryFocus | null) => void };

/** Four numbers that say what needs attention; each is also a toggle that narrows the lists to its group. */
export default function ForgeSummary({ forge, lists, ci, focus, onFocus }: Props) {
  const s = summarize(lists, ci);
  const pr = forge === "gitlab" ? "MRs" : "PRs";
  const tiles: { key: SummaryFocus; label: string; n: number; hot: string }[] = [
    { key: "reviews", label: t("forge.summary.reviews"), n: s.reviews, hot: s.reviews > 0 ? "text-accent-text" : "" },
    { key: "mine", label: t("forge.summary.mine", { pr }), n: s.mine, hot: "" },
    ...(s.failing === null ? [] : [{ key: "failing" as const, label: t("forge.summary.failing"), n: s.failing, hot: s.failing > 0 ? "text-danger" : "" }]),
    { key: "issues", label: t("forge.summary.issues"), n: s.issues, hot: "" },
  ];
  return (
    <div role="group" aria-label={t("forge.summary.label")} className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${tiles.length}, minmax(0, 1fr))` }}>
      {tiles.map((x) => {
        const on = focus === x.key;
        return (
          <button
            key={x.key}
            type="button"
            aria-pressed={on}
            title={t("uiForge.tileTitle", { label: x.label })}
            onClick={() => onFocus(on ? null : x.key)}
            className={`canto-hit rounded-xl border px-2 py-1.5 text-center transition-colors ${
              on ? "border-accent bg-accent/10" : "border-edge bg-panel hover:bg-hover active:bg-active"
            }`}
          >
            <span className={`block text-base font-semibold tabular-nums ${x.hot || "text-fg"}`}>{x.n}</span>
            <span className="block truncate text-[10px] text-muted">{x.label}</span>
          </button>
        );
      })}
    </div>
  );
}
