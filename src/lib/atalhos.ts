import { useEffect, useRef } from "react";
import { TABS, type Tab } from "../components/TabBar";

export type Acao = { tipo: "aba"; aba: Tab } | { tipo: "trancar" } | { tipo: "foco"; alvo: "busca" | "novo" } | { tipo: "ajuda" };

export type Atalho = { teclas: string[]; descricao: string };

/** Agrupado por intenção; as seis abas viram uma linha só em vez de seis quase iguais. */
export const GRUPOS_ATALHOS: { titulo: string; itens: Atalho[] }[] = [
  {
    titulo: "Navegar",
    itens: [
      { teclas: ["Alt", `1–${TABS.length}`], descricao: `trocar de aba (${TABS.map((t) => t.rotulo).join(", ")})` },
      { teclas: ["/"], descricao: "buscar na aba atual" },
      { teclas: ["Esc"], descricao: "fechar ajuda, detalhes ou edição" },
      { teclas: ["?"], descricao: "abrir ou fechar esta ajuda" },
    ],
  },
  {
    titulo: "Criar e proteger",
    itens: [
      { teclas: ["N"], descricao: "nova tarefa ou novo card" },
      { teclas: ["Alt", "L"], descricao: "trancar o cofre" },
    ],
  },
  {
    titulo: "Global",
    itens: [
      { teclas: ["Ctrl", "Alt", "Espaço"], descricao: "mostrar ou esconder o widget, de qualquer app" },
    ],
  },
];

type Tecla = { key: string; code: string; altKey: boolean; ctrlKey: boolean; metaKey: boolean };

/** Teclas soltas (N, /, ?) só valem fora de campos de texto: senão ninguém digita "n". */
export function interpretar(e: Tecla, digitando: boolean): Acao | null {
  if (e.altKey && !e.ctrlKey && !e.metaKey) {
    const n = /^Digit([1-9])$/.exec(e.code);
    if (n && TABS[Number(n[1]) - 1]) return { tipo: "aba", aba: TABS[Number(n[1]) - 1].id };
    if (e.code === "KeyL") return { tipo: "trancar" };
    return null;
  }
  if (digitando || e.ctrlKey || e.metaKey || e.altKey) return null;
  if (e.key === "?") return { tipo: "ajuda" };
  if (e.key === "/") return { tipo: "foco", alvo: "busca" };
  if (e.key === "n" || e.key === "N") return { tipo: "foco", alvo: "novo" };
  return null;
}

function estaDigitando(alvo: EventTarget | null): boolean {
  const el = alvo as HTMLElement | null;
  return !!el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));
}

export function useAtalhos(ativo: boolean, executar: (a: Acao) => void) {
  const ref = useRef(executar);
  ref.current = executar;
  useEffect(() => {
    if (!ativo) return;
    const aoTeclar = (e: KeyboardEvent) => {
      const acao = interpretar(e, estaDigitando(e.target));
      if (!acao) return;
      e.preventDefault();
      ref.current(acao);
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [ativo]);
}

/** Foca o campo marcado com `data-atalho` no painel; botão (ex.: "+" das notas) é acionado. */
export function focarAtalho(alvo: "busca" | "novo"): boolean {
  const el = document.querySelector<HTMLElement>(`[role="tabpanel"] [data-atalho="${alvo}"]`);
  if (!el) return false;
  if (el.tagName === "BUTTON") el.click();
  else el.focus();
  return true;
}
