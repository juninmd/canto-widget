import { useCallback, useRef, useState } from "react";

/** Saída 50ms mais curta que a entrada de 200ms (NN/g). */
export const SAIDA_MS = 150;

/** 0 quando o sistema pede menos movimento ou não informa: o item sai na hora (WCAG 2.3.3). */
export function duracaoSaida(): number {
  const pode = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: no-preference)").matches;
  return pode ? SAIDA_MS : 0;
}

/**
 * Segura o item na tela durante a animação de saída antes de executar a remoção.
 * Clique repetido no mesmo item durante a saída não dispara a remoção duas vezes.
 */
export function useSaida() {
  const [saindo, setSaindo] = useState<ReadonlySet<string>>(new Set());
  const emCurso = useRef(new Set<string>());

  const sair = useCallback(async (id: string, remover: () => Promise<unknown>) => {
    if (emCurso.current.has(id)) return;
    emCurso.current.add(id);
    const ms = duracaoSaida();
    try {
      if (ms) {
        setSaindo((s) => new Set(s).add(id));
        await new Promise((r) => setTimeout(r, ms));
      }
      await remover();
    } finally {
      emCurso.current.delete(id);
      setSaindo((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
    }
  }, []);

  return { saindo, sair };
}

/**
 * Ids que surgiram depois da primeira carga de um contexto (dia, busca). Animar a lista
 * inteira a cada troca de aba, de dia ou de busca seria ruído; só o que o usuário acabou
 * de criar ou desfazer merece entrar com movimento. `contexto` é `null` até a primeira carga.
 */
export function useNovos(ids: readonly string[], contexto: string | null): (id: string) => boolean {
  const base = useRef<{ contexto: string; vistos: Set<string>; novos: Set<string> } | null>(null);
  if (contexto !== null) {
    const atual = base.current;
    if (atual === null || atual.contexto !== contexto) {
      base.current = { contexto, vistos: new Set(ids), novos: new Set() };
    } else {
      // Guarda só o que está na lista: um widget aberto por dias não acumula ids velhos.
      const presentes = new Set(ids);
      const novos = new Set([...atual.novos].filter((id) => presentes.has(id)));
      for (const id of ids) if (!atual.vistos.has(id)) novos.add(id);
      base.current = { contexto, vistos: presentes, novos };
    }
  }
  const novos = base.current?.novos;
  return (id) => novos?.has(id) ?? false;
}

export const ENTRAR = "motion-safe:animate-entrar motion-reduce:animate-fade";
export const SAIR = "pointer-events-none motion-safe:animate-sair";
