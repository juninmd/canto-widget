import { useEffect, useState } from "react";
import { api, errText, type ForgeItem, type PrDetail, type PrReviewer } from "../../lib/api";
import { t } from "../../i18n";
import Skeleton from "../../components/Skeleton";
import { CiPill } from "./ForgePills";
import PersonCard from "./PersonCard";

type Props = { item: ForgeItem; login: string; onClose: () => void };
type Sent = "approve" | "comment";

const BTN = "canto-hit min-h-[24px] rounded-md border border-edge px-2 text-[11px] text-muted hover:bg-hover hover:text-fg disabled:opacity-60";
const STATE: Record<PrReviewer["state"], { label: "forge.peek.state.approved" | "forge.peek.state.changes" | "forge.peek.state.pending"; tone: string }> = {
  approved: { label: "forge.peek.state.approved", tone: "text-ok" },
  changes: { label: "forge.peek.state.changes", tone: "text-danger" },
  pending: { label: "forge.peek.state.pending", tone: "text-muted" },
};

/** A GitHub PR at a glance: description, the jobs of its CI and its reviewers, with the two writes a reviewer does most. */
export default function PrPeek({ item, login, onClose }: Props) {
  const [detail, setDetail] = useState<PrDetail | null>(null);
  const [error, setError] = useState("");
  const [sure, setSure] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<Sent | null>(null);
  const [failed, setFailed] = useState("");
  const [who, setWho] = useState<string | null>(null);
  const person = (login: string, label: string) =>
    login.endsWith("[bot]") ? (
      <span>{label}</span>
    ) : (
      <button type="button" aria-pressed={who === login} aria-label={t("forge.peek.profileOf", { login })} onClick={() => setWho(who === login ? null : login)} className="canto-hit rounded-md hover:text-fg hover:underline">
        {label}
      </button>
    );

  useEffect(() => {
    let live = true;
    setDetail(null);
    setError("");
    setSent(null);
    setSure(false);
    api.githubPrDetail(item.repo, item.number).then(
      (d) => live && setDetail(d),
      (e) => live && setError(errText(e)),
    );
    return () => {
      live = false;
    };
  }, [item.repo, item.number]);

  async function send(action: Sent) {
    setBusy(true);
    setFailed("");
    try {
      await api.githubPrReview(item.repo, item.number, action, text.trim());
      setSent(action);
      setSure(false);
      setText("");
    } catch (e) {
      setFailed(errText(e));
    } finally {
      setBusy(false);
    }
  }

  const mine = item.author === login;
  return (
    <section aria-label={t("forge.peek.label")} className="max-h-[48%] shrink-0 space-y-2 overflow-y-auto rounded-xl border border-edge bg-ink/60 p-2.5">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="m-0 break-words text-sm font-semibold text-fg">{item.title}</h3>
          <p className="m-0 truncate text-[11px] text-muted">
            {item.reference}
            {detail && ` · ${t("forge.peek.branches", { head: detail.head_branch, base: detail.base_branch })} · ${t("forge.peek.files", { n: detail.changed_files })}`}
          </p>
          {item.author && <p className="m-0 text-[11px] text-muted">{t("forge.peek.by")} {person(item.author, `@${item.author}`)}</p>}
        </div>
        <button type="button" onClick={onClose} aria-label={t("forge.peek.close")} title={t("forge.peek.close")} className="canto-hit grid size-6 shrink-0 place-items-center rounded-md text-faint hover:text-fg">
          ✕
        </button>
      </div>
      {!detail && !error && <Skeleton label={t("forge.peek.loading")} rows={2} />}
      {error && (
        <p role="alert" className="m-0 text-[11px] text-danger">
          {error}
        </p>
      )}
      {detail && (
        <>
          <p className={`m-0 whitespace-pre-wrap break-words text-xs ${detail.body ? "text-muted" : "text-faint"}`}>{detail.body || t("forge.peek.noBody")}</p>
          <ul aria-label={t("forge.peek.jobs")} className="m-0 list-none space-y-1 p-0">
            {detail.jobs.length === 0 && <li className="text-[11px] text-faint">{t("forge.peek.noJobs")}</li>}
            {detail.jobs.map((j) => (
              <li key={`${j.name}|${j.url}`} className="flex items-center justify-between gap-2 text-[11px]">
                <span className="min-w-0 truncate font-mono text-muted">{j.name}</span>
                <CiPill status={j.state} />
              </li>
            ))}
          </ul>
          <ul aria-label={t("forge.peek.reviewers")} className="m-0 flex list-none flex-wrap gap-x-3 gap-y-1 p-0 text-[11px]">
            {detail.reviewers.length === 0 && <li className="text-faint">{t("forge.peek.noReviewers")}</li>}
            {detail.reviewers.map((r) => (
              <li key={r.login} className={STATE[r.state].tone}>
                {person(r.login, `@${r.login} · ${t(STATE[r.state].label)}`)}
              </li>
            ))}
          </ul>
          {who && <PersonCard login={who} />}
          <div className="flex gap-1.5">
            <textarea
              value={text}
              maxLength={2000}
              rows={2}
              onChange={(e) => setText(e.target.value)}
              aria-label={t("forge.peek.commentLabel")}
              placeholder={t("forge.peek.commentPlaceholder")}
              className="canto-field min-w-0 flex-1 resize-none px-2 py-1 text-xs"
            />
            <div className="flex flex-col gap-1">
              <button type="button" disabled={busy || text.trim() === ""} onClick={() => void send("comment")} className={BTN}>
                {t("forge.peek.comment")}
              </button>
              {!mine && !sure && (
                <button type="button" disabled={busy} onClick={() => setSure(true)} className={BTN}>
                  {t("forge.peek.approve")}
                </button>
              )}
            </div>
          </div>
          {sure && (
            <div role="group" aria-label={t("forge.peek.approveSure")} className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
              <span>{t("forge.peek.approveAsk")}</span>
              <button type="button" disabled={busy} onClick={() => void send("approve")} className={`${BTN} border-accent-text text-accent-text`}>
                {t("forge.peek.approveSure")}
              </button>
              <button type="button" disabled={busy} onClick={() => setSure(false)} className={BTN}>
                {t("forge.peek.cancel")}
              </button>
            </div>
          )}
          {sent && (
            <p role="status" className="m-0 text-[11px] text-ok">
              {t(sent === "approve" ? "forge.peek.approved" : "forge.peek.commented")}
            </p>
          )}
          {failed && (
            <p role="alert" className="m-0 text-[11px] text-danger">
              {failed}
            </p>
          )}
        </>
      )}
    </section>
  );
}
