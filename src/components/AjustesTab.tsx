import { useEffect, useState } from "react";
import { api, errText } from "../lib/api";
import BackupSection from "./BackupSection";
import GoogleSection from "./GoogleSection";
import JanelaSection from "./JanelaSection";
import SegurancaSection from "./SegurancaSection";

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
        <p className="text-xs text-muted">
          Atalho global: <span className="text-muted">Ctrl+Alt+Espaço</span> mostra ou esconde o widget. Tecle{" "}
          <kbd className="rounded border border-line px-1 text-[11px]">?</kbd> para ver todos os atalhos.
        </p>
        <label className="flex min-h-6 items-center gap-2 text-xs text-muted">
          <input
            type="checkbox"
            checked={autostart}
            disabled={busy}
            onChange={(e) => void alternar(e.target.checked)}
            className="size-4 accent-[var(--color-accent)]"
          />
          abrir o Canto ao ligar o computador (direto na bandeja)
        </label>
      </section>
      <SegurancaSection onError={onError} />
      <JanelaSection onError={onError} />
      <BackupSection onError={onError} />
      <GoogleSection onError={onError} />
    </div>
  );
}
