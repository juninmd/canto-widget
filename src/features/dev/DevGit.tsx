import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api, errText } from "../../lib/api";
import { useToast } from "../../lib/toast";
import { useWindowVisible } from "../../lib/useWindowVisible";
import { t } from "../../i18n";
import ConfirmButton from "../../components/ConfirmButton";
import ErrorBanner from "../../components/ErrorBanner";
import { ChevronIcon, CrossIcon } from "../../components/Icons";
import type { GitView } from "./devTypes";
import { Chip, CopyGlyph, IconButton, Panel, Row, SearchField, StatLine, Sub, Switch, copyText } from "./DevBits";
import { byRoot, cleanScript, filterRepos, lastSegment, safeWorktrees, type RepoFilter } from "./gitView";

const FILTERS: RepoFilter[] = ["all", "dirty", "ahead", "behind"];
const POLL_MS = 15000;

/** The folders the user chose, the repositories inside them, and the worktrees whose work already reached the remote. */
export default function DevGit() {
  const [view, setView] = useState<GitView | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<RepoFilter>("all");
  const [folders, setFolders] = useState(false);
  const [review, setReview] = useState(false);
  const [path, setPath] = useState("");
  const [picked, setPicked] = useState<Set<string> | null>(null);
  const [deleteBranch, setDeleteBranch] = useState(true);
  const notify = useToast();
  const visible = useWindowVisible();
  const live = useRef(true);

  const apply = (v: GitView) => {
    setView(v);
    setError("");
  };
  const load = useCallback(() => api.devGitGet().then((v) => live.current && apply(v), (e) => live.current && setError(errText(e) || t("dev.error"))), []);

  useEffect(() => {
    live.current = true;
    if (!visible) return;
    void load();
    const id = setInterval(() => void load(), POLL_MS);
    return () => {
      live.current = false;
      clearInterval(id);
    };
  }, [visible, load]);

  async function change(c: { add?: string; remove?: string; depth?: number }, done?: string) {
    setBusy(true);
    try {
      apply(await api.devGitRoot(c));
      if (done) notify({ message: done });
    } catch (e) {
      notify({ message: errText(e), type: "erro" });
    } finally {
      setBusy(false);
    }
  }

  async function browse() {
    const chosen = await api.devPickFolder().catch(() => null);
    if (chosen) await change({ add: chosen }, t("dev.git.added"));
  }

  const repos = view?.repos ?? [];
  const roots = view?.roots ?? [];
  const safe = safeWorktrees(view?.worktrees ?? []);
  const chosen = picked ?? new Set(safe.map((w) => w.path));
  const selection = safe.filter((w) => chosen.has(w.path));
  const groups = useMemo(() => byRoot(filterRepos(repos, query, filter), roots), [repos, query, filter, roots]);

  async function clean() {
    setBusy(true);
    let removed = 0;
    let branches = 0;
    try {
      for (const w of selection) {
        branches += (await api.devGitWorktreeRemove(w.repo_path, w.path, deleteBranch)) ? 1 : 0;
        removed++;
      }
      notify({ message: t("dev.git.wt.done", { n: removed, b: branches }) });
    } catch (e) {
      notify({ message: errText(e), type: "erro" });
    } finally {
      setPicked(null);
      setBusy(false);
      void load();
    }
  }

  async function pull(name: string, repo: string, dirty: number) {
    if (dirty > 0) return notify({ message: t("dev.git.pullBlocked", { name }) });
    try {
      notify({ message: t("dev.git.pulled", { name, msg: await api.devGitPull(repo) }) });
      void load();
    } catch (e) {
      notify({ message: errText(e), type: "erro" });
    }
  }

  return (
    <>
      {error && <ErrorBanner message={error} onRetry={() => void load()} />}
      {view && roots.length > 0 && <StatLine items={[{ text: t("dev.git.stat.repos", { n: repos.length }) }, { text: t("dev.git.stat.dirty", { n: repos.filter((r) => r.dirty).length }), tone: "warn" }, { text: t("dev.git.stat.ahead", { n: repos.filter((r) => r.ahead).length }), tone: "info" }]} />}

      <Panel>
        <div className="flex items-center gap-2">
          <button type="button" aria-expanded={review} onClick={() => setReview(!review)} className="canto-hit flex min-h-[26px] min-w-0 flex-1 items-center gap-1.5 text-left text-[12.5px] font-semibold text-fg">
            <span className={`transition-transform ${review ? "rotate-90" : ""}`}><ChevronIcon dir="right" /></span>
            <span className="truncate">{safe.length > 0 ? t("dev.git.wt.title", { n: safe.length }) : t("dev.git.wt.none")}</span>
          </button>
          <button type="button" disabled={busy || roots.length === 0} onClick={() => void api.devGitFetch().then((v) => (apply(v), notify({ message: t("dev.git.wt.fetched") })), (e) => notify({ message: errText(e), type: "erro" }))} className="canto-hit min-h-[26px] rounded-md bg-hover px-2 text-[11.5px] font-medium text-muted hover:text-fg disabled:opacity-40">
            {t("dev.git.wt.fetch")}
          </button>
        </div>
        {review && (
          <>
            <p className="text-[11.5px] text-muted">{t("dev.git.wt.intro")}</p>
            <ul className="flex flex-col">
              {(view?.worktrees ?? []).map((w) => (
                <Row key={w.path} className={w.safe ? "" : "opacity-60"}>
                  <input type="checkbox" aria-label={t("dev.git.wt.select", { path: w.path })} disabled={!w.safe} checked={w.safe && chosen.has(w.path)} onChange={(e) => setPicked(new Set(e.target.checked ? [...chosen, w.path] : [...chosen].filter((p) => p !== w.path)))} className="size-4 accent-[var(--color-accent)]" />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate text-[12.5px] font-semibold text-fg">
                      {w.repo}
                      <span className="truncate font-mono text-[10.5px] font-normal text-muted">{w.branch}</span>
                    </p>
                    <Sub>{w.path}</Sub>
                    <p className={`text-[11px] ${w.safe ? "text-ok" : "text-warn"}`}>{t(`dev.git.wt.reason.${w.reason}`, { n: w.count })}</p>
                  </div>
                </Row>
              ))}
            </ul>
            <label className="flex items-center gap-2 text-[12px] text-muted">
              <Switch on={deleteBranch} onChange={setDeleteBranch} label={t("dev.git.wt.deleteBranch")} />
              {t("dev.git.wt.deleteBranch")}
            </label>
            {selection.length > 0 && (
              <details className="text-[11px] text-muted">
                <summary className="cursor-pointer">{t("dev.git.wt.script")}</summary>
                <pre className="mt-1 max-h-28 overflow-auto rounded-lg bg-ink/80 p-2 font-mono text-[10.5px] whitespace-pre-wrap break-all">{cleanScript(selection, deleteBranch)}</pre>
                <button type="button" onClick={() => copyText(cleanScript(selection, deleteBranch))} className="canto-hit mt-1 inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-hover"><CopyGlyph />{t("dev.copy")}</button>
              </details>
            )}
            <ConfirmButton ask={t("dev.git.wt.confirm", { n: selection.length })} yes={t("dev.git.wt.confirm", { n: selection.length })} onConfirm={() => void clean()} disabled={busy || selection.length === 0} className="canto-hit min-h-[28px] self-start rounded-md bg-accent px-3 text-[12px] font-semibold text-on-accent disabled:opacity-40">
              {t("dev.git.wt.remove", { n: selection.length })}
            </ConfirmButton>
          </>
        )}
      </Panel>

      <Panel>
        <div className="flex items-center gap-2">
          <button type="button" aria-expanded={folders} onClick={() => setFolders(!folders)} className="canto-hit flex min-h-[26px] min-w-0 flex-1 items-center gap-1.5 text-left text-[12.5px] font-semibold text-fg">
            <span className={`transition-transform ${folders || roots.length === 0 ? "rotate-90" : ""}`}><ChevronIcon dir="right" /></span>
            {t("dev.git.folders")} · {roots.length}
          </button>
          {(folders || roots.length === 0) && (
            <div className="flex items-center gap-0.5 text-[11px] text-muted">
              {t("dev.git.depth")}
              {[1, 2, 3].map((d) => (
                <Chip key={d} on={view?.depth === d} onClick={() => void change({ depth: d })}>
                  {d}
                </Chip>
              ))}
            </div>
          )}
        </div>
        {!folders && roots.length > 0 && <div className="flex flex-wrap gap-1">{roots.map((r) => <span key={r} title={r} className="rounded bg-hover px-1.5 font-mono text-[10.5px] text-muted">{lastSegment(r)}</span>)}</div>}
        {(folders || roots.length === 0) && (
          <>
            {roots.length === 0 && view && <p className="text-[11.5px] text-muted">{t("dev.git.noFolders")}</p>}
            <ul className="flex flex-col">
              {roots.map((r) => (
                <Row key={r}>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-[11.5px] text-fg" title={r}>{r}</p>
                    <Sub>{t("dev.git.repoCount", { n: repos.filter((x) => x.root === r).length })}</Sub>
                  </div>
                  <IconButton label={t("dev.git.removeFolder", { path: r })} danger onClick={() => void change({ remove: r }, t("dev.git.removed", { path: r }))}>
                    <CrossIcon />
                  </IconButton>
                </Row>
              ))}
            </ul>
            <form className="flex gap-1.5" onSubmit={(e) => (e.preventDefault(), path.trim() && void change({ add: path.trim() }, t("dev.git.added")).then(() => setPath("")))}>
              <input value={path} onChange={(e) => setPath(e.target.value)} placeholder={t("dev.git.pathPlaceholder")} aria-label={t("dev.git.pathPlaceholder")} className="canto-field h-8 min-w-0 flex-1 px-2.5 font-mono text-[11.5px]" />
              <button type="submit" disabled={busy || !path.trim()} className="canto-hit min-h-[28px] rounded-md bg-hover px-2.5 text-[11.5px] font-medium text-fg disabled:opacity-40">{t("dev.git.add")}</button>
              <button type="button" disabled={busy} onClick={() => void browse()} className="canto-hit min-h-[28px] rounded-md bg-hover px-2.5 text-[11.5px] font-medium text-fg disabled:opacity-40">{t("dev.git.browse")}</button>
            </form>
          </>
        )}
      </Panel>

      {roots.length > 0 && (
        <>
          <SearchField value={query} onChange={setQuery} placeholder={t("dev.git.search")} />
          <div className="flex shrink-0 gap-1">
            {FILTERS.map((f) => (
              <Chip key={f} on={filter === f} onClick={() => setFilter(f)}>
                {t(`dev.git.filter.${f}`)}
              </Chip>
            ))}
          </div>
          {groups.map(([root, list]) => (
            <section key={root} className="flex shrink-0 flex-col">
              <h3 className="truncate text-[10.5px] font-semibold uppercase tracking-wider text-faint" title={root}>{root}</h3>
              <ul className="flex flex-col">
                {list.map((r) => (
                  <Row key={r.path}>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-fg">{r.name}</p>
                      <Sub>
                        <span className="font-mono">{r.branch}</span> · {r.dirty ? <span className="text-warn">{t("dev.git.dirty", { n: r.dirty })}</span> : t("dev.git.clean")}
                        {r.ahead > 0 && <span className="text-accent-text"> · ↑{r.ahead}</span>}
                        {r.behind > 0 && <span className="text-danger"> · ↓{r.behind}</span>}
                      </Sub>
                    </div>
                    <IconButton label={t("dev.git.copyPath", { name: r.name })} onClick={() => copyText(r.path)}><CopyGlyph /></IconButton>
                    <IconButton label={t("dev.git.pull", { name: r.name })} onClick={() => void pull(r.name, r.path, r.dirty)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v12M7 11l5 5 5-5M5 20h14" /></svg>
                    </IconButton>
                  </Row>
                ))}
              </ul>
            </section>
          ))}
          {view && repos.length === 0 && <p className="px-2 py-6 text-center text-[12px] text-faint">{t("dev.git.empty")}</p>}
          {repos.length > 0 && groups.length === 0 && <p className="px-2 py-6 text-center text-[12px] text-faint">{t("dev.git.noMatch")}</p>}
        </>
      )}
    </>
  );
}
