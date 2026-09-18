import { useEffect, useRef } from "react";
import { TABS, type Tab } from "../components/TabBar";

export type Action =
  | { type: "tab"; tab: Tab }
  | { type: "lock" }
  | { type: "focus"; target: "search" | "new" }
  | { type: "help" }
  | { type: "fullscreen" };

export type Shortcut = { keys: string[]; description: string };

/** Grouped by intent; the tabs become a single line instead of one per tab. */
export const SHORTCUT_GROUPS: { title: string; items: Shortcut[] }[] = [
  {
    title: "Navegar",
    items: [
      { keys: ["Alt", `1–${TABS.length}`], description: `trocar de aba (${TABS.map((t) => t.label).join(", ")})` },
      { keys: ["/"], description: "buscar na aba atual" },
      { keys: ["Esc"], description: "fechar ajuda, detalhes ou edição" },
      { keys: ["?"], description: "abrir ou fechar esta ajuda" },
    ],
  },
  {
    title: "Criar e proteger",
    items: [
      { keys: ["N"], description: "nova tarefa ou novo card" },
      { keys: ["Alt", "L"], description: "trancar o cofre" },
    ],
  },
  {
    title: "Global",
    items: [
      { keys: ["Ctrl", "Alt", "Espaço"], description: "mostrar ou esconder o widget, de qualquer app" },
      { keys: ["F11"], description: "entrar ou sair da tela cheia" },
    ],
  },
];

type Key = { key: string; code: string; altKey: boolean; ctrlKey: boolean; metaKey: boolean };

/** Bare keys (N, /, ?) only count outside text fields: otherwise nobody can type "n". */
export function interpret(e: Key, typing: boolean): Action | null {
  // Function key doesn't produce text: it counts even with focus in a field.
  if (e.key === "F11" && !e.altKey && !e.ctrlKey && !e.metaKey) return { type: "fullscreen" };
  if (e.altKey && !e.ctrlKey && !e.metaKey) {
    const n = /^Digit([1-9])$/.exec(e.code);
    if (n && TABS[Number(n[1]) - 1]) return { type: "tab", tab: TABS[Number(n[1]) - 1].id };
    if (e.code === "KeyL") return { type: "lock" };
    return null;
  }
  if (typing || e.ctrlKey || e.metaKey || e.altKey) return null;
  if (e.key === "?") return { type: "help" };
  if (e.key === "/") return { type: "focus", target: "search" };
  if (e.key === "n" || e.key === "N") return { type: "focus", target: "new" };
  return null;
}

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return !!el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));
}

export function useShortcuts(active: boolean, run: (a: Action) => void) {
  const ref = useRef(run);
  ref.current = run;
  useEffect(() => {
    if (!active) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const action = interpret(e, isTyping(e.target));
      if (!action) return;
      e.preventDefault();
      ref.current(action);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);
}

/** Focuses the field marked with `data-shortcut` in the panel; a button (e.g. notes' "+") is clicked. */
export function focusShortcut(target: "search" | "new"): boolean {
  const el = document.querySelector<HTMLElement>(`[role="tabpanel"] [data-shortcut="${target}"]`);
  if (!el) return false;
  if (el.tagName === "BUTTON") el.click();
  else el.focus();
  return true;
}
