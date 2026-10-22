import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { api, errText, type GmailMail, type GmailSummary } from "../lib/api";
import { googleGate, initials, shortWhen } from "../lib/google";
import { useRefreshEvent } from "../lib/useRefreshEvent";
import { useExit } from "../lib/motion";
import { useFlip } from "../lib/useFlip";
import { t } from "../i18n";
import ErrorBanner from "./ErrorBanner";
import GoogleGate from "./GoogleGate";
import Skeleton from "./Skeleton";

type Props = { onNotice: (message: string) => void };

const MINI = "canto-hit rounded-md px-2 py-0.5 text-[11px] hover:bg-hover";

/** The inbox's unread count, the unread mail Gmail marked important, and the opt-in alert for those. */
export default function GmailTab({ onNotice }: Props) {
  const [summary, setSummary] = useState<GmailSummary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState(false);
  const { leaving, leave } = useExit();
  const list = useRef<HTMLUListElement>(null);
  useFlip(list, summary?.important.map((m) => m.id).join());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSummary(await api.gmailSummary());
      setError("");
    } catch (e) {
      setError(errText(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    api.gmailAlertsGet().then(setAlerts, () => {});
  }, [load]);
  useRefreshEvent("gmail", () => void load());

  const gate = googleGate(error);
  if (gate) return <GoogleGate kind={gate} onConnected={() => void load()} />;
  if (summary === null) {
    return error ? <ErrorBanner message={error} busy={loading} onRetry={() => void load()} /> : <Skeleton label={t("google.fetching")} rows={4} />;
  }

  // The mail is swept aside first, then the list closes the gap; a failure puts it back.
  const act = (mail: GmailMail, run: () => Promise<unknown>, notice?: string) =>
    leave(mail.id, async () => {
      try {
        await run();
        setSummary((s) => s && { unread: Math.max(0, s.unread - 1), important: s.important.filter((m) => m.id !== mail.id) });
        if (notice) onNotice(notice);
      } catch (e) {
        setError(errText(e));
      }
    });
  const now = new Date();
  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto pr-0.5">
      {error && <ErrorBanner message={error} busy={loading} onRetry={() => void load()} />}
      <section className="wx-glass wx-rise flex items-start justify-between gap-2 bg-gradient-to-br from-accent/10 to-transparent p-3">
        <div>
          <span className="text-[11px] text-muted">{t("gmail.inbox")}</span>
          <p key={summary.unread} data-gmail-unread className="canto-roll text-3xl font-semibold tabular-nums tracking-tight text-fg">{summary.unread}</p>
          <span className="text-[11px] text-muted">{t("gmail.unread")}</span>
        </div>
        <span className="flex items-center gap-1.5">
          <span className="rounded-full bg-warn/15 px-2 py-0.5 text-[11px] font-semibold text-warn">
            {t("gmail.important", { n: summary.important.length })}
          </span>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            aria-label={t("google.refresh")}
            className="canto-hit flex size-6 items-center justify-center rounded-full text-muted hover:bg-hover hover:text-fg disabled:opacity-60"
          >
            <span aria-hidden="true" className={`inline-block text-sm leading-none ${loading ? "wx-spin" : ""}`}>↻</span>
          </button>
        </span>
      </section>
      <h3 className="px-0.5 text-[11px] text-faint">{t("gmail.importantList")}</h3>
      {summary.important.length === 0 ? (
        <p className="wx-glass p-3 text-xs text-muted">{t("gmail.none")}</p>
      ) : (
        <ul ref={list} className="wx-glass shrink-0 divide-y divide-edge overflow-hidden">
          {summary.important.map((mail, index) => (
            <li
              key={mail.id}
              data-gmail-mail={mail.id}
              data-flip={mail.id}
              className={`wx-rise grid ${leaving.has(mail.id) ? "canto-swipe pointer-events-none" : ""} grid-cols-[2rem_1fr_auto] gap-x-2 p-2.5`}
              style={{ "--i": index + 1 } as CSSProperties}
            >
              <span aria-hidden="true" className="row-span-3 grid size-8 place-items-center rounded-full bg-accent/20 text-[11px] font-bold text-accent-text">
                {initials(mail.from)}
              </span>
              <span className="truncate text-xs font-semibold text-fg">{mail.from}</span>
              <span className="text-[10px] tabular-nums text-faint">{shortWhen(new Date(mail.date), now)}</span>
              <span className="col-span-2 truncate text-xs text-fg">{mail.subject}</span>
              <span className="col-span-2 truncate text-[11px] text-muted">{mail.snippet}</span>
              <span className="col-span-2 col-start-2 mt-1 flex flex-wrap gap-1">
                {mail.link && (
                  <button type="button" className={`${MINI} bg-accent/15 text-accent-text`} onClick={() => void api.openLink(mail.link).catch((e) => setError(errText(e)))}>
                    {t("gmail.open")}
                  </button>
                )}
                <button type="button" className={`${MINI} bg-edge/60`} onClick={() => void act(mail, () => api.gmailMarkRead(mail.id))}>
                  {t("gmail.markRead")}
                </button>
                <button
                  type="button"
                  className={`${MINI} bg-edge/60`}
                  onClick={() => void act(mail, async () => { await api.gtasksAdd(mail.subject || mail.from); await api.gmailMarkRead(mail.id); }, t("gmail.toTaskDone"))}
                >
                  {t("gmail.toTask")}
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
      <label className="wx-glass flex cursor-pointer items-start gap-3 p-3 text-xs">
        <span className="flex-1">
          <span className="block text-fg">{t("gmail.alerts")}</span>
          <span className="mt-0.5 block text-[11px] text-muted">{t("gmail.alertsHint")}</span>
        </span>
        <input
          type="checkbox"
          checked={alerts}
          onChange={(e) => {
            const on = e.target.checked;
            setAlerts(on);
            api.gmailAlertsSet(on).catch((err) => {
              setAlerts(!on);
              setError(errText(err));
            });
          }}
          className="mt-0.5 size-4 accent-[var(--color-accent)]"
        />
      </label>
    </div>
  );
}
