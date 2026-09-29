import { useState } from "react";
import { api, errText, type ModelsView } from "../lib/api";
import { t } from "../i18n";

const FIELD = "rounded-lg border border-line bg-ink px-3 py-2 text-sm text-fg outline-none focus:border-accent";
export const SITE = "https://artificialanalysis.ai/";

/** Empty state: the key goes straight to Rust, which checks it against the API before sealing it. */
export default function ModelsConnect({ onConnected }: { onConnected: (view: ModelsView) => void }) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const view = await api.modelsSetKey(key);
      setKey("");
      onConnected(view);
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-2 text-xs text-muted">
      <p className="text-fg">{t("models.intro")}</p>
      <p>
        {t("models.howTo")}{" "}
        <button type="button" onClick={() => void api.openLink(SITE).catch(() => {})} className="underline decoration-dotted hover:text-fg">
          artificialanalysis.ai
        </button>
      </p>
      <label htmlFor="models-key" className="text-fg">
        {t("models.keyLabel")}
      </label>
      <input
        id="models-key"
        type="password"
        autoComplete="off"
        spellCheck={false}
        value={key}
        onChange={(e) => setKey(e.target.value)}
        className={FIELD}
      />
      <button type="submit" disabled={busy || !key.trim()} className="min-h-7 self-start rounded-lg bg-edge px-3 text-fg disabled:opacity-40">
        {busy ? t("models.saving") : t("models.save")}
      </button>
      {error && (
        <p role="alert" className="text-danger">
          {error}
        </p>
      )}
    </form>
  );
}
