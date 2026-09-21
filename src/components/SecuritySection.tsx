import { useEffect, useState } from "react";
import { api, errText, type BiometricStatus, type UnlockEntry } from "../lib/api";
import { AUTOLOCK_OPTIONS } from "../lib/autolock";
import { timeAgo } from "../lib/time";
import { useToast } from "../lib/toast";
import ChangePassword from "./ChangePassword";

const METHOD_LABEL: Record<UnlockEntry["method"], string> = {
  password: "senha",
  windows_hello: "Windows Hello",
  touch_id: "Touch ID",
};

/** Master password change, auto-lock timeout, unlock history and, where the system offers it, biometric unlock. */
export default function SecuritySection({ onError }: { onError: (m: string) => void }) {
  const [bio, setBio] = useState<BiometricStatus | null>(null);
  const [autolock, setAutolock] = useState<number | null>(null);
  const [history, setHistory] = useState<UnlockEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const notify = useToast();

  const reload = () =>
    api
      .biometricStatus()
      .then(setBio)
      .catch(() => setBio(null));

  useEffect(() => {
    void reload();
    api.autolockGet().then(setAutolock).catch(() => setAutolock(null));
    api
      .unlockHistory()
      .then((h) => setHistory(h ?? []))
      .catch(() => setHistory([]));
  }, []);

  async function changeAutolock(minutes: number) {
    setAutolock(minutes);
    try {
      await api.autolockSet(minutes);
    } catch (e) {
      onError(errText(e));
      await api.autolockGet().then(setAutolock).catch(() => {});
    }
  }

  async function toggle(enable: boolean) {
    setBusy(true);
    try {
      await (enable ? api.biometricEnable() : api.biometricDisable());
      notify({ message: enable ? `${bio!.name} ativado para destrancar o cofre` : `${bio!.name} desativado` });
    } catch (e) {
      onError(errText(e));
    } finally {
      await reload();
      setBusy(false);
    }
  }

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold text-fg">Segurança</h3>
      <ChangePassword onChanged={() => void reload()} />
      {autolock !== null && (
        <label className="flex min-h-6 items-center gap-2 text-xs text-muted">
          trancar sozinho após
          <select
            value={autolock}
            onChange={(e) => void changeAutolock(Number(e.target.value))}
            className="rounded border border-line bg-transparent px-1.5 py-0.5 text-xs text-fg"
          >
            {AUTOLOCK_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m} min sem uso
              </option>
            ))}
          </select>
        </label>
      )}
      {bio?.available && (
        <>
          <label className="flex min-h-6 items-center gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={bio.enabled}
              disabled={busy}
              onChange={(e) => void toggle(e.target.checked)}
              className="size-4 accent-[var(--color-accent)]"
            />
            destrancar com {bio.name}
          </label>
          <p className="text-[11px] text-faint">
            A senha mestra fica cifrada por uma chave presa ao chip de segurança deste computador. Ao ativar, o Windows
            pede a confirmação duas vezes: a segunda prova que o desbloqueio funciona. A senha continua valendo e é o
            único jeito de abrir um backup em outra máquina.
          </p>
        </>
      )}
      {history.length > 0 && (
        <details className="text-xs text-muted">
          <summary className="cursor-pointer">últimos desbloqueios</summary>
          <ul className="mt-1 flex flex-col gap-0.5 text-[11px] text-faint">
            {[...history]
              .reverse()
              .slice(0, 10)
              .map((e, i) => (
                <li key={`${e.at}-${i}`} title={new Date(e.at).toLocaleString("pt-BR")}>
                  {METHOD_LABEL[e.method] ?? e.method} — {timeAgo(e.at)}
                </li>
              ))}
          </ul>
        </details>
      )}
    </section>
  );
}
