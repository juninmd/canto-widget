import { useEffect, useRef, useState } from "react";
import { api, type AgendaItem, type ResolvedAlert } from "../lib/api";
import { outcomeLabel, resolvedToday, toneOf } from "../lib/alerts";
import { LOCALE, t } from "../i18n";
import AlertCard from "./AlertCard";
import { TONE } from "./AlertStrip";
import ErrorBanner from "./ErrorBanner";
import { BellIcon, CheckIcon } from "./Icons";

const SHOWN = 8;
const heading = "flex items-center gap-2 text-[10px] uppercase tracking-widest text-faint";
const count = "inline-flex h-4 min-w-4 items-center justify-center rounded-md bg-edge/70 px-1 text-[10px] tabular-nums text-muted";
const card = "rounded-xl border border-edge bg-ink/60 p-3";

type Props = {
  alerts: AgendaItem[];
  log: ResolvedAlert[];
  onGone: (id: string) => void;
  /** Re-reads the alerts and the log after Rust handled a close or a snooze. */
  onRefresh: () => void;
  onCompleted: () => void;
  onOpenModels: () => void;
  onClose: () => void;
};

/** The whole window of alerts: what is pending, with its actions, and what was handled today. */
export default function NotificationsPanel({
  alerts,
  log,
  onGone,
  onRefresh,
  onCompleted,
  onOpenModels,
  onClose,
}: Props) {
  const done = resolvedToday(log);
  const [all, setAll] = useState(false);
  const [failed, setFailed] = useState(0);
  const [busy, setBusy] = useState(false);
  const backButton = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const previous = useRef<Element | null>(null);
  const close = useRef(onClose);
  close.current = onClose;

  // The screen covers the window but the bar behind it is not inert: Tab must run through here and come back.
  function onTab(e: React.KeyboardEvent) {
    if (e.key !== "Tab") return;
    const items = [...(root.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])') ?? [])];
    const [first, last] = [items[0], items[items.length - 1]];
    if (!first || !last) return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  useEffect(() => {
    previous.current = document.activeElement;
    backButton.current?.focus();
    // A click on the background moves focus out of the dialog, so Esc listens on the window, not on the panel.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      close.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      // Returns focus to the bell: closing the alerts can't throw the keyboard to the top.
      (previous.current as HTMLElement | null)?.focus?.();
    };
  }, []);

  // One reread once every close has answered; the ones that failed stay in the list.
  async function dismissAll() {
    setBusy(true);
    const results = await Promise.allSettled(alerts.map((a) => api.alertClose(a.id)));
    for (const [i, r] of results.entries()) if (r.status === "fulfilled") onGone(alerts[i].id);
    setFailed(results.filter((r) => r.status === "rejected").length);
    setBusy(false);
    onRefresh();
  }

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label={t("notif.title")}
      onKeyDown={onTab}
      className="absolute inset-0 z-40 flex flex-col gap-3 overflow-hidden rounded-2xl bg-panel p-4 text-fg motion-safe:animate-surgir motion-reduce:animate-fade"
    >
      <header className="flex shrink-0 items-center justify-between gap-2">
        <h2 className="flex min-w-0 items-center gap-2 text-sm font-semibold">
          <span aria-hidden="true" className="text-warn">
            <BellIcon on={alerts.length > 0} />
          </span>
          <span className="truncate">{t("notif.title")}</span>
          <span className={count}>{alerts.length}</span>
        </h2>
        <div className="flex shrink-0 items-center gap-1">
          {alerts.length > 1 && (
            <button
              type="button"
              onClick={() => void dismissAll()}
              disabled={busy}
              className="canto-hit min-h-[24px] whitespace-nowrap rounded-md px-2 text-[11px] text-muted hover:bg-hover hover:text-fg active:bg-active disabled:opacity-50"
            >
              {t("notif.dismissAll")}
            </button>
          )}
          <button
            ref={backButton}
            type="button"
            onClick={onClose}
            title="Esc"
            className="canto-hit min-h-[24px] rounded-lg bg-edge px-3 text-xs text-fg hover:bg-hover active:bg-active"
          >
            {t("transcripts.back")}
          </button>
        </div>
      </header>

      {failed > 0 && (
        <ErrorBanner message={t("notif.dismissFailed", { n: failed })} busy={busy} onRetry={() => void dismissAll()} />
      )}

      <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1">
        {alerts.length === 0 ? (
          <div className={`${card} flex items-center gap-2.5 text-xs text-muted`}>
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent/15 text-accent-text">
              <CheckIcon />
            </span>
            <span>
              {t("notif.empty")}
              <span className="block text-[11px] text-faint">{t("notif.emptyHint")}</span>
            </span>
          </div>
        ) : (
          <ul aria-label={t("notif.pending")} className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {alerts.map((e) => (
              <li key={e.id} className="motion-safe:animate-surgir motion-reduce:animate-fade">
                <AlertCard event={e} onGone={onGone} onSettled={onRefresh} onCompleted={onCompleted} onOpenModels={onOpenModels} />
              </li>
            ))}
          </ul>
        )}

        <h3 className={`${heading} mt-4`}>
          {t("notif.resolved")} <span className={count}>{done.length}</span>
        </h3>
        {done.length === 0 ? (
          <p className="text-xs text-muted">{t("notif.resolvedEmpty")}</p>
        ) : (
          <ul className="divide-y divide-edge rounded-lg border border-edge bg-ink/40">
            {(all ? done : done.slice(0, SHOWN)).map((r, i) => (
              <li key={`${r.item.id}-${r.at}-${i}`} className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs">
                <span
                  aria-hidden="true"
                  className={`grid size-5 shrink-0 place-items-center rounded-full bg-edge/70 ${r.outcome === "done" ? TONE[toneOf(r.item)].text : "text-faint"}`}
                >
                  <CheckIcon />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-muted">{r.item.title}</span>
                  <span className="block text-[11px] text-faint">{outcomeLabel(r.item, r.outcome)}</span>
                </span>
                <time dateTime={new Date(r.at).toISOString()} className="shrink-0 text-[11px] tabular-nums text-faint">
                  {new Date(r.at).toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" })}
                </time>
              </li>
            ))}
          </ul>
        )}
        {done.length > SHOWN && (
          <button
            type="button"
            onClick={() => setAll((v) => !v)}
            aria-expanded={all}
            className="canto-hit mt-1 min-h-[24px] rounded-md px-1.5 text-[11px] text-muted hover:bg-hover hover:text-fg active:bg-active"
          >
            {all ? t("notif.showLess") : t("notif.showMore", { n: done.length - SHOWN })}
          </button>
        )}
      </div>
    </div>
  );
}
