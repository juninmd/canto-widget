import { useMemo, useState } from "react";
import type { AgendaItem, Task } from "../lib/api";
import { resumoDoDia } from "../lib/resumo";

export default function ResumoDia({
  dia,
  tarefas,
  agenda,
  onFechar,
  onError,
}: {
  dia: string;
  tarefas: Task[];
  agenda: AgendaItem[];
  onFechar: () => void;
  onError: (m: string) => void;
}) {
  const texto = useMemo(() => resumoDoDia(dia, tarefas, agenda), [dia, tarefas, agenda]);
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      onError("não deu para copiar; selecione o texto e use Ctrl+C");
    }
  }

  return (
    <section
      aria-label="resumo do dia"
      onKeyDown={(e) => e.key === "Escape" && onFechar()}
      className="flex min-h-0 flex-1 flex-col gap-2 motion-safe:animate-aba"
    >
      <pre className="min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap rounded-lg border border-edge bg-ink/60 p-2 font-sans text-xs text-fg select-text">
        {texto}
      </pre>
      <div className="flex gap-2">
        <button
          type="button"
          autoFocus
          onClick={() => void copiar()}
          className="flex-1 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-on-accent"
        >
          {copiado ? "copiado!" : "copiar resumo"}
        </button>
        <button type="button" onClick={onFechar} title="Esc" className="rounded-lg bg-edge px-3 py-1.5 text-sm text-fg">
          voltar
        </button>
      </div>
    </section>
  );
}
