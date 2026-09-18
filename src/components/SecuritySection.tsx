import { useEffect, useState } from "react";
import { api, errText, type BiometricStatus } from "../lib/api";
import { useToast } from "../lib/toast";
import ChangePassword from "./ChangePassword";

/** Master password change and, where the system offers it, biometric unlock. */
export default function SecuritySection({ onError }: { onError: (m: string) => void }) {
  const [bio, setBio] = useState<BiometricStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const notify = useToast();

  const reload = () =>
    api
      .biometricStatus()
      .then(setBio)
      .catch(() => setBio(null));

  useEffect(() => {
    void reload();
  }, []);

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
    </section>
  );
}
