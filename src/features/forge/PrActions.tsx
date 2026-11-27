import { useState } from "react";
import { errText, type PrAction, type PrMergeMethod, type PrMeta } from "../../lib/api";
import { t, type MessageKey } from "../../i18n";
import ConfirmButton from "../../components/ConfirmButton";
import type { PrBackend } from "./prApi";

const BTN = "canto-hit inline-flex min-h-[28px] items-center gap-1 rounded-lg border border-edge px-2.5 text-xs text-muted hover:bg-hover hover:text-fg disabled:opacity-50";
const METHODS: PrMergeMethod[] = ["squash", "merge", "rebase"];

/** Merge, close or reopen, and draft/ready: the merge and the close ask again, the rest can be taken back. */
export default function PrActions({ back, meta, checks, onDone }: { back: PrBackend; meta: PrMeta; checks: "success" | "failure" | "running" | "none"; onDone: () => void }) {
  const methods = METHODS.filter((m) => meta.merge_methods.includes(m));
  const [method, setMethod] = useState<PrMergeMethod>(methods[0] ?? "merge");
  const [auto, setAuto] = useState(false);
  const [busy, setBusy] = useState(false);
  const [said, setSaid] = useState<MessageKey | null>(null);
  const [failed, setFailed] = useState("");
  const chosen = methods.includes(method) ? method : (methods[0] ?? "merge");

  async function run(action: PrAction, done: MessageKey) {
    setBusy(true);
    setFailed("");
    setSaid(null);
    try {
      await back.act(action);
      setSaid(done);
      onDone();
    } catch (e) {
      setFailed(errText(e));
    } finally {
      setBusy(false);
    }
  }

  const blocked = meta.draft ? t("forge.pr.cantMerge.draft") : meta.conflict ? t("forge.pr.cantMerge.conflict") : "";
  const kind = back.kind;
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-1.5">
        {meta.state === "merged" && <span className="text-[11px] text-muted">{t("forge.pr.state.merged")}</span>}
        {meta.state === "closed" && (
          <button type="button" disabled={busy} onClick={() => void run({ kind: "reopen" }, "forge.pr.did.reopen")} className={BTN}>
            {t("forge.pr.reopen")}
          </button>
        )}
        {meta.state === "open" && (
          <>
            {meta.draft ? (
              <button type="button" disabled={busy} onClick={() => void run({ kind: "draft", on: false }, "forge.pr.did.ready")} className={`${BTN} border-accent bg-accent text-on-accent hover:bg-accent hover:text-on-accent`}>
                {t("forge.pr.toReady")}
              </button>
            ) : (
              <>
                <ConfirmButton ask={t("forge.pr.mergeAsk", { kind, method: t(`forge.pr.method.${chosen}` as MessageKey) })} yes={t("forge.pr.mergeYes")} disabled={busy || blocked !== ""} ariaLabel={blocked || t("forge.pr.merge")} onConfirm={() => void run({ kind: "merge", method: chosen, auto: back.autoMerge && auto }, "forge.pr.did.merge")} className={`${BTN} border-accent bg-accent font-semibold text-on-accent hover:bg-accent hover:text-on-accent`}>
                  {t("forge.pr.merge")}
                </ConfirmButton>
                {methods.length > 1 && (
                  <select value={chosen} aria-label={t("forge.pr.methodLabel")} onChange={(e) => setMethod(e.target.value as PrMergeMethod)} className="canto-field min-h-[28px] px-1.5 text-xs">
                    {methods.map((m) => (
                      <option key={m} value={m}>
                        {t(`forge.pr.method.${m}` as MessageKey)}
                      </option>
                    ))}
                  </select>
                )}
                <button type="button" disabled={busy} onClick={() => void run({ kind: "draft", on: true }, "forge.pr.did.draft")} className={BTN}>
                  {t("forge.pr.toDraft")}
                </button>
              </>
            )}
            <ConfirmButton ask={t("forge.pr.closeAsk", { kind })} yes={t("forge.pr.closeYes")} disabled={busy} ariaLabel={t("forge.pr.close", { kind })} onConfirm={() => void run({ kind: "close" }, "forge.pr.did.close")} className={`${BTN} text-danger`}>
              {t("forge.pr.close", { kind })}
            </ConfirmButton>
          </>
        )}
      </div>
      {meta.state === "open" && !meta.draft && back.autoMerge && checks === "running" && (
        <label className="flex items-center gap-1.5 text-[11px] text-muted">
          <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} />
          {t("forge.pr.autoMerge")}
        </label>
      )}
      {blocked && meta.state === "open" && <p className="m-0 text-[11px] text-warn">{blocked}</p>}
      {said && (
        <p role="status" className="m-0 text-[11px] text-ok">
          {t(said)}
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
