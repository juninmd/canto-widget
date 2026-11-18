import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api, errText, type ReadArticle, type ReadsView } from "../../lib/api";
import { useRefreshEvent } from "../../lib/useRefreshEvent";
import { t } from "../../i18n";
import ErrorBanner from "../../components/ErrorBanner";
import ReadCard from "./ReadCard";
import Skeleton from "../../components/Skeleton";
import SearchField from "../../components/SearchField";
import FilterChips from "../../components/FilterChips";
import ViewSwitch from "../../components/ViewSwitch";
import ResultsMeta from "../../components/ResultsMeta";
import DataTable, { type Column } from "../../components/DataTable";
import { useViewPref } from "../../lib/useViewPref";
import { fold, foldIncludes } from "../../lib/fold";
import { LOCALE } from "../../i18n";

const VIEWS = ["list", "table"] as const;
type Seen = "unread" | "read";

const columns = (mark: (a: ReadArticle) => void, onError: (m: string) => void): Column<ReadArticle>[] => [
  {
    key: "title",
    label: t("reads.col.title"),
    render: (a) => (
      <button
        type="button"
        title={t("reads.openTitle", { title: a.title })}
        onClick={() => void api.openLink(a.url).catch((e) => onError(String(e)))}
        className={`canto-hit max-w-full truncate text-left hover:underline ${a.unread ? "font-medium text-fg" : "text-muted"}`}
      >
        {a.title}
      </button>
    ),
    sort: (a) => a.title,
  },
  { key: "source", label: t("reads.col.source"), render: (a) => a.source, sort: (a) => a.source },
  {
    key: "date",
    label: t("reads.col.date"),
    render: (a) => (a.published_at ? new Date(a.published_at).toLocaleDateString(LOCALE, { day: "2-digit", month: "short" }) : "—"),
    sort: (a) => a.published_at,
  },
  {
    key: "state",
    label: t("reads.col.state"),
    render: (a) => (
      <button type="button" onClick={() => mark(a)} title={a.unread ? t("reads.markRead") : t("reads.markUnread")} className="canto-hit underline-offset-2 hover:underline">
        {a.unread ? t("reads.state.unread") : t("reads.state.read")}
      </button>
    ),
    sort: (a) => Number(a.unread),
  },
];

const LINK = "canto-hit min-h-[24px] shrink-0 rounded-md px-1.5 hover:bg-hover hover:text-fg active:bg-active";

/** The RSS/Atom feeds the user added: what is unread, newest first, with thumbnails when the entry has one. */
export default function ReadsTab({ onError }: { onError: (message: string) => void }) {
  const [view, setView] = useState<ReadsView | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [seen, setSeen] = useState<Seen | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [layout, setLayout] = useViewPref("reads", VIEWS);

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

  // A double click must not mark and unmark the same card: the second click waits for the first answer.
  const marking = useRef(new Set<string>());
  async function mark(article: ReadArticle) {
    if (marking.current.has(article.id)) return;
    marking.current.add(article.id);
    try {
      setView(await api.readsMark(article.id, article.unread));
    } catch (e) {
      onError(errText(e));
    } finally {
      marking.current.delete(article.id);
    }
  }

  const items = view?.items;
  const sources = useMemo(() => [...new Set((items ?? []).map((a) => a.source).filter(Boolean))], [items]);
  const visible = useMemo(() => {
    const needle = fold(query.trim());
    return (items ?? []).filter(
      (a) =>
        (seen === null || a.unread === (seen === "unread")) &&
        (source === null || a.source === source) &&
        (!needle || foldIncludes(a.title, needle) || foldIncludes(a.source, needle) || foldIncludes(a.summary, needle)),
    );
  }, [items, query, seen, source]);

  if (view === null) {
    return error ? <ErrorBanner message={error} onRetry={() => void load(false)} /> : <Skeleton label={t("reads.loading")} rows={4} />;
  }

  const unread = view.items.filter((article) => article.unread).length;
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <span className="min-w-0 truncate font-medium text-muted">{t("reads.header", { unread, total: view.items.length })}</span>
        <button
          type="button"
          onClick={() => void load(true)}
          disabled={loading}
          aria-busy={loading}
          title={t("reads.refreshTitle")}
          className={`${LINK} text-faint`}
        >
          {loading ? t("common.refreshing") : t("reads.refresh")}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
      {view.feeds.length > 0 && <FeedList view={view} onChanged={setView} onError={onError} />}
      {view.items.length > 0 && (
        <>
          <div className="flex gap-2">
            <SearchField value={query} onChange={setQuery} label={t("reads.find.label")} placeholder={t("reads.find.placeholder")} />
            <ViewSwitch value={layout} options={VIEWS} onChange={setLayout} />
          </div>
          <FilterChips
            allLabel={t("browse.noFilter")}
            allCount={view.items.length}
            chips={[
              { key: "unread", label: t("reads.filter.unread"), count: unread },
              { key: "read", label: t("reads.filter.read"), count: view.items.length - unread },
            ]}
            value={seen}
            onChange={setSeen}
          />
          {sources.length > 1 && (
            <FilterChips label={t("reads.filter.source")} caption={t("reads.filter.source")} chips={sources.map((name) => ({ key: name, label: name }))} value={source} onChange={setSource} />
          )}
          <ResultsMeta
            shown={visible.length}
            total={view.items.length}
            filtering={query.trim() !== "" || seen !== null || source !== null}
            onClear={() => {
              setQuery("");
              setSeen(null);
              setSource(null);
            }}
          />
        </>
      )}
      {view.items.length === 0 ? (
        <p className="text-xs text-faint">{view.feeds.length === 0 ? t("reads.empty") : t("reads.emptyItems")}</p>
      ) : visible.length === 0 ? (
        <p className="text-xs text-faint">{t("browse.noResults")}</p>
      ) : layout === "table" ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <DataTable label={t("reads.tab")} columns={columns(mark, onError)} rows={visible} rowKey={(a) => a.id} />
        </div>
      ) : (
        <ul className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
          {visible.map((article, i) => (
            <ReadCard key={article.id} article={article} index={i} onMark={mark} onError={onError} />
          ))}
        </ul>
      )}
      {view.feeds.length === 0 && <AddFeed onAdded={setView} />}
      <p className="text-[10px] text-faint">{t("reads.source")}</p>
    </div>
  );
}

function FeedList({
  view,
  onChanged,
  onError,
}: {
  view: ReadsView;
  onChanged: (view: ReadsView) => void;
  onError: (message: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  // Removing asks twice: the first click arms the chip, the second one (on "remover o feed") removes it.
  const [armed, setArmed] = useState("");
  const [removing, setRemoving] = useState("");
  // The confirm button unmounts when the chip disarms: focus goes back to that feed's ✕ instead of <body>.
  const crosses = useRef(new Map<string, HTMLButtonElement>());
  const refocus = useRef("");
  useEffect(() => {
    if (armed || !refocus.current) return;
    crosses.current.get(refocus.current)?.focus();
    refocus.current = "";
  }, [armed]);

  function disarm(url: string) {
    refocus.current = url;
    setArmed("");
  }

  async function remove(url: string) {
    if (removing) return;
    setRemoving(url);
    try {
      onChanged(await api.readsRemove(url));
      setArmed("");
    } catch (e) {
      onError(errText(e));
      disarm(url);
    } finally {
      setRemoving("");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1 text-[10px]">
      <span className="text-faint">{t("reads.feeds")}</span>
      {view.feeds.map((feed) => {
        const label = feed.label || feed.url;
        return (
          <span
            key={feed.url}
            data-feed={feed.url}
            title={feed.error ?? feed.url}
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 ${feed.error ? "bg-danger/15 text-danger" : "bg-edge text-muted"}`}
          >
            {label}
            {armed === feed.url ? (
              <button
                type="button"
                autoFocus
                aria-disabled={removing === feed.url}
                aria-busy={removing === feed.url}
                aria-label={t("reads.removeTitle", { label })}
                onClick={() => void remove(feed.url)}
                onBlur={() => removing !== feed.url && setArmed("")}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.stopPropagation();
                    disarm(feed.url);
                  }
                }}
                className="rounded-full bg-danger/15 px-1.5 font-semibold text-danger hover:bg-danger/25 aria-disabled:opacity-60"
              >
                {t("reads.remove")}
              </button>
            ) : (
              <button
                type="button"
                ref={(node) => {
                  if (node) crosses.current.set(feed.url, node);
                  else crosses.current.delete(feed.url);
                }}
                aria-label={t("reads.removeTitle", { label })}
                onClick={() => setArmed(feed.url)}
                className="text-faint hover:text-danger"
              >
                ✕
              </button>
            )}
          </span>
        );
      })}
      <button
        type="button"
        aria-label={t("reads.add.title")}
        title={t("reads.add.title")}
        aria-expanded={adding}
        onClick={() => setAdding((on) => !on)}
        className={LINK}
      >
        +
      </button>
      {adding && (
        <AddFeed
          autoFocus
          onAdded={(next) => {
            onChanged(next);
            setAdding(false);
          }}
        />
      )}
    </div>
  );
}

/** Added one at a time and only after Rust confirms it parses. */
function AddFeed({ onAdded, autoFocus = false }: { onAdded: (view: ReadsView) => void; autoFocus?: boolean }) {
  const [feed, setFeed] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  async function save() {
    if (working) return;
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
          autoFocus={autoFocus}
          inputMode="url"
          value={feed}
          onChange={(e) => setFeed(e.target.value)}
          placeholder={t("reads.add.placeholder")}
          className="canto-field min-w-0 flex-1 px-2 py-1 text-xs"
        />
        <button type="submit" disabled={working || feed.trim() === ""} aria-busy={working} className={`${LINK} font-semibold text-accent-text`}>
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
