import { useState } from "react";
import type { ForgeList, ForgeSection as ForgeSectionKey } from "../lib/api";
import type { Forge } from "../lib/forge";
import { checkKey, type CiMap, type ConflictMap } from "../lib/forgeChecks";
import { loadSnoozes, oldestFirst, snoozeUntil } from "../lib/reviewRadar";
import { t } from "../i18n";
import ForgeRow from "./ForgeRow";

type Props = {
  title: string;
  section: ForgeSectionKey;
  forge: Forge;
  list: ForgeList;
  login: string;
  filtered: boolean;
  loadingMore: boolean;
  onMore: () => void;
  /** CI badges loaded in batch (GitHub); a PR missing here keeps the "ver CI" link. */
  ci?: CiMap;
  /** Merge conflicts the GitHub CI batch found; GitLab items already carry `conflict`. */
  conflicts?: ConflictMap;
};

export default function ForgeSection({ title, section, forge, list, login, filtered, loadingMore, onMore, ci, conflicts }: Props) {
  const rest = list.total - list.items.length;
  const radar = section === "review_requested";
  const [snoozed, setSnoozed] = useState(loadSnoozes);
  const [showSnoozed, setShowSnoozed] = useState(false);
  const ordered = radar ? oldestFirst(list.items) : list.items;
  const hidden = radar ? ordered.filter((i) => snoozed[i.url] > Date.now()) : [];
  const shown = radar && !showSnoozed ? ordered.filter((i) => !hidden.includes(i)) : ordered;
  return (
    <section aria-label={title}>
      <h3 className="sticky top-0 z-10 -mx-0.5 mb-1.5 flex items-center gap-1.5 bg-panel px-0.5 py-1 text-xs font-semibold text-fg">
        {title}
        <span className="rounded-full bg-edge px-1.5 text-[10px] font-medium tabular-nums text-muted">{list.total}</span>
      </h3>
      {radar && hidden.length > 0 && (
        <button
          type="button"
          onClick={() => setShowSnoozed(!showSnoozed)}
          className="mb-1 min-h-[24px] text-[11px] text-muted canto-hit rounded-md px-1.5 hover:bg-hover hover:text-fg active:bg-active"
        >
          {showSnoozed ? t("forge.snoozedHide") : t("forge.snoozedShow", { n: hidden.length })}
        </button>
      )}
      {list.items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-edge px-3 py-3 text-center text-[11px] text-faint">{filtered ? t("forge.emptyFiltered") : t("forge.empty")}</p>
      ) : (
        <ul className="space-y-1.5">
          {shown.map((it) => (
            <ForgeRow
              key={it.url}
              item={it}
              login={login}
              forge={forge}
              waiting={radar}
              ci={ci?.[checkKey(it.repo, it.number)]}
              conflict={it.is_pr && (it.conflict === true || conflicts?.[checkKey(it.repo, it.number)] === true)}
              onSnooze={radar ? () => setSnoozed(snoozeUntil(it.url)) : undefined}
            />
          ))}
        </ul>
      )}
      {rest > 0 && (
        <button
          type="button"
          onClick={onMore}
          disabled={loadingMore}
          className="canto-hit mt-1.5 min-h-7 w-full rounded-xl bg-edge text-[11px] text-muted hover:bg-active hover:text-fg active:bg-active disabled:opacity-60"
        >
          {loadingMore ? t("forge.loadingMore") : t("forge.showMore", { n: rest })}
        </button>
      )}
    </section>
  );
}
