import { useCallback, useEffect, useRef, useState } from "react";
import { api, errText, type GmailAction, type GmailMail, type GmailSummary, type GmailView } from "../lib/api";
import { composeLink } from "../lib/contactExtras";
import { googleGate } from "../lib/google";
import { afterAction, leavesView } from "../lib/gmailView";
import { useRefreshEvent } from "../lib/useRefreshEvent";
import { useExit } from "../lib/motion";
import { useFlip } from "../lib/useFlip";
import { t } from "../i18n";
import ErrorBanner from "./ErrorBanner";
import GmailBulkBar from "./GmailBulkBar";
import GmailRow, { MINI } from "./GmailRow";
import GoogleGate from "./GoogleGate";
import { SearchIcon } from "./Icons";
import Skeleton from "./Skeleton";

type Props = { onNotice: (message: string) => void };

const VIEWS: GmailView[] = ["important", "unread", "starred", "inbox"];
const INBOX = "https://mail.google.com/mail/u/0/#inbox";
const SEARCH_PAUSE_MS = 350;
const BATCH = "\u0000batch";
const EMPTY = { important: "gmail.none", unread: "gmail.empty.unread", starred: "gmail.empty.starred", inbox: "gmail.empty.inbox" } as const;
const DONE: Partial<Record<GmailAction, "gmail.done.read" | "gmail.done.archive" | "gmail.done.trash">> = {
  read: "gmail.done.read",
  archive: "gmail.done.archive",
  trash: "gmail.done.trash",
};

/** The inbox's unread count and one view of it (important, unread, starred, all), searchable, with single and batch actions. */
export default function GmailTab({ onNotice }: Props) {
  const [view, setView] = useState<GmailView>("important");
  const [search, setSearch] = useState("");
  const [summary, setSummary] = useState<GmailSummary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState(false);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [exits, setExits] = useState<Record<string, GmailAction>>({});
  const { leaving, leave } = useExit();
  const list = useRef<HTMLUListElement>(null);
  useFlip(list, summary?.important.map((m) => m.id).join());

  const latest = useRef(0);

  // Only the newest request lands: a slow answer for an earlier view or search must not replace the current one.
  const load = useCallback(async (which: GmailView, query: string) => {
    const ticket = ++latest.current;
    setLoading(true);
    try {
      const next = await api.gmailSummary(which, query);
      if (ticket !== latest.current) return;
      setSummary(next);
      setError("");
    } catch (e) {
      if (ticket === latest.current) setError(errText(e));
    } finally {
      if (ticket === latest.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    setSelected(new Set());
    const timer = setTimeout(() => void load(view, search), search ? SEARCH_PAUSE_MS : 0);
    return () => clearTimeout(timer);
  }, [load, view, search]);
  useEffect(() => {
    api.gmailAlertsGet().then(setAlerts, () => {});
  }, []);
  useRefreshEvent("gmail", () => void load(view, search));

  const gate = googleGate(error);
  if (gate) return <GoogleGate kind={gate} onConnected={() => void load(view, search)} />;
  if (summary === null) {
    return error ? <ErrorBanner message={error} busy={loading} onRetry={() => void load(view, search)} /> : <Skeleton label={t("google.fetching")} rows={4} />;
  }

  const openLink = (url: string) => void api.openLink(url).catch((e) => setError(errText(e)));
  // A mail that leaves the view is swept out its own way first, then the list closes the gap; a failure puts it back.
  const act = (ids: string[], action: GmailAction, extra?: () => Promise<unknown>, notice?: string) => {
    const run = async () => {
      try {
        await extra?.();
        await api.gmailModify(ids, action);
        setSummary((s) => s && afterAction(s, ids, action, view));
        setSelected((s) => new Set([...s].filter((id) => !ids.includes(id))));
        const key = DONE[action];
        const done = notice ?? (ids.length > 1 && key ? t(key) : undefined);
        if (done) onNotice(done);
      } catch (e) {
        setError(errText(e));
      }
    };
    if (!leavesView(view, action)) return void run();
    setExits((x) => ({ ...x, ...Object.fromEntries(ids.map((id) => [id, action])) }));
    return void leave(ids.length > 1 ? BATCH : ids[0], run);
  };
  const toTask = (mail: GmailMail) => {
    const add = () => api.gtasksAdd(mail.subject || mail.from);
    if (mail.unread) return act([mail.id], "read", add, t("gmail.toTaskDone"));
    add().then(() => onNotice(t("gmail.toTaskDone")), (e) => setError(errText(e)));
  };
  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  const mails = summary.important;
  const now = new Date();
  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto pr-0.5">
      {error && <ErrorBanner message={error} busy={loading} onRetry={() => void load(view, search)} />}
      <section className="wx-glass wx-rise flex items-center justify-between gap-2 bg-gradient-to-br from-accent/15 via-accent/5 to-transparent p-3">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="canto-float grid size-10 place-items-center rounded-xl bg-accent/15 text-xl">✉️</span>
          <div>
            <span className="text-[11px] text-muted">{t("gmail.inbox")}</span>
            <p key={summary.unread} data-gmail-unread className="canto-roll text-3xl font-semibold leading-none tabular-nums tracking-tight text-fg">{summary.unread}</p>
            <span className="text-[11px] text-muted">{t("gmail.unread")}</span>
          </div>
        </div>
        <span className="flex flex-col items-end gap-1.5">
          <span className="flex items-center gap-1">
            <button type="button" onClick={() => openLink(composeLink())} className={`${MINI} bg-accent text-ink hover:opacity-90`}>
              ✎ {t("gmail.compose")}
            </button>
            <button type="button" onClick={() => openLink(INBOX)} aria-label={t("gmail.openInbox")} className={`${MINI} bg-edge/60 hover:bg-hover`}>
              ↗
            </button>
            <button
              type="button"
              onClick={() => void load(view, search)}
              disabled={loading}
              aria-label={t("google.refresh")}
              className="canto-hit flex size-6 items-center justify-center rounded-full text-muted hover:bg-hover hover:text-fg disabled:opacity-60"
            >
              <span aria-hidden="true" className={`inline-block text-sm leading-none ${loading ? "wx-spin" : ""}`}>↻</span>
            </button>
          </span>
          {view === "important" && (
            <span key={mails.length} className="canto-pop rounded-full bg-warn/15 px-2 py-0.5 text-[11px] font-semibold text-warn">
              {t("gmail.important", { n: mails.length })}
            </span>
          )}
        </span>
      </section>
      <div role="group" className="flex flex-wrap gap-1.5">
        {VIEWS.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={view === id}
            onClick={() => setView(id)}
            className="canto-hit rounded-full border border-edge px-2.5 py-0.5 text-[11px] text-muted aria-pressed:border-accent/50 aria-pressed:bg-accent/15 aria-pressed:text-accent-text"
          >
            {t(`gmail.view.${id}`)}
          </button>
        ))}
      </div>
      <label className="canto-field flex items-center gap-2 rounded-lg border border-edge bg-ink px-2.5 text-xs">
        <span aria-hidden="true" className="text-faint [&>svg]:size-3.5"><SearchIcon /></span>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("gmail.search")}
          aria-label={t("gmail.search")}
          maxLength={100}
          className="min-w-0 flex-1 bg-transparent py-1.5 text-fg outline-none placeholder:text-faint"
        />
      </label>
      {mails.length === 0 ? (
        <p key={view} className="wx-glass wx-rise flex items-center gap-2 p-3 text-xs text-muted">
          <span aria-hidden="true" className="canto-float inline-block text-base">📭</span>
          {search ? t("gmail.noMatch") : t(EMPTY[view])}
        </p>
      ) : (
        <ul ref={list} key={view} className="wx-glass shrink-0 divide-y divide-edge overflow-hidden">
          {mails.map((mail, index) => (
            <GmailRow
              key={mail.id}
              mail={mail}
              index={index}
              now={now}
              selected={selected.has(mail.id)}
              leaving={leaving.has(mail.id) || (leaving.has(BATCH) && selected.has(mail.id)) ? (exits[mail.id] ?? "read") : null}
              onSelect={() => toggle(mail.id)}
              onAct={(action) => act([mail.id], action)}
              onTask={() => toTask(mail)}
              onOpen={() => openLink(mail.link)}
            />
          ))}
        </ul>
      )}
      {selected.size > 0 && (
        <GmailBulkBar
          count={selected.size}
          total={mails.length}
          onAll={() => setSelected(new Set(mails.map((m) => m.id)))}
          onClear={() => setSelected(new Set())}
          onAct={(action) => act([...selected], action)}
        />
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
