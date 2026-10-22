import { useEffect, useState, type CSSProperties } from "react";
import { api, type ReadArticle } from "../lib/api";
import { timeAgo } from "../lib/time";
import { t } from "../i18n";

const LINK = "canto-hit min-h-[24px] shrink-0 rounded-md px-1.5 hover:bg-hover hover:text-fg active:bg-active";

/** The favicon and the thumbnail come from Rust as `data:` URLs and are asked once per address. */
function useDataImage(load: () => Promise<string | null>) {
  const [source, setSource] = useState("");
  useEffect(() => {
    let alive = true;
    void load().then((data) => {
      if (alive && data) setSource(data);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return source;
}

/** One reading: the thumbnail when the entry has one, the source and the age, and the two actions. */
export default function ReadCard({
  article,
  index = 0,
  onMark,
  onError,
}: {
  article: ReadArticle;
  index?: number;
  onMark: (article: ReadArticle) => void;
  onError: (message: string) => void;
}) {
  const thumb = useDataImage(() => (article.has_image ? api.readsThumb(article.id) : Promise.resolve(null)));
  const icon = useDataImage(() => api.readsFavicon(article.host));
  return (
    <li
      data-read={article.id}
      style={{ "--i": Math.min(index, 10) } as CSSProperties}
      className={`wx-rise flex gap-2 rounded-lg border border-edge/60 px-2 py-1.5 transition-[opacity,background-color,border-color] duration-300 motion-reduce:transition-none ${
        article.unread ? "" : "opacity-60"
      }`}
    >
      {thumb && <img src={thumb} alt="" className="canto-img-in h-14 w-20 shrink-0 rounded object-cover" />}
      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={() => void api.openLink(article.url).catch((e) => onError(String(e)))}
          className="block w-full truncate text-left text-xs font-semibold text-fg hover:text-accent-text"
          title={t("reads.openTitle", { title: article.title })}
        >
          {article.title}
        </button>
        <div className="mt-0.5 flex items-center gap-1 text-[10px] text-faint">
          {icon ? (
            <img src={icon} alt="" className="size-3 shrink-0 rounded-sm" />
          ) : (
            <span className="grid size-3 shrink-0 place-items-center rounded-sm bg-edge text-[7px] uppercase text-muted">
              {article.source.slice(0, 1)}
            </span>
          )}
          <span className="min-w-0 truncate">{article.source}</span>
          {article.published_at > 0 && <span className="shrink-0">· {timeAgo(article.published_at)}</span>}
        </div>
        {article.summary && <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-muted">{article.summary}</p>}
        <div className="mt-1 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => void api.openLink(article.url).catch((e) => onError(String(e)))}
            className={LINK}
          >
            {t("reads.open")}
          </button>
          <button type="button" onClick={() => onMark(article)} className={`${LINK} text-faint`}>
            {article.unread ? t("reads.markRead") : t("reads.markUnread")}
          </button>
        </div>
      </div>
    </li>
  );
}
