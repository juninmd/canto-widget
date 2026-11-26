import { useState } from "react";
import { errText } from "../../lib/api";
import { t } from "../../i18n";
import type { PrBackend } from "./prApi";

/** A general comment on the PR/MR; the text is kept if the send fails. */
export default function PrCompose({ back, onDone }: { back: PrBackend; onDone: () => void }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState("");

  async function send() {
    setBusy(true);
    setFailed("");
    setSent(false);
    try {
      await back.review("comment", text.trim());
      setSent(true);
      setText("");
      onDone();
    } catch (e) {
      setFailed(errText(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <textarea value={text} maxLength={2000} rows={6} onChange={(e) => setText(e.target.value)} aria-label={t("forge.peek.commentLabel")} placeholder={t("forge.peek.commentPlaceholder")} className="canto-field w-full resize-y px-2 py-1.5 text-xs" />
      <div className="flex items-center gap-2">
        <button type="button" disabled={busy || text.trim() === ""} onClick={() => void send()} className="canto-hit min-h-[28px] rounded-md border border-accent bg-accent px-3 text-xs font-semibold text-on-accent disabled:opacity-60">
          {t("forge.peek.comment")}
        </button>
        <span className="ml-auto font-mono text-[10.5px] tabular-nums text-faint">{text.length}/2000</span>
      </div>
      {sent && (
        <p role="status" className="m-0 text-[11px] text-ok">
          {t("forge.peek.commented")}
        </p>
      )}
      {failed && (
        <p role="alert" className="m-0 text-[11px] text-danger">
          {failed}
        </p>
      )}
    </div>
  );
}
