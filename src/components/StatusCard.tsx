import { useId } from "react";
import { api, type StatusResult } from "../lib/api";
import { canAlert, lastIncident, level, type Level } from "../lib/status";
import { timeAgo } from "../lib/time";
import { t } from "../i18n";
import { BellIcon } from "./Icons";

/** Color by state; the word next to the dot carries the same meaning for who can't tell colors apart. */
const TONE: Record<Level, { dot: string; text: string; card: string }> = {
  down: { dot: "bg-danger motion-safe:animate-pulse", text: "text-danger", card: "border-danger/60 bg-danger/10" },
  degraded: { dot: "bg-warn motion-safe:animate-pulse", text: "text-warn", card: "border-warn/60 bg-warn/10" },
  recent: { dot: "bg-warn", text: "text-warn", card: "border-warn/50 bg-warn/5" },
  maintenance: { dot: "bg-muted", text: "text-muted", card: "border-edge bg-ink/60" },
  ok: { dot: "bg-ok", text: "text-ok", card: "border-edge bg-ink/60" },
  unknown: { dot: "bg-faint", text: "text-faint", card: "border-edge bg-ink/40" },
};

type Props = {
  result: StatusResult;
  open: boolean;
  watched: boolean;
  onToggle: () => void;
  onWatch: () => void;
};

export default function StatusCard({ result, open, watched, onToggle, onWatch }: Props) {
  const bodyId = useId();
  const state = level(result, Date.now());
  const tone = TONE[state];
  const last = lastIncident(result);
  const troubled = state === "down" || state === "degraded" || state === "recent";
  const alertable = canAlert(result);
  const bellLabel = !alertable
    ? t("status.alertUnavailable", { name: result.label })
    : watched
      ? t("status.alertOff", { name: result.label })
      : t("status.alertOn", { name: result.label });

  return (
    <section
      data-troubled={troubled || undefined}
      data-level={state}
      className={`relative rounded-xl border transition-colors ${tone.card} ${open ? "col-span-2" : ""}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={bodyId}
        className="flex w-full flex-col gap-0.5 rounded-xl p-2.5 pr-8 text-left hover:bg-edge/40"
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${tone.dot}`} />
          <span className="truncate text-xs font-semibold text-fg">{result.label}</span>
        </span>
        <span className={`truncate text-[11px] font-medium ${tone.text}`}>{t(`status.level.${state}`)}</span>
        <span className="truncate text-[10px] text-faint">
          {result.error ? t("status.unavailable") : last > 0 ? timeAgo(last) : t("status.noIncidents")}
        </span>
        {result.live && state !== "ok" && (
          <span className={`truncate text-[10px] ${tone.text}`} title={result.live.description}>
            {result.live.description}
          </span>
        )}
      </button>
      <button
        type="button"
        onClick={onWatch}
        disabled={!alertable}
        aria-pressed={alertable ? watched : undefined}
        aria-label={bellLabel}
        title={bellLabel}
        className={`absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-md hover:bg-edge disabled:opacity-30 disabled:hover:bg-transparent ${
          watched ? "text-accent" : "text-faint hover:text-fg"
        }`}
      >
        <BellIcon on={watched} />
      </button>
      {open && (
        <div id={bodyId} className="border-t border-edge/60 px-2.5 pt-1.5 pb-2">
          {result.error ? (
            <p className="text-[11px] text-faint">{t("status.unavailableWithError", { error: result.error })}</p>
          ) : result.items.length === 0 ? (
            <p className="text-[11px] text-faint">{t("status.noRecentIncidents")}</p>
          ) : (
            <ul className="space-y-0.5">
              {result.items.map((it) => (
                <li key={it.link || it.title}>
                  <button
                    type="button"
                    onClick={() => void api.openLink(it.link)}
                    disabled={!it.link}
                    title={it.link}
                    className="w-full truncate rounded px-1 py-0.5 text-left text-[11px] text-muted hover:bg-edge hover:text-fg disabled:hover:bg-transparent"
                  >
                    {it.published_at > 0 && <span className="text-faint">{timeAgo(it.published_at)} · </span>}
                    {it.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
