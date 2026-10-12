import { api, type MentionRow } from "../lib/api";
import type { Forge } from "../lib/forge";
import type { MentionsState } from "../lib/useMentions";
import { timeAgo } from "../lib/time";
import { t } from "../i18n";
import Avatar from "./Avatar";
import ErrorBanner from "./ErrorBanner";
import { IssueIcon, PullIcon } from "./Icons";
import Skeleton from "./Skeleton";

/** Who mentioned the user, in which thread and what they wrote; a click opens the thread in the browser. */
export default function MentionsList({ forge, mentions }: { forge: Forge; mentions: MentionsState }) {
  const { rows, loading, error, load } = mentions;
  const gitlab = forge === "gitlab";
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <p className="text-[11px] text-faint">{t(gitlab ? "forge.mentions.noteGitlab" : "forge.mentions.note")}</p>
      {error && <ErrorBanner message={error} onRetry={() => void load(true)} busy={loading} />}
      <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {!rows && loading && <Skeleton label={t("forge.mentions.loading")} rows={4} />}
        {rows && rows.length === 0 && (
          <p className="rounded-xl border border-dashed border-edge px-3 py-3 text-center text-[11px] text-faint">
            {t(gitlab ? "forge.mentions.emptyGitlab" : "forge.mentions.empty")}
          </p>
        )}
        {rows && rows.length > 0 && (
          <ul className="space-y-1.5" aria-label={t("forge.sub.mentions")}>
            {rows.map((r) => (
              <Row key={r.id} row={r} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Row({ row }: { row: MentionRow }) {
  const who = row.sender && (row.sender.name || row.sender.login);
  return (
    <li>
      <button
        type="button"
        onClick={() => void api.openLink(row.url)}
        title={row.url}
        aria-label={t("forge.mentions.open", { title: row.title })}
        className="flex w-full flex-col gap-1.5 rounded-xl border border-edge bg-ink/60 p-2.5 text-left transition-colors hover:border-line hover:bg-ink"
      >
        <span className="flex min-w-0 items-center gap-2" data-sender={row.sender ? "" : undefined}>
          {row.sender && <Avatar name={who ?? ""} email={row.sender.login} photo={row.sender.avatar} size="md" />}
          <span className="min-w-0 flex-1 leading-tight">
            {row.sender ? (
              <>
                <span className="block truncate text-xs font-semibold text-fg">{who}</span>
                {row.sender.name && <span className="block truncate text-[11px] text-muted">@{row.sender.login}</span>}
              </>
            ) : (
              <span className="block text-[11px] text-faint">{t("forge.mentions.noPreview")}</span>
            )}
          </span>
          <span className="shrink-0 self-start text-[11px] text-faint">{row.at && timeAgo(row.at)}</span>
          <span aria-hidden="true" title={t("forge.openExternal")} className="shrink-0 self-start text-[11px] text-faint">
            ↗
          </span>
        </span>
        {row.preview && (
          <span className="line-clamp-3 border-l-2 border-line pl-2 text-xs text-muted" data-preview>
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
    </li>
  );
}
