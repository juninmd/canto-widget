import { useEffect, useState } from "react";
import { api, errText } from "../lib/api";
import BackupSection from "./BackupSection";
import GoogleSection from "./GoogleSection";

export default function AjustesTab({ onError }: { onError: (m: string) => void }) {
  const [autostart, setAutostart] = useState(false);
  const [busy, setBusy] = useState(false);

  async function reload() {
    try {
      setAutostart(await api.autostartStatus());
    } catch (e) {
      onError(errText(e));
    }
  }

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function alternar(enabled: boolean) {
    setBusy(true);
    try {
      await api.autostartSet(enabled);
    } catch (e) {
      onError(errText(e));
    } finally {
      // Recarrega mesmo em falha: a fonte da verdade e o registro do SO, nao a tela.
      await reload();
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto pr-1 text-sm">
      <section className="flex flex-col gap-2">
        <p className="text-[11px] text-faint">
          Atalho global: <span className="text-muted">Ctrl+Alt+Espaço</span> mostra ou esconde o widget.
        </p>
        <label className="flex items-center gap-2 text-[11px] text-muted">
          <input
            type="checkbox"
            checked={autostart}
            disabled={busy}
            onChange={(e) => void alternar(e.target.checked)}
            className="accent-accent"
          />
          abrir o Canto ao ligar o computador (direto na bandeja)
        </label>
      </section>
      <BackupSection onError={onError} />
      <GoogleSection onError={onError} />
    </div>
  );
}
