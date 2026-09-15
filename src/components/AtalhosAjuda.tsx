import { useEffect, useRef } from "react";
import { GRUPOS_ATALHOS } from "../lib/atalhos";

/** Tecla como bloco com altura própria: kbd inline com padding vazava da linha e era recortado. */
function Teclas({ teclas }: { teclas: string[] }) {
  return (
    <span className="flex shrink-0 items-center gap-1" aria-label={teclas.join(" + ")}>
      {teclas.map((t, i) => (
        <span key={t} className="flex items-center gap-1" aria-hidden="true">
          {i > 0 && <span className="text-[11px] text-faint">+</span>}
          <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-b-2 border-line bg-ink px-1.5 font-sans text-[11px] leading-none text-fg">
            {t}
          </kbd>
        </span>
      ))}
    </span>
  );
}

export default function AtalhosAjuda({ onFechar }: { onFechar: () => void }) {
  const fechar = useRef<HTMLButtonElement>(null);
  const anterior = useRef<Element | null>(null);

  useEffect(() => {
    anterior.current = document.activeElement;
    fechar.current?.focus();
    // Devolve o foco para onde o usuario estava: sair da ajuda nao pode jogar o teclado no topo.
    return () => (anterior.current as HTMLElement | null)?.focus?.();
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="atalhos-titulo"
      aria-describedby="atalhos-dica"
      onKeyDown={(e) => {
        // Unico controle focavel: Tab nao pode sair do modal para o app escondido atras.
        if (e.key === "Tab") {
          e.preventDefault();
          fechar.current?.focus();
        }
        if (e.key === "Escape" || e.key === "?") {
          e.stopPropagation();
          onFechar();
        }
      }}
      className="absolute inset-0 z-40 flex flex-col gap-3 rounded-2xl bg-panel p-4 text-fg motion-safe:animate-surgir motion-reduce:animate-fade"
    >
      <header>
        <h2 id="atalhos-titulo" className="text-sm font-semibold">
          Atalhos de teclado
        </h2>
        <p id="atalhos-dica" className="mt-0.5 text-[11px] text-muted">
          Letras soltas não valem enquanto você digita num campo.
        </p>
      </header>

      <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1">
        {GRUPOS_ATALHOS.map((g) => (
          <section key={g.titulo} className="mb-3 last:mb-0">
            <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-faint">{g.titulo}</h3>
            <ul className="divide-y divide-edge rounded-lg border border-edge bg-ink/40">
              {g.itens.map((a) => (
                <li key={a.descricao} className="flex items-center justify-between gap-3 px-2.5 py-2">
                  <span className="min-w-0 text-xs text-muted">{a.descricao}</span>
                  <Teclas teclas={a.teclas} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <button ref={fechar} type="button" onClick={onFechar} title="Esc" className="rounded-lg bg-edge px-3 py-1.5 text-sm text-fg">
        fechar
      </button>
    </div>
  );
}
