import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { api, errText, type DriveFile, type DriveFilter } from "../lib/api";
import { googleGate, shortWhen } from "../lib/google";
import { useRefreshEvent } from "../lib/useRefreshEvent";
import { t } from "../i18n";
import ErrorBanner from "./ErrorBanner";
import GoogleGate from "./GoogleGate";
import { SearchIcon } from "./Icons";
import Skeleton from "./Skeleton";

const FILTERS: DriveFilter[] = ["recent", "starred", "shared"];
/** Badge color per kind, from the skin's category colors so every skin keeps them apart. */
const KIND_COLOR: Record<DriveFile["kind"], string> = {
  doc: "var(--color-cat-meet)",
  sheet: "var(--color-cat-web)",
  slide: "var(--color-cat-docs)",
  pdf: "var(--color-cat-games)",
  other: "var(--color-cat-other)",
};
const SEARCH_PAUSE_MS = 350;

/** Recent, starred or shared Drive files by name, each one click from opening in the browser. */
export default function GDriveTab() {
  const [filter, setFilter] = useState<DriveFilter>("recent");
  const [search, setSearch] = useState("");
  const [files, setFiles] = useState<DriveFile[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (which: DriveFilter, query: string) => {
    setLoading(true);
    try {
      setFiles(await api.gdriveList(which, query));
      setError("");
    } catch (e) {
      setError(errText(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void load(filter, search), search ? SEARCH_PAUSE_MS : 0);
    return () => clearTimeout(timer);
  }, [load, filter, search]);
  useRefreshEvent("gdrive", () => void load(filter, search));

  const gate = googleGate(error);
  if (gate) return <GoogleGate kind={gate} onConnected={() => void load(filter, search)} />;

  const now = new Date();
  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto pr-0.5">
      <label className="canto-field flex items-center gap-2 rounded-lg border border-edge bg-ink px-2.5 text-xs">
        <span aria-hidden="true" className="text-faint [&>svg]:size-3.5"><SearchIcon /></span>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("gdrive.search")}
          aria-label={t("gdrive.search")}
          maxLength={100}
          className="min-w-0 flex-1 bg-transparent py-1.5 text-fg outline-none placeholder:text-faint"
        />
      </label>
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={filter === id}
            onClick={() => setFilter(id)}
            className="canto-hit rounded-full border border-edge px-2.5 py-0.5 text-[11px] text-muted aria-pressed:border-accent/50 aria-pressed:bg-accent/15 aria-pressed:text-accent-text"
          >
            {t(`gdrive.filter.${id}`)}
          </button>
        ))}
      </div>
      {error && <ErrorBanner message={error} busy={loading} onRetry={() => void load(filter, search)} />}
      {files === null ? (
        !error && <Skeleton label={t("google.fetching")} rows={5} />
      ) : files.length === 0 ? (
        <p className="wx-glass p-3 text-xs text-muted">{t("gdrive.empty")}</p>
      ) : (
        <ul key={`${filter}|${search}`} className="wx-glass shrink-0 divide-y divide-edge">
          {files.map((file, index) => {
            const when = shortWhen(new Date(file.modified), now);
            return (
              <li key={file.id} data-drive-file={file.id} className="wx-rise flex items-center gap-2.5 p-2.5" style={{ "--i": index + 1 } as CSSProperties}>
                <span
                  aria-hidden="true"
                  className="canto-pop grid size-8 shrink-0 place-items-center rounded-md text-[8px] font-bold tracking-wide"
                  style={{ color: KIND_COLOR[file.kind], background: `color-mix(in srgb, ${KIND_COLOR[file.kind]} 18%, transparent)` }}
                >
                  {t(`gdrive.kind.${file.kind}`)}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-xs text-fg">{file.name}</span>
                  <span className="truncate text-[11px] text-faint">
                    {file.editor ? t("gdrive.byOther", { name: file.editor, when }) : t("gdrive.byYou", { when })}
                  </span>
                </span>
                {file.starred && <span role="img" aria-label={t("gdrive.starred")} className="text-warn">★</span>}
                {file.link && (
                  <button
                    type="button"
                    onClick={() => void api.openLink(file.link).catch((e) => setError(errText(e)))}
                    className="canto-hit rounded-md bg-accent/15 px-2 py-0.5 text-[11px] text-accent-text hover:bg-accent/25"
                  >
                    {t("gdrive.open")}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
