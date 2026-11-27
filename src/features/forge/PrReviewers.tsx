import { useState } from "react";
import { errText, type ForgeItem, type PrDetail, type PrReviewAction, type PrReviewer } from "../../lib/api";
import { t, type MessageKey } from "../../i18n";
import type { PrBackend } from "./prApi";
import PersonCard from "./PersonCard";

const BTN = "canto-hit min-h-[26px] rounded-md border border-edge px-2.5 text-[11px] text-muted hover:bg-hover hover:text-fg disabled:opacity-60";
const STATE: Record<PrReviewer["state"], { label: MessageKey; tone: string }> = {
  approved: { label: "forge.peek.state.approved", tone: "text-ok" },
  changes: { label: "forge.peek.state.changes", tone: "text-danger" },
  pending: { label: "forge.peek.state.pending", tone: "text-muted" },
};

/** Who answered, plus the two verdicts a reviewer gives; each one asks again before it writes. */
export default function PrReviewers({ back, detail, item, login, onDone }: { back: PrBackend; detail: PrDetail; item: ForgeItem; login: string; onDone: () => void }) {
  const [who, setWho] = useState<string | null>(null);
  const [ask, setAsk] = useState<PrReviewAction | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<PrReviewAction | null>(null);
  const [failed, setFailed] = useState("");
  const mine = item.author === login;
  const needsText = ask === "request_changes";

  async function send(action: PrReviewAction) {
    setBusy(true);
    setFailed("");
    try {
      await back.review(action, text.trim());
      setSent(action);
      setAsk(null);
      setText("");
      onDone();
    } catch (e) {
      setFailed(errText(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <ul aria-label={t("forge.peek.reviewers")} className="m-0 list-none space-y-1 p-0 text-xs">
        {detail.reviewers.length === 0 && <li className="text-[11px] text-faint">{t("forge.peek.noReviewers")}</li>}
        {detail.reviewers.map((r) => (
          <li key={r.login} className={`flex items-center gap-2 ${STATE[r.state].tone}`}>
            {back.profiles ? (
              <button type="button" aria-pressed={who === r.login} aria-label={t("forge.peek.profileOf", { login: r.login })} onClick={() => setWho(who === r.login ? null : r.login)} className="canto-hit rounded-md hover:text-fg hover:underline">
                @{r.login}
              </button>
            ) : (
              <span>@{r.login}</span>
            )}
            <span className="ml-auto text-[11px]">{t(STATE[r.state].label)}</span>
          </li>
        ))}
      </ul>
      {who && <PersonCard login={who} />}
      <section aria-label={t("forge.pr.yourReview")} className="space-y-2 rounded-xl border border-edge bg-ink/60 p-2.5">
        <h3 className="m-0 text-[10.5px] font-semibold uppercase tracking-wide text-faint">{t("forge.pr.yourReview")}</h3>
        {mine ? (
          <p className="m-0 text-[11px] text-muted">{t("forge.pr.mine", { kind: back.kind })}</p>
        ) : (
          <>
            <textarea value={text} maxLength={2000} rows={2} onChange={(e) => setText(e.target.value)} aria-label={t("forge.pr.reasonLabel")} placeholder={t("forge.pr.reasonPlaceholder")} className="canto-field w-full resize-none px-2 py-1 text-xs" />
            <div className="flex flex-wrap gap-1.5">
              <button type="button" disabled={busy} onClick={() => setAsk("approve")} className={BTN}>
                {t("forge.peek.approve")}
              </button>
              {back.canRequestChanges && (
                <button type="button" disabled={busy} onClick={() => setAsk("request_changes")} className={`${BTN} text-danger`}>
                  {t("forge.pr.requestChanges")}
                </button>
              )}
            </div>
            {ask && (
              <div role="group" aria-label={t("forge.pr.confirmAsk")} className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
                <span>{t(ask === "approve" ? "forge.pr.approveAsk" : "forge.pr.changesAsk", { kind: back.kind, host: back.host })}</span>
                <button type="button" disabled={busy || (needsText && text.trim() === "")} onClick={() => void send(ask)} className={`${BTN} border-accent-text text-accent-text`}>
                  {t(ask === "approve" ? "forge.peek.approveSure" : "forge.pr.changesSure")}
                </button>
                <button type="button" disabled={busy} onClick={() => setAsk(null)} className={BTN}>
                  {t("forge.peek.cancel")}
                </button>
              </div>
            )}
          </>
        )}
        {sent && (
          <p role="status" className="m-0 text-[11px] text-ok">
            {t(sent === "approve" ? "forge.peek.approved" : "forge.pr.changesSent")}
          </p>
        )}
        {failed && (
          <p role="alert" className="m-0 text-[11px] text-danger">
            {failed}
          </p>
        )}
      </section>
    </div>
  );
}
