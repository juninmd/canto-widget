import { api, type HarnessView } from "../lib/api";
import { releaseDate, releaseSummary } from "../lib/agents";
import { useCopied } from "../lib/useCopied";
import { t } from "../i18n";

const LINK = "canto-hit min-h-[24px] shrink-0 rounded-md px-1.5 hover:bg-hover hover:text-fg active:bg-active";

/** One agent CLI: installed or not, the last release and, when it is missing, the command that installs it. */
export default function AgentRow({ view, onError }: { view: HarnessView; onError: (m: string) => void }) {
  const [copied, flash] = useCopied();
  const release = view.release;
  const date = release ? releaseDate(release.published_at) : "";
  const notes = release ? releaseSummary(release.notes) : "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(view.install_command);
      flash(view.id);
    } catch {
      onError(t("agents.copyFailed"));
    }
  }

  return (
    <li data-agent={view.id} className="rounded-lg border border-edge/60 px-2 py-1.5">
      <div className="flex items-center gap-2">
        <span className="truncate text-xs font-semibold text-fg">{view.name}</span>
        <span
          className={`ml-auto shrink-0 rounded-full px-1.5 text-[9px] uppercase ${
            view.installed ? "bg-accent/15 text-accent-text" : "bg-edge text-faint"
          }`}
        >
          {t(view.installed ? "agents.installed" : "agents.notInstalled")}
        </span>
      </div>
      {view.installed && view.path && (
        <div className="truncate text-[10px] text-faint" title={view.path}>
          {t("agents.path", { path: view.path })}
        </div>
      )}
      <div className="flex min-w-0 items-center gap-1.5 text-[10px]">
        <span className="min-w-0 truncate tabular-nums text-muted">
          {release ? t("agents.release", { tag: release.tag }) : t("agents.releaseNone")}
          {date && ` · ${date}`}
        </span>
        <button
          type="button"
          aria-label={t("agents.open")}
          title={t("agents.open")}
          onClick={() => void api.openLink(release?.url ?? view.site).catch((e) => onError(String(e)))}
          className={`${LINK} ml-auto text-faint`}
        >
          {t("agents.open")}
        </button>
      </div>
      {view.error && (
        <p role="alert" className="mt-0.5 text-[10px] text-danger">
          {view.error}
        </p>
      )}
      {notes && <p className="mt-1 whitespace-pre-wrap text-[10px] leading-snug text-muted">{notes}</p>}
      {!view.installed && (
        <div className="mt-1">
          <div className="text-[10px] text-faint">{t("agents.install", { tool: view.install_tool })}</div>
          <div className="flex items-center gap-1.5">
            <code className="min-w-0 flex-1 truncate rounded bg-edge/60 px-1.5 py-0.5 text-[10px] text-fg">
              {view.install_command}
            </code>
            <button type="button" onClick={() => void copy()} className={LINK}>
              {copied === view.id ? t("agents.copied") : t("agents.copy")}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
