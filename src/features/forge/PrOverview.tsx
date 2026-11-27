import { useState } from "react";
import { errText, type PrDetail, type PrMeta } from "../../lib/api";
import { timeAgo } from "../../lib/time";
import { t } from "../../i18n";
import { CiPill } from "./ForgePills";
import { useRepoAvatars } from "./useRepoAvatars";
import type { PrBackend } from "./prApi";
import PrLabels from "./PrLabels";
import PrMarkdown from "./PrMarkdown";
import PrReactions, { foldReactions, GITHUB_EMOJI, GITLAB_EMOJI } from "./PrReactions";

const BOX = "rounded-xl border border-edge bg-ink/60 p-2.5";
const H = "m-0 text-[10.5px] font-semibold uppercase tracking-wide text-faint";

export function Avatar({ src, name, size = "size-6" }: { src?: string; name: string; size?: string }) {
  return src ? (
    <img src={src} alt="" className={`${size} shrink-0 rounded-full`} />
  ) : (
    <span aria-hidden="true" className={`${size} grid shrink-0 place-items-center rounded-full bg-edge text-[10px] font-bold uppercase text-muted`}>
      {name.slice(0, 1)}
    </span>
  );
}

/** The glance: how it stands to merge, its labels and people, and the description with its pictures and reactions. */
export default function PrOverview({ back, detail, meta, login, onChanged }: { back: PrBackend; detail: PrDetail; meta: PrMeta | null; login: string; onChanged: () => void }) {
  const [source, setSource] = useState(false);
  const [failed, setFailed] = useState("");
  const photo = useRepoAvatars(back.forge, [meta?.author_avatar ?? ""])(meta?.author_avatar ?? "");
  const state = detail.jobs.some((j) => j.state === "failure") ? "failure" : detail.jobs.some((j) => j.state === "running") ? "running" : detail.jobs.length ? "success" : "none";
  const approved = detail.reviewers.filter((r) => r.state === "approved").length;
  const changes = detail.reviewers.some((r) => r.state === "changes");
  const body = meta?.body ?? detail.body;

  async function toggle(emoji: string, mine: boolean) {
    const own = meta?.reactions.find((r) => r.emoji === emoji && r.user === login);
    setFailed("");
    try {
      await back.act(mine && own ? { kind: "unreact", target: "pr", reaction: own.id } : { kind: "react", target: "pr", emoji });
      onChanged();
    } catch (e) {
      setFailed(errText(e));
    }
  }

  return (
    <>
      <section aria-label={t("forge.pr.mergeBox")} className="divide-y divide-edge rounded-xl border border-edge bg-panel">
        <div className="flex items-center gap-2 px-2.5 py-2 text-xs">
          <h3 className={`${H} w-16`}>{t("forge.pr.checks")}</h3>
          <CiPill status={state} />
          <span className="text-[11px] text-muted">{t("forge.pr.jobsCount", { n: detail.jobs.length })}</span>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-2 text-xs">
          <h3 className={`${H} w-16`}>{t("forge.pr.reviews")}</h3>
          <span className={`font-semibold ${changes ? "text-danger" : approved > 0 ? "text-ok" : "text-muted"}`}>{changes ? t("forge.item.changes") : t("forge.pr.approvedCount", { n: approved })}</span>
          <span className="text-[11px] text-muted">{t("forge.pr.askedCount", { n: detail.reviewers.length })}</span>
        </div>
        {meta && (
          <div className="flex items-center gap-2 px-2.5 py-2 text-xs">
            <h3 className={`${H} w-16`}>{t("forge.pr.branch")}</h3>
            <span className={meta.conflict ? "font-semibold text-danger" : "text-ok"}>{meta.conflict ? t("forge.pr.conflict") : t("forge.pr.noConflict")}</span>
          </div>
        )}
      </section>
      {meta && (
        <section aria-label={t("forge.pr.labels")} className={`${BOX} space-y-2`}>
          <PrLabels back={back} labels={meta.labels} onChanged={onChanged} />
          <p className="m-0 flex flex-wrap gap-x-3 text-[11px] text-muted">
            <span>
              {t("forge.pr.assignees")}: <b className="text-fg">{meta.assignees.length ? meta.assignees.map((a) => `@${a}`).join(", ") : t("forge.pr.nobody")}</b>
            </span>
            {meta.milestone && (
              <span>
                {t("forge.pr.milestone")}: <b className="text-fg">{meta.milestone}</b>
              </span>
            )}
          </p>
        </section>
      )}
      <section aria-label={t("forge.pr.description")} className={`${BOX} space-y-2`}>
        {meta && (
          <div className="flex items-center gap-2 text-[11px] text-muted">
            <Avatar src={photo} name={meta.author} />
            <b className="text-fg">@{meta.author}</b>
            <span>{t("forge.pr.opened", { when: timeAgo(meta.created_at) })}</span>
            <span className="rounded-full bg-accent/15 px-1.5 text-[10px] font-medium text-accent-text">{t("forge.pr.author")}</span>
          </div>
        )}
        <div className="flex items-center">
          <h3 className={H}>{t("forge.pr.description")}</h3>
          {body && (
            <button type="button" aria-pressed={source} onClick={() => setSource(!source)} className="canto-hit ml-auto min-h-[24px] rounded-md border border-edge px-2 text-[11px] text-muted hover:bg-hover hover:text-fg">
              {t(source ? "forge.pr.viewRendered" : "forge.pr.viewSource")}
            </button>
          )}
        </div>
        {!body ? (
          <p className="m-0 text-xs text-faint">{t("forge.peek.noBody")}</p>
        ) : source ? (
          <pre className="m-0 overflow-x-auto whitespace-pre-wrap break-words font-mono text-[11px] text-fg">{body}</pre>
        ) : (
          <PrMarkdown back={back} text={body} />
        )}
        {meta && <PrReactions items={foldReactions(meta.reactions, login)} emojis={back.forge === "gitlab" ? GITLAB_EMOJI : GITHUB_EMOJI} onToggle={(e, mine) => void toggle(e, mine)} />}
        {failed && (
          <p role="alert" className="m-0 text-[11px] text-danger">
            {failed}
          </p>
        )}
      </section>
      <p className="m-0 text-[11px] text-muted">{t("forge.peek.files", { n: detail.changed_files })}</p>
    </>
  );
}
