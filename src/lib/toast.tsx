import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { duracaoSaida } from "./movimento";

export type Aviso = {
  texto: string;
  tipo?: "info" | "erro";
  acao?: { rotulo: string; executar: () => void };
};

type AvisoAtivo = Aviso & { id: number };

const MAX_VISIVEIS = 3;
export const DURACAO_INFO_MS = 6000;

const Contexto = createContext<((a: Aviso) => void) | null>(null);

export function useToast(): (a: Aviso) => void {
  const avisar = useContext(Contexto);
  if (!avisar) throw new Error("useToast fora do ToastProvider");
  return avisar;
}

export function ToastProvider({ children, duracaoMs = DURACAO_INFO_MS }: { children: ReactNode; duracaoMs?: number }) {
  const [avisos, setAvisos] = useState<AvisoAtivo[]>([]);
  const proximoId = useRef(1);

  const fechar = useCallback((id: number) => setAvisos((l) => l.filter((a) => a.id !== id)), []);

  const avisar = useCallback((a: Aviso) => {
    setAvisos((l) => {
      // Polling que falha sempre igual (clipboard a cada 2.5s) nao pode empilhar o mesmo aviso.
      if (!a.acao && l.some((x) => !x.acao && x.texto === a.texto && x.tipo === a.tipo)) return l;
      return [...l, { ...a, id: proximoId.current++ }].slice(-MAX_VISIVEIS);
    });
  }, []);

  return (
    <Contexto.Provider value={avisar}>
      {children}
      <div className="pointer-events-none absolute inset-x-3 bottom-3 z-40 flex flex-col gap-2">
        {/* Regioes separadas: erro interrompe o leitor de tela, o resto espera a vez. */}
        <div role="alert" className="flex flex-col gap-2">
          {avisos.filter((a) => a.tipo === "erro").map((a) => (
            <Toast key={a.id} aviso={a} fechar={fechar} duracaoMs={null} />
          ))}
        </div>
        <div role="status" className="flex flex-col gap-2">
          {avisos.filter((a) => a.tipo !== "erro").map((a) => (
            <Toast key={a.id} aviso={a} fechar={fechar} duracaoMs={duracaoMs} />
          ))}
        </div>
      </div>
    </Contexto.Provider>
  );
}

/** `duracaoMs` nulo: erro fica até ser fechado, para dar tempo de ler (NN/g). */
function Toast({ aviso, fechar, duracaoMs }: { aviso: AvisoAtivo; fechar: (id: number) => void; duracaoMs: number | null }) {
  const [pausado, setPausado] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const { id } = aviso;

  // Sai animando e so entao desmonta; com menos movimento pedido, some na hora.
  const encerrar = useCallback(() => {
    const ms = duracaoSaida();
    if (!ms) return fechar(id);
    setSaindo(true);
    setTimeout(() => fechar(id), ms);
  }, [fechar, id]);

  // Pausa com mouse ou foco em cima: prazo ajustável (WCAG 2.2.1).
  useEffect(() => {
    if (duracaoMs === null || pausado) return;
    // Dependencias estaveis: um aviso novo chegando nao reinicia o prazo dos outros.
    const t = setTimeout(encerrar, duracaoMs);
    return () => clearTimeout(t);
  }, [duracaoMs, pausado, encerrar]);

  const erro = aviso.tipo === "erro";
  return (
    <div
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
      className={`pointer-events-auto flex items-center gap-2 rounded-lg border bg-ink px-3 py-1.5 text-xs text-fg shadow-lg ${
        erro ? "border-danger" : "border-line"
      } ${saindo ? "pointer-events-none motion-safe:animate-baixar" : "motion-safe:animate-entrar motion-reduce:animate-fade"}`}
    >
      <span className={`min-w-0 flex-1 break-words ${erro ? "text-danger" : ""}`}>{aviso.texto}</span>
      {aviso.acao && (
        <button
          type="button"
          onClick={() => {
            aviso.acao!.executar();
            encerrar();
          }}
          className="min-h-6 shrink-0 rounded px-2 font-semibold text-accent hover:bg-edge"
        >
          {aviso.acao.rotulo}
        </button>
      )}
      <button
        type="button"
        onClick={encerrar}
        aria-label="fechar aviso"
        className="grid size-6 shrink-0 place-items-center rounded text-muted hover:text-fg"
      >
        ×
      </button>
    </div>
  );
}
