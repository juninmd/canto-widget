import { useRef } from "react";

export type Tab = "tarefas" | "notas" | "clipboard" | "reunioes" | "agenda" | "ajustes";

export const TABS: { id: Tab; rotulo: string }[] = [
  { id: "tarefas", rotulo: "Tarefas" },
  { id: "notas", rotulo: "Notas" },
  { id: "clipboard", rotulo: "Clipboard" },
  { id: "reunioes", rotulo: "Reuniões" },
  { id: "agenda", rotulo: "Agenda" },
  { id: "ajustes", rotulo: "Ajustes" },
];

export const painelId = (t: Tab) => `painel-${t}`;
const abaId = (t: Tab) => `aba-${t}`;

/** Padrão de abas do WAI-ARIA APG: uma parada de Tab, setas/Home/End trocam de aba. */
export default function TabBar({ atual, onChange }: { atual: Tab; onChange: (t: Tab) => void }) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  function aoTeclar(e: React.KeyboardEvent) {
    const i = TABS.findIndex((t) => t.id === atual);
    const destino = {
      ArrowRight: (i + 1) % TABS.length,
      ArrowLeft: (i - 1 + TABS.length) % TABS.length,
      Home: 0,
      End: TABS.length - 1,
    }[e.key];
    if (destino === undefined) return;
    e.preventDefault();
    const alvo = TABS[destino].id;
    onChange(alvo);
    refs.current[alvo]?.focus();
  }

  return (
    <nav
      role="tablist"
      aria-label="seções do widget"
      onKeyDown={aoTeclar}
      className="flex shrink-0 gap-1 overflow-x-auto px-3 pt-2 text-xs"
    >
      {TABS.map((t) => (
        <button
          key={t.id}
          ref={(el) => {
            refs.current[t.id] = el;
          }}
          id={abaId(t.id)}
          type="button"
          role="tab"
          aria-selected={atual === t.id}
          // So o painel ativo existe no DOM; apontar para os outros seria referencia quebrada.
          aria-controls={atual === t.id ? painelId(t.id) : undefined}
          tabIndex={atual === t.id ? 0 : -1}
          onClick={() => onChange(t.id)}
          className={`min-h-7 shrink-0 rounded-lg px-2.5 ${
            atual === t.id ? "bg-edge font-semibold text-fg" : "text-muted hover:text-fg"
          }`}
        >
          {t.rotulo}
        </button>
      ))}
    </nav>
  );
}
