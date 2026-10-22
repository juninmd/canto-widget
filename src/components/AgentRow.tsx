import type { CSSProperties } from "react";
import { api, type HarnessView } from "../lib/api";
import { releaseDate, releaseSummary } from "../lib/agents";
import { useCopied } from "../lib/useCopied";
import { timeAgo } from "../lib/time";
import { t } from "../i18n";
import ProviderIcon, { providerColor } from "./ProviderIcon";

// A release this recent still deserves a glance: its tag glows until it ages out.
const FRESH_MS = 3 * 24 * 3600_000;

const LINK = "canto-hit min-h-[24px] shrink-0 rounded-md px-1.5 hover:bg-hover hover:text-fg active:bg-active";

/** One agent CLI: where it comes from, whether it is installed here, what it shipped last and how to install it. */
export default function AgentRow({ view, index = 0, onError }: { view: HarnessView; index?: number; onError: (m: string) => void }) {
  const [copied, flash] = useCopied();
  const release = view.release;
  const date = release ? releaseDate(release.published_at) : "";
  const notes = release ? releaseSummary(release.notes) : "";
  const fresh = release ? Date.now() - new Date(release.published_at).getTime() < FRESH_MS : false;

  async function copy() {
    try {
      await navigator.clipboard.writeText(view.install_command);
      flash(view.id);
    } catch {
      onError(t("agents.copyFailed"));
    }
  }

  return (
    <li
      data-agent={view.id}
      style={{ "--i": Math.min(index, 8) } as CSSProperties}
      className="wx-rise relative shrink-0 overflow-hidden rounded-xl border border-edge/60 bg-panel/40 p-2 pl-3 transition-colors hover:bg-panel/70"
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ background: view.installed ? providerColor(view.id) : "transparent" }}
      />
      <div className="flex items-start gap-2.5">
        <ProviderIcon id={view.id} name={view.name} size={34} dim={!view.installed} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-xs font-semibold text-fg">{view.name}</span>
            <span
              className={`ml-auto flex shrink-0 items-center gap-1 rounded-full px-1.5 text-[9px] uppercase ${
                view.installed ? "bg-accent/15 text-accent-text" : "bg-edge text-faint"
              }`}
            >
              <span
                aria-hidden="true"
                className={`relative size-1.5 rounded-full ${view.installed ? "canto-ping bg-accent shadow-[0_0_6px_var(--color-accent)]" : "bg-faint/60"}`}
              />
              {t(view.installed ? "agents.installed" : "agents.notInstalled")}
            </span>
          </div>
          <div className="truncate text-[10px] text-faint">{view.repo}</div>
          <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[10px]">
            {release ? (
              <>
                <span
                  title={t("agents.release", { tag: release.tag })}
                  data-fresh={fresh ? "" : undefined}
                  className={`${fresh ? "canto-glow" : ""} shrink-0 rounded-md bg-edge/70 px-1.5 py-px font-mono text-[10px] tabular-nums text-fg`}
                >
                  {release.tag}
                </span>
                <span className="min-w-0 truncate text-faint" title={date}>
                  {t("agents.released", { ago: timeAgo(release.published_at) })}
                </span>
              </>
            ) : (
              <span className="min-w-0 truncate text-muted">{t("agents.releaseNone")}</span>
            )}
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
          {view.installed && view.path && (
            <div className="truncate text-[10px] text-faint" title={view.path}>
              {t("agents.path", { path: view.path })}
            </div>
          )}
          {view.error && (
            <p role="alert" className="mt-0.5 text-[10px] text-danger">
              {view.error}
            </p>
          )}
          {notes && (
            <p className="mt-1.5 rounded-lg bg-edge/40 px-2 py-1.5 text-[10px] leading-snug whitespace-pre-wrap text-muted">
              {notes}
            </p>
          )}
          {!view.installed && (
            <div className="mt-1.5">
              <div className="text-[10px] text-faint">{t("agents.install", { tool: view.install_tool })}</div>
              <div className="flex items-center gap-1.5">
                <code className="min-w-0 flex-1 truncate rounded-lg bg-edge/60 px-1.5 py-1 text-[10px] text-fg">
                  {view.install_command}
                </code>
                <button type="button" onClick={() => void copy()} className={`${LINK} text-[10px] text-muted`}>
                  {copied === view.id ? <span className="canto-copied inline-block">{t("agents.copied")}</span> : t("agents.copy")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
