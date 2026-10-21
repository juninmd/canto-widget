import { useId } from "react";
import { api, type StatusResult } from "../lib/api";
import { canAlert, lastIncident, level, type Level } from "../lib/status";
import { timeAgo } from "../lib/time";
import { t } from "../i18n";
import { BellIcon, ChevronIcon } from "./Icons";
import StatePill, { type StateTone } from "./StatePill";

/** Color by state; the pill's word says the same for who can't tell colors apart. */
const TONE: Record<Level, { tone: StateTone; pulse: boolean; text: string; card: string }> = {
  down: { tone: "bad", pulse: true, text: "text-danger", card: "border-danger/60 bg-danger/10" },
  degraded: { tone: "warn", pulse: true, text: "text-warn", card: "border-warn/60 bg-warn/10" },
  recent: { tone: "warn", pulse: false, text: "text-warn", card: "border-warn/50 bg-warn/5" },
  maintenance: { tone: "violet", pulse: false, text: "text-muted", card: "border-edge bg-ink/60" },
  ok: { tone: "ok", pulse: false, text: "text-ok", card: "border-edge bg-ink/60" },
  unknown: { tone: "neutral", pulse: false, text: "text-faint", card: "border-edge bg-ink/40" },
};

type Props = {
  result: StatusResult;
  open: boolean;
  watched: boolean;
  onToggle: () => void;
  onWatch: () => void;
};

/** One service: the row expands to its recent incidents; the bell is a separate button so the two never share a click. */
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
    <section data-troubled={troubled || undefined} data-level={state} className={`rounded-xl border transition-colors ${tone.card}`}>
      <div className="flex items-start">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={bodyId}
          className="canto-hit flex min-w-0 flex-1 flex-col gap-0.5 rounded-xl p-2.5 text-left hover:bg-edge/40"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate text-xs font-semibold text-fg">{result.label}</span>
            <StatePill tone={tone.tone} pulse={tone.pulse}>
              {t(`status.level.${state}`)}
            </StatePill>
            <span aria-hidden="true" className={`ml-auto shrink-0 text-faint transition-transform motion-reduce:transition-none ${open ? "rotate-90" : ""}`}>
              <ChevronIcon dir="right" />
            </span>
          </span>
          <span className="truncate text-[11px] text-faint">{result.error ? t("status.unavailable") : last > 0 ? timeAgo(last) : t("status.noIncidents")}</span>
          {result.live && state !== "ok" && (
            <span className={`truncate text-[11px] ${tone.text}`} title={result.live.description}>
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
          className={`canto-hit m-1.5 grid size-7 shrink-0 place-items-center rounded-lg hover:bg-edge disabled:opacity-30 disabled:hover:bg-transparent ${
            watched ? "text-accent-text" : "text-faint hover:text-fg"
          }`}
        >
          <BellIcon on={watched} />
        </button>
      </div>
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
                    className="canto-hit w-full truncate rounded px-1 py-0.5 text-left text-[11px] text-muted hover:bg-edge hover:text-fg disabled:hover:bg-transparent"
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
