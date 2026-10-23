import { type CSSProperties, useCallback, useState } from "react";
import { api, errText, type NewsItem } from "../lib/api";
import { ago, headerArt } from "../lib/steam";
import { useSteamView } from "../lib/useSteamView";
import { t } from "../i18n";
import ErrorBanner from "./ErrorBanner";
import Skeleton from "./Skeleton";
import SteamArt from "./SteamArt";
import SteamChips from "./SteamChips";

function Update({ item, index, open, onToggle }: { item: NewsItem; index: number; open: boolean; onToggle: () => void }) {
  return (
    <li data-steam-news={item.gid} style={{ "--i": index } as CSSProperties} className="steam-rise overflow-hidden rounded-xl border border-edge bg-ink/60 transition-colors hover:border-line">
      <button type="button" onClick={onToggle} aria-expanded={open} className="canto-hit flex w-full items-center gap-2.5 p-1.5 text-left">
        <SteamArt art={headerArt(item.appid)} name={item.game} className="aspect-[460/215] w-16 shrink-0 rounded-md" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="flex items-center gap-1.5">
            {item.fresh && <span title={t("steam.news.new")} className="steam-dot-new size-2 shrink-0 rounded-full bg-[#66c0f4]" />}
            <span className="truncate text-[13px] font-semibold text-fg">{item.title}</span>
          </span>
          <span className="truncate text-[11px] text-faint">
            {item.game} · {ago(item.date)}
          </span>
        </span>
        <span aria-hidden="true" className={`steam-chev shrink-0 px-1 text-faint ${open ? "rotate-90" : ""}`}>
          ›
        </span>
      </button>
      <div className="steam-log" data-open={open ? "" : undefined} aria-hidden={!open} inert={!open}>
        <div>
          {item.lines.length > 0 ? (
            <ul className="list-disc space-y-0.5 py-0.5 pl-8 pr-3 text-[11.5px] leading-relaxed text-muted marker:text-[#66c0f4]">
              {item.lines.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          ) : (
            <p className="px-8 text-[11.5px] text-muted">{t("steam.news.noLines")}</p>
          )}
          <button
            type="button"
            onClick={() => void api.openLink(item.url).catch(() => {})}
            className="canto-hit mb-2 ml-8 mt-1 text-[11px] text-[#66c0f4] hover:underline"
          >
            {t("steam.news.open")} ↗
          </button>
        </div>
      </div>
    </li>
  );
}

/** "Atualizações": the patch notes of the games installed or played lately, newest first, each
 *  opening into its changelog. The dot marks what came after the last "marcar como lidas". */
export default function SteamNews({ onRead }: { onRead: (unread: number) => void }) {
  const [filter, setFilter] = useState<"all" | "installed">("all");
  const [open, setOpen] = useState<string | null>(null);
  const load = useCallback(
    (force: boolean) =>
      api.steamNews(filter, force).then((news) => {
        onRead(news.unread);
        return news;
      }),
    [filter, onRead],
  );
  const { data, error, busy, run } = useSteamView(load);
  const [readError, setReadError] = useState("");

  async function markRead() {
    try {
      await api.steamNewsRead();
      setReadError("");
      await run(false);
    } catch (e) {
      setReadError(errText(e));
    }
  }

  if (!data) {
    return error ? <ErrorBanner message={error} onRetry={() => void run(true)} busy={busy} /> : <Skeleton label={t("steam.loading")} rows={5} />;
  }
  const first = data.items[0]?.gid ?? null;
  const shown = open === null ? first : open;
  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <p className="text-[11px] text-faint">{t("steam.news.hint")}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        <SteamChips
          label={t("steam.sub.news")}
          value={filter}
          onChange={setFilter}
          options={[
            { key: "all", label: t("steam.news.filter.all") },
            { key: "installed", label: t("steam.news.filter.installed") },
          ]}
        />
        <span className="ml-auto flex gap-1">
          {data.unread > 0 && (
            <button type="button" onClick={() => void markRead()} className="canto-hit min-h-7 rounded-lg border border-edge px-2 text-xs text-muted hover:bg-hover hover:text-fg">
              {t("steam.news.read")}
            </button>
          )}
          <button
            type="button"
            onClick={() => void run(true)}
            disabled={busy}
            className="canto-hit min-h-7 rounded-lg border border-edge px-2 text-xs text-muted hover:bg-hover hover:text-fg disabled:opacity-50"
          >
            {t("steam.refresh")}
          </button>
        </span>
      </div>
      {(error || readError) && <ErrorBanner message={error || readError} onRetry={() => void run(true)} busy={busy} />}
      {data.items.length === 0 ? (
        <p className="text-xs text-faint">{t("steam.news.empty")}</p>
      ) : (
        <ul key={filter} className="steam-swap min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
          {data.items.map((item, i) => (
            <Update key={item.gid} item={item} index={i} open={shown === item.gid} onToggle={() => setOpen(shown === item.gid ? "" : item.gid)} />
          ))}
        </ul>
      )}
    </div>
  );
}
