import { useEffect, useMemo, useRef, useState } from "react";
import { api, type ForgeItem, type PrMeta } from "../../lib/api";
import { t, type MessageKey } from "../../i18n";
import type { Forge } from "./forge";
import { prBackend } from "./prApi";
import { usePrLoad } from "./usePrLoad";
import { CiPill } from "./ForgePills";
import Skeleton from "../../components/Skeleton";
import PrOverview from "./PrOverview";
import PrConversation from "./PrConversation";
import PrPipeline from "./PrPipeline";
import PrFiles from "./PrFiles";
import PrReviewers from "./PrReviewers";
import PrActions from "./PrActions";
import { PrTabBar, PrTabRail, type PrTabDef } from "./PrTabs";
import { Avatar } from "./PrOverview";
import { Pill } from "./ForgePills";
import { useRepoAvatars } from "./useRepoAvatars";
import { useTabLayout } from "../../shell/tabLayout";

type Props = { forge: Forge; item: ForgeItem; login: string; onClose: () => void };
export type PrTab = "overview" | "conversation" | "pipeline" | "files" | "reviewers";

const TABS: { key: PrTab; label: MessageKey }[] = [
  { key: "overview", label: "forge.pr.tab.overview" },
  { key: "conversation", label: "forge.pr.tab.conversation" },
  { key: "pipeline", label: "forge.pr.tab.pipeline" },
  { key: "files", label: "forge.pr.tab.files" },
  { key: "reviewers", label: "forge.pr.tab.reviewers" },
];

const STATE_TONE = { open: "ok", draft: "neutral", merged: "info", closed: "bad" } as const;

/** What the header says of the PR/MR: open, draft, merged or closed. */
function stateOf(meta: PrMeta | null): keyof typeof STATE_TONE | null {
  return !meta ? null : meta.state === "open" && meta.draft ? "draft" : meta.state;
}

/** A PR or MR over the whole Canto window: everything to read and to do, so the forge's own site isn't needed. */
export default function PrView({ forge, item, login, onClose }: Props) {
  const back = useMemo(() => prBackend(forge, item), [forge, item]);
  const [tab, setTab] = useState<PrTab>("overview");
  const { layout } = useTabLayout();
  const backBtn = useRef<HTMLButtonElement>(null);
  const key = `${forge}|${item.repo}|${item.number}`;
  const detail = usePrLoad(back.detail, true, key);
  const meta = usePrLoad(back.meta, true, key);
  const conv = usePrLoad(back.conversation, tab === "conversation" || tab === "files", key);
  const files = usePrLoad(back.files, tab === "files", key);
  const refresh = () => (detail.reload(), meta.reload());

  // Keyboard and screen-reader users land inside the view, not on the list it covers.
  useEffect(() => backBtn.current?.focus(), []);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !/INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement).tagName)) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const d = detail.data;
  const m = meta.data;
  const photo = useRepoAvatars(forge, [m?.author_avatar ?? ""])(m?.author_avatar ?? "");
  const state = d ? (d.jobs.some((j) => j.state === "failure") ? "failure" : d.jobs.some((j) => j.state === "running") ? "running" : d.jobs.length ? "success" : "none") : null;
  const count = (k: PrTab) =>
    k === "conversation" ? conv.data?.length : k === "pipeline" ? d?.jobs.length : k === "files" ? (files.data?.length ?? d?.changed_files) : k === "reviewers" ? d?.reviewers.length : undefined;
  const tabs: PrTabDef[] = TABS.map((x) => ({ ...x, count: count(x.key) }));
  const vertical = layout === "vertical";
  const shown = stateOf(m);
  const author = m?.author || item.author;

  const panel = (
    <div role="tabpanel" className="min-h-0 min-w-0 flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
      {detail.error && (
        <p role="alert" className="m-0 text-[11px] text-danger">
          {detail.error}
        </p>
      )}
      {!d && !detail.error && <Skeleton label={t("forge.peek.loading")} rows={3} />}
      {d && tab === "overview" && <PrOverview back={back} detail={d} meta={m} login={login} onChanged={refresh} />}
      {d && tab === "conversation" && <PrConversation back={back} conv={conv} />}
      {d && tab === "pipeline" && <PrPipeline back={back} jobs={d.jobs} />}
      {d && tab === "files" && <PrFiles back={back} files={files} conv={conv.data} base={d.base_branch} head={d.head_branch} onThreads={() => setTab("conversation")} />}
      {d && tab === "reviewers" && <PrReviewers back={back} detail={d} item={item} login={login} onDone={detail.reload} />}
    </div>
  );

  return (
    <div role="dialog" aria-modal="true" aria-label={t("forge.pr.label", { kind: back.kind, ref: item.reference })} className="fixed inset-0 z-40 flex flex-col bg-panel">
      <header className="shrink-0 space-y-2 border-b border-edge px-3 pt-2">
        <div className="flex items-start gap-1.5">
          <button ref={backBtn} type="button" onClick={onClose} aria-label={t("forge.pr.back")} title={t("forge.pr.back")} className="canto-hit grid size-7 shrink-0 place-items-center rounded-md text-muted hover:bg-hover hover:text-fg">
            ←
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="m-0 break-words text-sm font-semibold text-fg">{m?.title || item.title}</h2>
            <p className="m-0 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted">
              {shown && <Pill tone={STATE_TONE[shown]}>{t(`forge.pr.state.${shown}` as MessageKey)}</Pill>}
              <span className="font-mono">{item.reference}</span>
              {d && <span className="font-mono">{t("forge.peek.branches", { head: d.head_branch, base: d.base_branch })}</span>}
              {author && (
                <span className="inline-flex items-center gap-1 font-semibold text-fg">
                  <Avatar src={photo} name={author} size="size-4" />@{author}
                </span>
              )}
              {state && <CiPill status={state} />}
            </p>
          </div>
          <button type="button" onClick={() => void api.openLink(item.url).catch(() => {})} aria-label={t("forge.pr.openWeb", { host: back.host })} title={t("forge.pr.openWeb", { host: back.host })} className="canto-hit grid size-7 shrink-0 place-items-center rounded-md text-muted hover:bg-hover hover:text-fg">
            ↗
          </button>
        </div>
        {m && <PrActions back={back} meta={m} checks={state ?? "none"} onDone={refresh} />}
        {!vertical && <PrTabBar tabs={tabs} tab={tab} onChange={setTab} />}
        {vertical && <div className="pb-2" />}
      </header>
      {vertical ? (
        <div className="flex min-h-0 flex-1">
          <PrTabRail tabs={tabs} tab={tab} onChange={setTab} />
          {panel}
        </div>
      ) : (
        panel
      )}
    </div>
  );
}
