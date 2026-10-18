import { useCallback, useEffect, useState } from "react";
import { api, errText, type ReadArticle, type ReadsView } from "../lib/api";
import { useRefreshEvent } from "../lib/useRefreshEvent";
import { t } from "../i18n";
import ErrorBanner from "./ErrorBanner";
import ReadCard from "./ReadCard";
import Skeleton from "./Skeleton";

const LINK = "canto-hit min-h-[24px] shrink-0 rounded-md px-1.5 hover:bg-hover hover:text-fg active:bg-active";

/** The RSS/Atom feeds the user added: what is unread, newest first, with thumbnails when the entry has one. */
export default function ReadsTab({ onError }: { onError: (message: string) => void }) {
  const [view, setView] = useState<ReadsView | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (force: boolean) => {
    setLoading(true);
    try {
      setView(await api.readsGet(force));
      setError("");
    } catch (e) {
      setError(errText(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(false);
  }, [load]);
  useRefreshEvent("reads", () => void load(false));

  async function mark(article: ReadArticle) {
    try {
      setView(await api.readsMark(article.id, article.unread));
    } catch (e) {
      onError(errText(e));
    }
  }

  if (view === null) {
    return error ? <ErrorBanner message={error} onRetry={() => void load(false)} /> : <Skeleton label={t("reads.loading")} rows={4} />;
  }

  const unread = view.items.filter((article) => article.unread).length;
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <span className="min-w-0 truncate font-medium text-muted">{t("reads.header", { unread, total: view.items.length })}</span>
        <button type="button" onClick={() => void load(true)} disabled={loading} title={t("reads.refreshTitle")} className={`${LINK} text-faint`}>
          {loading ? "..." : t("reads.refresh")}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
      {view.feeds.length > 0 && <FeedList view={view} onChanged={setView} />}
      {view.items.length === 0 ? (
        <p className="text-xs text-faint">{view.feeds.length === 0 ? t("reads.empty") : t("reads.emptyItems")}</p>
      ) : (
        <ul className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
          {view.items.map((article) => (
            <ReadCard key={article.id} article={article} onMark={mark} onError={onError} />
          ))}
        </ul>
      )}
      {view.feeds.length === 0 && <AddFeed onAdded={setView} />}
      <p className="text-[10px] text-faint">{t("reads.source")}</p>
    </div>
  );
}

function FeedList({ view, onChanged }: { view: ReadsView; onChanged: (view: ReadsView) => void }) {
  const [adding, setAdding] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-1 text-[10px]">
      <span className="text-faint">{t("reads.feeds")}</span>
      {view.feeds.map((feed) => (
        <span
          key={feed.url}
          data-feed={feed.url}
          title={feed.error ?? feed.url}
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 ${feed.error ? "bg-danger/15 text-danger" : "bg-edge text-muted"}`}
        >
          {feed.label || feed.url}
          <button
            type="button"
            aria-label={t("reads.removeTitle", { label: feed.label || feed.url })}
            onClick={() => void api.readsRemove(feed.url).then(onChanged)}
            className="text-faint hover:text-danger"
          >
            ✕
          </button>
        </span>
      ))}
      <button type="button" onClick={() => setAdding((on) => !on)} className={LINK}>
        +
      </button>
      {adding && <AddFeed onAdded={(next) => { onChanged(next); setAdding(false); }} />}
    </div>
  );
}

/** Added one at a time and only after Rust confirms it parses. */
function AddFeed({ onAdded }: { onAdded: (view: ReadsView) => void }) {
  const [feed, setFeed] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  async function save() {
    setWorking(true);
    try {
      onAdded(await api.readsAdd(feed));
      setFeed("");
      setError("");
    } catch (e) {
      setError(errText(e));
    } finally {
      setWorking(false);
    }
  }

  return (
    <form
      className="flex flex-col gap-1"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      <label className="text-[11px] text-muted" htmlFor="reads-add">
        {t("reads.add.label")}
      </label>
      <div className="flex items-center gap-1.5">
        <input
          id="reads-add"
          value={feed}
          onChange={(e) => setFeed(e.target.value)}
          placeholder={t("reads.add.placeholder")}
          className="canto-field min-w-0 flex-1 px-2 py-1 text-xs"
        />
        <button type="submit" disabled={working || feed.trim() === ""} className={`${LINK} font-semibold text-accent-text`}>
          {working ? t("reads.add.working") : t("reads.add.submit")}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </form>
  );
}
