import { useState } from "react";
import { api, errText, type PrConvEntry } from "../../lib/api";
import { timeAgo } from "../../lib/time";
import { t } from "../../i18n";
import Skeleton from "../../components/Skeleton";
import type { PrBackend } from "./prApi";
import type { Loaded } from "./usePrLoad";
import { filterThreads, groupThreads, type Thread, type ThreadFilter } from "./prThreads";

const BTN = "canto-hit min-h-[24px] rounded-md border border-edge px-2 text-[11px] text-muted hover:bg-hover hover:text-fg disabled:opacity-60";
const FILTERS: ThreadFilter[] = ["all", "open", "resolved"];

function Comment({ c, reply }: { c: PrConvEntry; reply?: boolean }) {
  return (
    <div className={`rounded-lg border border-edge bg-panel/60 p-1.5 ${reply ? "ml-3" : ""}`}>
      <div className="flex items-center gap-1.5 text-[11px] text-muted">
        <b className="min-w-0 truncate text-fg">@{c.author || "?"}</b>
        {c.bot && <span className="rounded-full bg-edge px-1.5 text-[10px]">{t("forge.peek.bot")}</span>}
        <span className="text-faint">{timeAgo(c.created_at)}</span>
        <button type="button" onClick={() => void api.openLink(c.url).catch(() => {})} aria-label={t("forge.peek.openComment", { author: c.author })} title={t("forge.peek.openComment", { author: c.author })} className="canto-hit ml-auto grid size-5 shrink-0 place-items-center rounded-md text-faint hover:text-fg">
          ↗
        </button>
      </div>
      <p className="m-0 mt-0.5 whitespace-pre-wrap break-words text-xs text-fg">{c.body}</p>
    </div>
  );
}

function ThreadCard({ th, back, onChanged }: { th: Thread; back: PrBackend; onChanged: () => void }) {
  const [open, setOpen] = useState(!th.resolved);
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState("");
  const where = th.root.path ? `${th.root.path}${th.root.line > 0 ? `:${th.root.line}` : ""}` : "";

  async function run(job: () => Promise<void>, done: () => void) {
    setBusy(true);
    setFailed("");
    try {
      await job();
      done();
      onChanged();
    } catch (e) {
      setFailed(errText(e));
    } finally {
      setBusy(false);
    }
  }

  if (th.resolved && !open)
    return (
      <button type="button" aria-expanded="false" onClick={() => setOpen(true)} className="canto-hit flex w-full items-center gap-2 rounded-lg border border-edge px-2.5 py-1.5 text-left text-[11px] text-muted hover:bg-hover">
        <span>✓ {t("forge.pr.resolved")}</span>
        <span className="min-w-0 flex-1 truncate font-mono text-fg">{where}</span>
        <span>{t("forge.pr.msgs", { n: th.replies.length + 1 })} ▾</span>
      </button>
    );
  return (
    <li className="list-none space-y-1.5 rounded-xl border border-edge bg-ink/60 p-2">
      {where && (
        <p className="m-0 flex items-center gap-1.5 text-[11px]">
          <span className={th.resolved ? "text-ok" : "text-warn"}>{th.resolved ? `✓ ${t("forge.pr.resolved")}` : t("forge.pr.open")}</span>
          <span className="min-w-0 flex-1 break-all font-mono text-muted">{where}</span>
          {th.resolved && (
            <button type="button" onClick={() => setOpen(false)} className={BTN}>
              {t("forge.pr.collapse")}
            </button>
          )}
        </p>
      )}
      {th.root.hunk && <pre aria-label={t("forge.peek.diff")} className="m-0 max-h-24 overflow-auto rounded-md bg-ink p-1 font-mono text-[10px] text-muted">{th.root.hunk}</pre>}
      <Comment c={th.root} />
      {th.replies.map((r) => (
        <Comment key={r.id} c={r} reply />
      ))}
      {th.id && (
        <div className="flex flex-wrap items-center gap-1.5">
          {replying ? (
            <>
              <input value={text} maxLength={2000} onChange={(e) => setText(e.target.value)} aria-label={t("forge.pr.replyLabel")} placeholder={t("forge.pr.replyPlaceholder")} className="canto-field min-w-0 flex-1 px-2 py-1 text-xs" />
              <button type="button" disabled={busy || text.trim() === ""} onClick={() => void run(() => back.reply(th.id, text.trim()), () => (setText(""), setReplying(false)))} className={BTN}>
                {t("forge.pr.send")}
              </button>
              <button type="button" onClick={() => setReplying(false)} className={BTN}>
                {t("forge.peek.cancel")}
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setReplying(true)} className={BTN}>
              {t("forge.pr.reply")}
            </button>
          )}
          {back.resolve && th.resolvable && !replying && (
            <button type="button" disabled={busy} onClick={() => void run(() => back.resolve!(th.id, !th.resolved), () => {})} className={`${BTN} ml-auto`}>
              {t(th.resolved ? "forge.pr.reopen" : "forge.pr.resolve")}
            </button>
          )}
        </div>
      )}
      {failed && (
        <p role="alert" className="m-0 text-[11px] text-danger">
          {failed}
        </p>
      )}
    </li>
  );
}

/** Threads of the conversation: comment, diff excerpt and replies together; resolved ones fold away. */
export default function PrConversation({ back, conv }: { back: PrBackend; conv: Loaded<PrConvEntry[]> }) {
  const [filter, setFilter] = useState<ThreadFilter>("all");
  const [bots, setBots] = useState(true);
  if (conv.error)
    return (
      <p role="alert" className="m-0 text-[11px] text-danger">
        {conv.error}
      </p>
    );
  if (!conv.data) return <Skeleton label={t("forge.peek.convLoading")} rows={2} />;
  const all = groupThreads(conv.data);
  const shown = filterThreads(all, filter, bots);
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={t("forge.pr.filter")}>
        {FILTERS.map((f) => (
          <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className={`${BTN} aria-pressed:border-accent aria-pressed:text-accent-text`}>
            {t(`forge.pr.filter.${f}`)}
          </button>
        ))}
        {all.some((th) => th.root.bot) && (
          <button type="button" aria-pressed={!bots} onClick={() => setBots(!bots)} className={`${BTN} ml-auto`}>
            {t(bots ? "forge.peek.hideBots" : "forge.peek.showBots")}
          </button>
        )}
      </div>
      {shown.length === 0 && <p className="m-0 text-[11px] text-faint">{t("forge.peek.convEmpty")}</p>}
      <ul aria-label={t("forge.peek.convLabel")} className="m-0 space-y-2 p-0">
        {shown.map((th) => (
          <ThreadCard key={th.key} th={th} back={back} onChanged={conv.reload} />
        ))}
      </ul>
    </div>
  );
}
