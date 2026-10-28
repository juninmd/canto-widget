import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { api, errText, type DriveFile, type DriveFilter, type DriveKind, type DriveQuota } from "../lib/api";
import { NEW_FILE, formatBytes, groupByDay, quotaShare } from "../lib/driveExtras";
import { googleGate } from "../lib/google";
import { useDrivePages } from "../lib/useDrivePages";
import { useRefreshEvent } from "../lib/useRefreshEvent";
import { t } from "../i18n";
import ErrorBanner from "./ErrorBanner";
import GDriveRow, { KIND_COLOR } from "./GDriveRow";
import GDriveMore from "./GDriveMore";
import GoogleGate from "./GoogleGate";
import { SearchIcon } from "./Icons";
import Skeleton from "./Skeleton";

type Props = { onNotice: (message: string) => void };

const FILTERS: DriveFilter[] = ["all", "recent", "starred", "shared", "mine"];
const KINDS: DriveKind[] = ["", "doc", "sheet", "slide", "pdf"];
const CREATE = ["doc", "sheet", "slide"] as const;
const DRIVE = "https://drive.google.com/drive/my-drive";
const CHIP =
  "canto-hit rounded-full border border-edge px-2.5 py-0.5 text-[11px] text-muted aria-pressed:border-accent/50 aria-pressed:bg-accent/15 aria-pressed:text-accent-text";

type Crumb = { id: string; name: string };

/** All of Drive, a page at a time: My Drive's folders to walk into, or recent, starred, shared or owned files by day,
 * of a kind, plus the storage in use and blank documents one click away. */
export default function GDriveTab({ onNotice }: Props) {
  const [filter, setFilter] = useState<DriveFilter>("all");
  const [kind, setKind] = useState<DriveKind>("");
  const [search, setSearch] = useState("");
  const [path, setPath] = useState<Crumb[]>([]);
  const [quota, setQuota] = useState<DriveQuota | null>(null);
  const [failure, setFailure] = useState("");
  const folder = path.at(-1)?.id ?? "";
  const { files, stale, next, error: listError, loading, reload, more } = useDrivePages(filter, kind, search, folder);
  const error = failure || listError;
  const browsing = folder !== "" || filter === "all";

  useEffect(() => {
    api.gdriveQuota().then(setQuota, () => {});
  }, []);
  useRefreshEvent("gdrive", reload);
  const groups = useMemo(() => (browsing ? [] : groupByDay(files ?? [], new Date())), [files, browsing]);

  const gate = googleGate(error);
  if (gate) return <GoogleGate kind={gate} onConnected={reload} />;

  const open = (url: string) => void api.openLink(url).catch((e) => setFailure(errText(e)));
  const choose = (id: DriveFilter) => {
    setPath([]);
    setFilter(id);
  };
  const enter = (file: DriveFile) => setPath((at) => [...at, { id: file.id, name: file.name }]);
  const copy = async (file: DriveFile) => {
    try {
      await navigator.clipboard.writeText(file.link);
      onNotice(t("gdrive.linkCopied"));
    } catch (e) {
      setFailure(errText(e));
    }
  };
  const share = quota ? quotaShare(quota.used, quota.limit) : 0;
  const now = new Date();
  let index = 0;
  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto pr-0.5">
      <section className="wx-glass wx-rise flex flex-col gap-2 bg-gradient-to-br from-accent/15 via-accent/5 to-transparent p-3">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="canto-float grid size-10 shrink-0 place-items-center rounded-xl bg-accent/15 text-xl">📂</span>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] text-muted">{t("gdrive.storage")}</span>
            <p data-drive-quota className="truncate text-sm font-semibold tabular-nums text-fg">
              {quota
                ? quota.limit > 0
                  ? t("gdrive.quota", { used: formatBytes(quota.used), limit: formatBytes(quota.limit) })
                  : t("gdrive.quotaUnlimited", { used: formatBytes(quota.used) })
                : "—"}
            </p>
          </div>
          <button type="button" onClick={() => open(DRIVE)} aria-label={t("gdrive.openDrive")} className="canto-hit rounded-md bg-edge/60 px-2 py-0.5 text-[11px] hover:bg-hover">
            ↗
          </button>
          <button
            type="button"
            onClick={() => {
              setFailure("");
              reload();
            }}
            disabled={loading}
            aria-label={t("google.refresh")}
            className="canto-hit flex size-6 items-center justify-center rounded-full text-muted hover:bg-hover hover:text-fg disabled:opacity-60"
          >
            <span aria-hidden="true" className={`inline-block text-sm leading-none ${loading ? "wx-spin" : ""}`}>↻</span>
          </button>
        </div>
        {quota && quota.limit > 0 && (
          <div role="meter" aria-label={t("gdrive.storage")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(share * 100)} className="h-1.5 overflow-hidden rounded-full bg-edge/60">
            <div className={`canto-grow-x h-full rounded-full ${share > 0.9 ? "bg-danger" : share > 0.75 ? "bg-warn" : "bg-accent"}`} style={{ width: `${Math.max(2, share * 100)}%` }} />
          </div>
        )}
        <div className="flex flex-wrap gap-1">
          {CREATE.map((id, i) => (
            <button
              key={id}
              type="button"
              aria-label={t("gdrive.new", { kind: t(`gdrive.new.${id}`) })}
              onClick={() => open(NEW_FILE[id])}
              className="canto-hit canto-stack rounded-md border border-edge bg-ink/60 px-2 py-0.5 text-[11px] text-fg hover:border-accent/50"
              style={{ "--i": i, color: KIND_COLOR[id] } as CSSProperties}
            >
              + {t(`gdrive.new.${id}`)}
            </button>
          ))}
        </div>
      </section>
      <label className="canto-field flex items-center gap-2 rounded-lg border border-edge bg-ink px-2.5 text-xs">
        <span aria-hidden="true" className="text-faint [&>svg]:size-3.5"><SearchIcon /></span>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("gdrive.search")}
          aria-label={t("gdrive.search")}
          data-shortcut="search"
          maxLength={100}
          className="min-w-0 flex-1 bg-transparent py-1.5 text-fg outline-none placeholder:text-faint"
        />
      </label>
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((id) => (
          <button key={id} type="button" aria-pressed={filter === id && !folder} onClick={() => choose(id)} className={CHIP}>
            {t(`gdrive.filter.${id}`)}
          </button>
        ))}
      </div>
      <div role="group" aria-label={t("gdrive.types")} className="flex flex-wrap gap-1">
        {KINDS.map((id) => (
          <button
            key={id || "all"}
            type="button"
            aria-pressed={kind === id}
            onClick={() => setKind(id)}
            className="canto-hit flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-muted hover:bg-hover aria-pressed:bg-edge/70 aria-pressed:text-fg"
          >
            {id && <span aria-hidden="true" className="size-1.5 rounded-full" style={{ background: KIND_COLOR[id] }} />}
            {t(`gdrive.type.${id || "all"}`)}
          </button>
        ))}
      </div>
      {browsing && (
        <nav aria-label={t("gdrive.path")} className="flex min-w-0 flex-wrap items-center gap-0.5 text-[11px] text-muted">
          {[{ id: "", name: t("gdrive.myDrive") }, ...path].map((crumb, i, all) => (
            <span key={crumb.id || "root"} className="flex min-w-0 items-center gap-0.5">
              {i > 0 && <span aria-hidden="true" className="text-faint">›</span>}
              <button
                type="button"
                aria-current={i === all.length - 1 ? "location" : undefined}
                onClick={() => (i === 0 && filter !== "all" ? choose("all") : setPath(path.slice(0, i)))}
                title={crumb.name}
                className="canto-hit max-w-40 truncate rounded px-1 hover:bg-hover hover:text-fg aria-[current]:font-semibold aria-[current]:text-fg"
              >
                {crumb.name}
              </button>
            </span>
          ))}
        </nav>
      )}
      {error && (
        <ErrorBanner
          message={error}
          busy={loading}
          onRetry={() => {
            setFailure("");
            reload();
          }}
        />
      )}
      {/* A row of the previous folder clicked while the next one loads would push onto the wrong path. */}
      <div aria-busy={stale} inert={stale} className={`flex flex-col gap-2 transition-opacity ${stale ? "opacity-60" : ""}`}>
      {files === null ? (
        !error && <Skeleton label={t("google.fetching")} rows={5} />
      ) : files.length === 0 ? (
        <p className="wx-glass wx-rise flex items-center gap-2 p-3 text-xs text-muted">
          <span aria-hidden="true" className="canto-float inline-block text-base">🗂️</span>
          {t("gdrive.empty")}
        </p>
      ) : browsing ? (
        <section key={`${folder}|${kind}|${search}`} aria-label={path.at(-1)?.name ?? t("gdrive.myDrive")} className="wx-glass shrink-0">
          <ul className="divide-y divide-edge">
            {files.map((file) => (
              <GDriveRow key={file.id} file={file} index={index++} now={now} onOpen={open} onCopy={(f) => void copy(f)} onEnter={enter} />
            ))}
          </ul>
        </section>
      ) : (
        groups.map((group) => (
          <section key={`${filter}|${kind}|${search}|${group.day}`} aria-label={t(`gdrive.day.${group.day}`)} className="wx-glass shrink-0">
            <h3 className="px-3 pb-0.5 pt-2 text-[10px] font-semibold uppercase tracking-widest text-accent-text">{t(`gdrive.day.${group.day}`)}</h3>
            <ul className="divide-y divide-edge">
              {group.files.map((file) => (
                <GDriveRow key={file.id} file={file} index={index++} now={now} onOpen={open} onCopy={(f) => void copy(f)} onEnter={enter} />
              ))}
            </ul>
          </section>
        ))
      )}
      </div>
      {next && files && <GDriveMore key={files.length} loading={loading} onMore={more} />}
    </div>
  );
}
