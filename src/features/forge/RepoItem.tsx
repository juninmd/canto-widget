import { api, type RepoInfo } from "../../lib/api";
import type { RepoView } from "./repos";
import { timeAgo } from "../../lib/time";
import { t } from "../../i18n";

const TAG = "shrink-0 rounded-full bg-edge px-1.5 text-[10px] text-muted";

function Tags({ repo }: { repo: RepoInfo }) {
  return (
    <>
      {repo.private && <span className={TAG}>{t("forge.repos.private")}</span>}
      {repo.fork && <span className={TAG}>{t("forge.repos.fork")}</span>}
      {repo.archived && <span className={TAG}>{t("forge.repos.archived")}</span>}
    </>
  );
}

function Numbers({ repo }: { repo: RepoInfo }) {
  return (
    <>
      {repo.language && <span className="truncate">{repo.language}</span>}
      <span aria-label={t("forge.repos.stars", { n: repo.stars })} title={t("forge.repos.stars", { n: repo.stars })}>
        ★ {repo.stars}
      </span>
      {repo.forks > 0 && (
        <span aria-label={t("forge.repos.forks", { n: repo.forks })} title={t("forge.repos.forks", { n: repo.forks })}>
          ⑂ {repo.forks}
        </span>
      )}
    </>
  );
}

const BOX = "w-full rounded-xl border border-edge bg-ink/60 text-left transition-colors hover:border-line hover:bg-ink";

/** One repository in the layout the user picked; a click opens it in the browser. */
export default function RepoItem({ repo, view }: { repo: RepoInfo; view: RepoView }) {
  const open = () => void api.openLink(repo.url);
  const label = t("forge.repos.open", { name: repo.full_name });
  const when = repo.updated_at && timeAgo(repo.updated_at);
  if (view === "grid") {
    return (
      <li>
        <button type="button" onClick={open} aria-label={label} title={repo.description || repo.full_name} className={`${BOX} flex h-full min-h-[64px] flex-col justify-between gap-1 p-2`}>
          <span className="line-clamp-2 break-words text-xs font-semibold text-fg">{repo.name}</span>
          <span className="flex flex-wrap items-center gap-x-1.5 text-[10px] text-muted">
            <span>★ {repo.stars}</span>
            {(repo.private || repo.archived) && <span className="text-faint">{repo.archived ? t("forge.repos.archived") : t("forge.repos.private")}</span>}
          </span>
        </button>
      </li>
    );
  }
  if (view === "cards") {
    return (
      <li>
        <button type="button" onClick={open} aria-label={label} title={repo.url} className={`${BOX} flex h-full flex-col gap-1.5 p-2.5`}>
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-fg">{repo.name}</span>
            <Tags repo={repo} />
          </span>
          <span className={`line-clamp-2 min-h-[2rem] text-xs ${repo.description ? "text-muted" : "text-faint"}`}>{repo.description || t("forge.repos.noDescription")}</span>
          <span className="mt-auto flex flex-wrap items-center gap-x-2 text-[11px] text-muted">
            <Numbers repo={repo} />
            <span className="ml-auto text-faint">{when}</span>
          </span>
        </button>
      </li>
    );
  }
  return (
    <li>
      <button type="button" onClick={open} aria-label={label} title={repo.description || repo.url} className={`${BOX} flex items-center gap-2 px-2.5 py-1.5`}>
        <span className="min-w-0 flex-1 truncate text-sm text-fg">{repo.name}</span>
        <Tags repo={repo} />
        <span className="flex shrink-0 items-center gap-x-2 text-[11px] text-muted">
          <Numbers repo={repo} />
        </span>
        <span className="w-10 shrink-0 text-right text-[11px] text-faint">{when}</span>
      </button>
    </li>
  );
}
