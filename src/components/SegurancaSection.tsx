import { useEffect, useState } from "react";
import { api, errText, type StatusBiometria } from "../lib/api";
import { useToast } from "../lib/toast";

/** Desbloqueio por biometria: some da tela onde o sistema não oferece. */
export default function SegurancaSection({ onError }: { onError: (m: string) => void }) {
  const [bio, setBio] = useState<StatusBiometria | null>(null);
  const [busy, setBusy] = useState(false);
  const avisar = useToast();

  const recarregar = () =>
    api
      .biometriaStatus()
      .then(setBio)
      .catch(() => setBio(null));

  useEffect(() => {
    void recarregar();
  }, []);

  if (!bio?.disponivel) return null;

  async function alternar(ativar: boolean) {
    setBusy(true);
    try {
      await (ativar ? api.biometriaAtivar() : api.biometriaDesativar());
      avisar({ texto: ativar ? `${bio!.nome} ativado para destrancar o cofre` : `${bio!.nome} desativado` });
    } catch (e) {
      onError(errText(e));
    } finally {
      await recarregar();
      setBusy(false);
    }
  }

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold text-fg">Segurança</h3>
      <label className="flex min-h-6 items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={bio.ativa}
          disabled={busy}
          onChange={(e) => void alternar(e.target.checked)}
          className="size-4 accent-[var(--color-accent)]"
        />
        destrancar com {bio.nome}
      </label>
      <p className="text-[11px] text-faint">
        A senha mestra fica cifrada por uma chave presa ao chip de segurança deste computador. Ao ativar, o Windows
        pede a confirmação duas vezes: a segunda prova que o desbloqueio funciona. A senha continua valendo e é o
        único jeito de abrir um backup em outra máquina.
      </p>
    </section>
  );
}
