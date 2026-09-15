import { useEffect, useState } from "react";
import { api, errText } from "../lib/api";

export default function JanelaSection({ onError }: { onError: (m: string) => void }) {
  const [topo, setTopo] = useState(true);
  const [movida, setMovida] = useState(false);

  async function recarregar() {
    try {
      const cfg = await api.janelaConfig();
      if (!cfg) return;
      setTopo(cfg.sempre_no_topo);
      setMovida(!!cfg.posicao || !!cfg.tamanho);
    } catch (e) {
      onError(errText(e));
    }
  }

  useEffect(() => {
    void recarregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function agir(fn: () => Promise<unknown>) {
    try {
      await fn();
    } catch (e) {
      onError(errText(e));
    } finally {
      await recarregar();
    }
  }

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold text-fg">Janela</h3>
      <label className="flex min-h-6 items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={topo}
          onChange={(e) => void agir(() => api.janelaSempreNoTopo(e.target.checked))}
          className="size-4 accent-[var(--color-accent)]"
        />
        sempre na frente das outras janelas
      </label>
      <p className="text-[11px] text-faint">
        Arraste pela barra do topo e redimensione pelas bordas: posição e tamanho ficam salvos.
      </p>
      {movida && (
        <button
          type="button"
          onClick={() => void agir(api.janelaRestaurar)}
          className="self-start rounded-lg bg-edge px-3 py-1.5 text-xs text-fg"
        >
          voltar ao canto e ao tamanho original
        </button>
      )}
    </section>
  );
}
