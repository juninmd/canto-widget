import { useState } from "react";
import { api, type MentionRow } from "../lib/api";
import type { Forge } from "../lib/forge";
import { ALL_MENTIONS, countMuted, countUnread, filterMentions, type MentionView } from "../lib/mentions";
import type { MentionsState } from "../lib/useMentions";
import { clockLabel } from "../lib/clockLabel";
import { timeAgo } from "../lib/time";
import { t } from "../i18n";
import Avatar from "./Avatar";
import ErrorBanner from "./ErrorBanner";
import { IssueIcon, PullIcon } from "./Icons";
import Skeleton from "./Skeleton";

const CHIP = "canto-hit min-h-[24px] rounded-full border px-2 text-[11px] transition-colors";
const LINK = "canto-hit min-h-[24px] rounded-md px-1.5 text-[11px] text-muted hover:bg-hover hover:text-fg active:bg-active";

/** Who mentioned the user, in which thread and what they wrote; a click opens the thread in the browser. */
export default function MentionsList({ forge, mentions }: { forge: Forge; mentions: MentionsState }) {
  const { rows, reply, loading, error, load } = mentions;
  const [view, setView] = useState<MentionView>(ALL_MENTIONS);
  const gitlab = forge === "gitlab";
  const shown = rows ? filterMentions(rows, view) : [];
  const unread = rows ? countUnread(rows) : 0;
  const muted = rows ? countMuted(rows) : 0;
  const chip = (on: boolean) => `${CHIP} ${on ? "border-accent-text text-accent-text" : "border-edge text-muted hover:bg-hover hover:text-fg"}`;
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <p className="text-[11px] text-faint">{t(gitlab ? "forge.mentions.noteGitlab" : "forge.mentions.note")}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        <input
          type="search"
          value={view.text}
          aria-label={t("forge.mentions.filter")}
          placeholder={t("forge.mentions.filterPlaceholder")}
          onChange={(e) => setView({ ...view, text: e.target.value })}
          className="canto-field min-w-0 flex-1 px-2 py-1 text-xs"
        />
        <button type="button" aria-pressed={view.unreadOnly} onClick={() => setView({ ...view, unreadOnly: !view.unreadOnly })} className={chip(view.unreadOnly)}>
          {t("forge.mentions.unreadOnly")}
        </button>
        {muted > 0 && (
          <button type="button" aria-pressed={view.showMuted} onClick={() => setView({ ...view, showMuted: !view.showMuted })} className={chip(view.showMuted)}>
            {t("forge.mentions.showMuted", { n: muted })}
          </button>
        )}
        {gitlab && (
          <button type="button" aria-pressed={mentions.includeDone} onClick={() => mentions.toggleDone(!mentions.includeDone)} className={chip(mentions.includeDone)}>
            {t("forge.mentions.includeDone")}
          </button>
        )}
        {unread > 0 && (
          <button
            type="button"
            onClick={() => void mentions.markRead(rows!.filter((r) => r.unread && !r.muted).map((r) => r.id), true)}
            className={`${LINK} ml-auto`}
          >
            {t("forge.mentions.markAll")}
          </button>
        )}
      </div>
      {reply?.limited_until && (
        <p role="status" className="text-[11px] text-muted">
          {t("forge.rateLimited", { time: clockLabel(reply.limited_until) })}
        </p>
      )}
      {error && <ErrorBanner message={error} onRetry={() => void load(true)} busy={loading} />}
      <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {!rows && loading && <Skeleton label={t("forge.mentions.loading")} rows={4} />}
        {rows && shown.length === 0 && (
          <p className="rounded-xl border border-dashed border-edge px-3 py-3 text-center text-[11px] text-faint">
            {rows.length > 0 ? t("forge.mentions.emptyFiltered") : t(gitlab ? "forge.mentions.emptyGitlab" : "forge.mentions.empty")}
          </p>
        )}
        {shown.length > 0 && (
          <ul className="space-y-1.5" aria-label={t("forge.sub.mentions")}>
            {shown.map((r) => (
              <Row key={r.id} row={r} mentions={mentions} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const LONG = 160;

function Row({ row, mentions }: { row: MentionRow; mentions: MentionsState }) {
  const [open, setOpen] = useState(false);
  const who = row.sender && (row.sender.name || row.sender.login);
  const long = row.preview.length > LONG || row.preview.includes("\n");
  const login = row.sender?.login ?? "";
  const tone = row.muted ? "opacity-60" : "";

  function openThread() {
    void api.openLink(row.url);
    if (row.unread) void mentions.markRead([row.id], true);
  }

  return (
    <li className={`rounded-xl border bg-ink/60 transition-colors hover:border-line hover:bg-ink ${row.unread ? "border-accent-text/50" : "border-edge"} ${tone}`}>
      <button
        type="button"
        onClick={openThread}
        title={row.url}
        aria-label={t("forge.mentions.open", { title: row.title })}
        className="flex w-full flex-col gap-1.5 p-2.5 text-left"
      >
        <span className="flex min-w-0 items-center gap-2" data-sender={row.sender ? "" : undefined}>
          {row.unread && <span role="img" aria-label={t("forge.mentions.unread")} className="h-2 w-2 shrink-0 rounded-full bg-accent-text" />}
          {row.sender && <Avatar name={who ?? ""} email={login} photo={row.sender.avatar} size="md" />}
          <span className="min-w-0 flex-1 leading-tight">
            {row.sender ? (
              <>
                <span className="block truncate text-xs font-semibold text-fg">{who}</span>
                {row.sender.name && <span className="block truncate text-[11px] text-muted">@{login}</span>}
              </>
            ) : (
              <span className="block text-[11px] text-faint">{t("forge.mentions.noPreview")}</span>
            )}
          </span>
          {row.done && <span className="shrink-0 self-start rounded-full bg-edge px-1.5 text-[10px] text-muted">{t("forge.mentions.doneTag")}</span>}
          {row.muted && <span className="shrink-0 self-start rounded-full bg-edge px-1.5 text-[10px] text-muted">{t("forge.mentions.mutedTag")}</span>}
          <span className="shrink-0 self-start text-[11px] text-faint">{row.at && timeAgo(row.at)}</span>
          <span aria-hidden="true" title={t("forge.openExternal")} className="shrink-0 self-start text-[11px] text-faint">
            ↗
          </span>
        </span>
        {row.preview && (
          <span className={`${open ? "" : "line-clamp-3"} whitespace-pre-line break-words border-l-2 border-line pl-2 text-xs text-muted`} data-preview>
            {row.preview}
          </span>
        )}
        <span className="flex min-w-0 items-center gap-1.5 text-[11px] text-muted">
          <span className="shrink-0 text-accent-text" role="img" aria-label={row.is_pr ? t("forge.item.pr") : t("forge.item.issue")}>
            {row.is_pr ? <PullIcon /> : <IssueIcon />}
          </span>
          <span className="truncate text-fg">{row.title}</span>
          <span className="ml-auto shrink-0 truncate text-faint">{row.reference}</span>
        </span>
      </button>
      <div className="flex flex-wrap items-center gap-x-1 border-t border-edge/60 px-1.5 py-0.5">
        {long && (
          <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className={LINK}>
            {t(open ? "forge.mentions.less" : "forge.mentions.more")}
          </button>
        )}
        {!row.done && (
          <button type="button" onClick={() => void mentions.markRead([row.id], row.unread)} className={LINK}>
            {t(row.unread ? "forge.mentions.markRead" : "forge.mentions.markUnread")}
          </button>
        )}
        {row.muted ? (
          <button
            type="button"
            onClick={() => {
              void mentions.muteThread(row, false);
              if (login) void mentions.muteAuthor(login, false);
            }}
            className={LINK}
          >
            {t("forge.mentions.unmute")}
          </button>
        ) : (
          <>
            <button type="button" onClick={() => void mentions.muteThread(row, true)} className={LINK}>
              {t("forge.mentions.muteThread")}
            </button>
            {login && (
              <button type="button" onClick={() => void mentions.muteAuthor(login, true)} className={LINK}>
                {t("forge.mentions.muteAuthor", { login })}
              </button>
            )}
          </>
        )}
      </div>
    </li>
  );
}
