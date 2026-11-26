import { useEffect, useState } from "react";
import { api, errText, type PrConvEntry } from "../../lib/api";
import { timeAgo } from "../../lib/time";
import { t } from "../../i18n";
import Skeleton from "../../components/Skeleton";

const BTN = "canto-hit min-h-[24px] rounded-md border border-edge px-2 text-[11px] text-muted hover:bg-hover hover:text-fg";

/** The comments of a PR (general and inline), fetched only once the user opens them to spare the API quota. */
export default function PrConversation({ repo, number }: { repo: string; number: number }) {
  const [entries, setEntries] = useState<PrConvEntry[] | null>(null);
  const [error, setError] = useState("");
  const [bots, setBots] = useState(true);

  useEffect(() => {
    let live = true;
    setEntries(null);
    setError("");
    api.githubPrConversation(repo, number).then(
      (list) => live && setEntries(list),
      (e) => live && setError(errText(e)),
    );
    return () => {
      live = false;
    };
  }, [repo, number]);

  if (error)
    return (
      <p role="alert" className="m-0 text-[11px] text-danger">
        {error}
      </p>
    );
  if (!entries) return <Skeleton label={t("forge.peek.convLoading")} rows={2} />;
  const shown = entries.filter((c) => bots || !c.bot);
  const hasBots = entries.some((c) => c.bot);
  return (
    <div className="space-y-1.5">
      {hasBots && (
        <button type="button" aria-pressed={!bots} onClick={() => setBots(!bots)} className={BTN}>
          {t(bots ? "forge.peek.hideBots" : "forge.peek.showBots")}
        </button>
      )}
      {shown.length === 0 && <p className="m-0 text-[11px] text-faint">{t("forge.peek.convEmpty")}</p>}
      <ul aria-label={t("forge.peek.convLabel")} className="m-0 list-none space-y-1.5 p-0">
        {shown.map((c) => (
          <li key={c.id} className={`rounded-lg border border-edge bg-panel/60 p-1.5 ${c.reply ? "ml-3" : ""}`}>
            <div className="flex items-center gap-1.5 text-[11px] text-muted">
              <b className="min-w-0 truncate text-fg">@{c.author || "?"}</b>
              {c.bot && <span className="rounded-full bg-edge px-1.5 text-[10px]">{t("forge.peek.bot")}</span>}
              <span className="text-faint">{timeAgo(c.created_at)}</span>
              <button type="button" onClick={() => void api.openLink(c.url).catch(() => {})} aria-label={t("forge.peek.openComment", { author: c.author })} title={t("forge.peek.openComment", { author: c.author })} className="canto-hit ml-auto grid size-5 shrink-0 place-items-center rounded-md text-faint hover:text-fg">
                ↗
              </button>
            </div>
            {c.path && (
              <p className="m-0 mt-0.5 truncate font-mono text-[10.5px] text-muted">
                {c.path}
                {c.line > 0 && `:${c.line}`}
              </p>
            )}
            {c.hunk && <pre aria-label={t("forge.peek.diff")} className="m-0 mt-0.5 max-h-24 overflow-auto rounded-md bg-ink p-1 font-mono text-[10px] text-muted">{c.hunk}</pre>}
            <p className="m-0 mt-0.5 whitespace-pre-wrap break-words text-xs text-fg">{c.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
