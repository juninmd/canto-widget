import { useId, useRef, useState } from "react";
import { api, errText } from "../lib/api";
import { useToast } from "../lib/toast";
import { t } from "../i18n";

const FIELD = "canto-field px-3 py-2 text-sm aria-invalid:border-danger";
/** Same floor as `vault::MIN_PASSWORD_LEN`: checked here only to answer before the round trip. */
const MIN_LENGTH = 4;

/** Collapsed by default: it's a rare action and shouldn't compete for attention with the rest of settings. */
export default function ChangePassword({ onChanged }: { onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [invalid, setInvalid] = useState<"" | "current" | "next" | "confirm">("");
  const [caps, setCaps] = useState(false);
  const notify = useToast();
  const opener = useRef<HTMLButtonElement>(null);
  const errorId = useId();
  const fields = { current: useRef<HTMLInputElement>(null), next: useRef<HTMLInputElement>(null), confirm: useRef<HTMLInputElement>(null) };

  function close() {
    setOpen(false);
    setCurrent("");
    setNext("");
    setConfirm("");
    setError("");
    setInvalid("");
    setCaps(false);
    // The form unmounts with focus inside it: hand focus back to the button that opened it.
    requestAnimationFrame(() => opener.current?.focus());
  }

  function reject(field: "current" | "next" | "confirm", message: string) {
    setError(message);
    setInvalid(field);
    fields[field].current?.focus();
    fields[field].current?.select();
  }

  // Caps Lock turns a correct password into a "wrong" one without any visible clue.
  function trackCaps(e: React.KeyboardEvent<HTMLInputElement>) {
    if (typeof e.getModifierState === "function") setCaps(e.getModifierState("CapsLock"));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInvalid("");
    if ([...next].length < MIN_LENGTH) return reject("next", t("lock.minLength"));
    if (next === current) return reject("next", t("settings.password.same"));
    if (next !== confirm) return reject("confirm", t("settings.password.mismatch"));
    setBusy(true);
    try {
      const changed = await api.changePassword(current, next);
      const done = changed.biometricDisabled
        ? t("settings.password.changedBiometricOff")
        : t("settings.password.changed");
      notify({ message: changed.pending ? `${done}; ${t("settings.password.pending")}` : done });
      close();
      onChanged();
    } catch (e) {
      reject("current", errText(e));
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button ref={opener} type="button" onClick={() => setOpen(true)} className="self-start rounded-lg bg-edge px-3 py-1.5 text-xs text-fg">
        {t("settings.password.open")}
      </button>
    );
  }

  const field = (label: string, autoComplete: string) => ({
    type: show ? "text" : "password",
    autoComplete,
    spellCheck: false,
    "aria-label": label,
    "aria-describedby": error ? errorId : undefined,
    placeholder: label,
    onKeyDown: trackCaps,
    onKeyUp: trackCaps,
    onBlur: () => setCaps(false),
    // Typing again is the fix: the red border would only nag.
    onInput: () => setInvalid(""),
    className: FIELD,
  });

  return (
    <form
      onSubmit={submit}
      onKeyDown={(e) => {
        if (e.key === "Escape" && !busy) {
          e.stopPropagation();
          close();
        }
      }}
      className="flex flex-col gap-2"
      aria-label={t("settings.password.open")}
    >
      <input autoFocus ref={fields.current} {...field(t("settings.password.current"), "current-password")} aria-invalid={invalid === "current" || undefined} value={current} onChange={(e) => setCurrent(e.target.value)} />
      <input ref={fields.next} {...field(t("settings.password.new"), "new-password")} aria-invalid={invalid === "next" || undefined} value={next} onChange={(e) => setNext(e.target.value)} />
      <input ref={fields.confirm} {...field(t("settings.password.confirm"), "new-password")} aria-invalid={invalid === "confirm" || undefined} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      <label className="flex min-h-[24px] items-center gap-2 text-xs text-muted">
        <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="canto-box" />
        {t("settings.password.show")}
        <span className="ml-auto text-faint">{t("lock.minLength")}</span>
      </label>
      {caps && (
        <p role="status" className="text-xs text-warn">
          {t("settings.password.capsLock")}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-danger">
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
