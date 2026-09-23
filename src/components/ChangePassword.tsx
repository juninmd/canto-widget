import { useState } from "react";
import { api, errText } from "../lib/api";
import { useToast } from "../lib/toast";
import { t } from "../i18n";

const FIELD = "rounded-lg border border-line bg-ink px-3 py-2 text-sm text-fg outline-none focus:border-accent";

/** Collapsed by default: it's a rare action and shouldn't compete for attention with the rest of settings. */
export default function ChangePassword({ onChanged }: { onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const notify = useToast();

  function close() {
    setOpen(false);
    setCurrent("");
    setNext("");
    setConfirm("");
    setError("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (next !== confirm) return setError(t("settings.password.mismatch"));
    setBusy(true);
    try {
      const biometricsDisabled = await api.changePassword(current, next);
      notify({
        message: biometricsDisabled
          ? t("settings.password.changedBiometricOff")
          : t("settings.password.changed"),
      });
      close();
      onChanged();
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="self-start rounded-lg bg-edge px-3 py-1.5 text-xs text-fg">
        {t("settings.password.open")}
      </button>
    );
  }

  const inputType = show ? "text" : "password";
  return (
    <form onSubmit={submit} className="flex flex-col gap-2" aria-label={t("settings.password.open")}>
      <input autoFocus type={inputType} aria-label={t("settings.password.current")} placeholder={t("settings.password.current")} value={current} onChange={(e) => setCurrent(e.target.value)} className={FIELD} />
      <input type={inputType} aria-label={t("settings.password.new")} placeholder={t("settings.password.new")} value={next} onChange={(e) => setNext(e.target.value)} className={FIELD} />
      <input type={inputType} aria-label={t("settings.password.confirm")} placeholder={t("settings.password.confirm")} value={confirm} onChange={(e) => setConfirm(e.target.value)} className={FIELD} />
      <label className="flex min-h-6 items-center gap-2 text-xs text-muted">
        <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="size-4 accent-[var(--color-accent)]" />
        {t("settings.password.show")}
        <span className="ml-auto text-faint">{t("lock.minLength")}</span>
      </label>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
      <p className="text-[11px] text-faint">
        {t("settings.password.backupsNote")}
      </p>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy || !current || !next}
          className="flex-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-on-accent disabled:opacity-40"
        >
          {busy ? t("settings.password.submitting") : t("settings.password.submit")}
        </button>
        <button type="button" onClick={close} disabled={busy} className="rounded-lg bg-edge px-3 py-1.5 text-xs text-fg">
          {t("settings.password.cancel")}
        </button>
      </div>
    </form>
  );
}
