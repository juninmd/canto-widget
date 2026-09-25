import { useEffect, useState } from "react";
import { api, errText, type BiometricStatus } from "../lib/api";
import { t } from "../i18n";

type Props = { exists: boolean; onOpen: (justCreated?: boolean) => void };

export default function Lock({ exists, onOpen }: Props) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [bio, setBio] = useState<BiometricStatus | null>(null);

  useEffect(() => {
    if (!exists) return;
    void api
      .biometricStatus()
      .then((s) => setBio(s?.available && s.enabled ? s : null))
      .catch(() => setBio(null));
  }, [exists]);

  async function withBiometrics() {
    setError("");
    setBusy(true);
    try {
      await api.biometricUnlock();
      onOpen();
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!exists && password !== confirm) {
      setError(t("lock.mismatch"));
      return;
    }
    setBusy(true);
    try {
      await (exists ? api.unlock(password) : api.create(password));
      setPassword("");
      setConfirm("");
      onOpen(!exists);
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="flex h-full flex-col justify-center gap-3 px-6 motion-safe:animate-surgir motion-reduce:animate-fade"
    >
      <div>
        <h2 className="text-sm font-semibold text-fg">
          {exists ? t("lock.title.locked") : t("lock.title.create")}
        </h2>
        <p className="mt-1 text-xs text-muted">
          {exists
            ? t("lock.hint.locked")
            : t("lock.hint.create")}
        </p>
      </div>
      <input
        autoFocus
        type={showPassword ? "text" : "password"}
        aria-label={t("lock.password")}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t("lock.password")}
        className="rounded-lg border border-line bg-ink px-3 py-2 text-sm text-fg outline-none focus:border-accent"
      />
      {!exists && (
        <input
          type={showPassword ? "text" : "password"}
          aria-label={t("lock.confirm")}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder={t("lock.confirm")}
          className="rounded-lg border border-line bg-ink px-3 py-2 text-sm text-fg outline-none focus:border-accent"
        />
      )}
      <label className="flex min-h-6 items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={showPassword}
          onChange={(e) => setShowPassword(e.target.checked)}
          className="size-4 accent-[var(--color-accent)]"
        />
        {t("lock.showPassword")}
        {!exists && <span className="ml-auto text-faint">{t("lock.minLength")}</span>}
      </label>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
      {bio && (
        <button
          type="button"
          onClick={() => void withBiometrics()}
          disabled={busy}
          className="rounded-lg border border-accent px-3 py-2 text-sm font-semibold text-fg disabled:opacity-40"
        >
          {t("lock.biometric", { name: bio.name })}
        </button>
      )}
      <button
        type="submit"
        disabled={busy || password.length === 0}
        className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-on-accent disabled:opacity-40"
      >
        {busy ? (exists ? t("lock.opening") : t("lock.creating")) : exists ? t("lock.unlock") : t("lock.title.create")}
      </button>
    </form>
  );
}
