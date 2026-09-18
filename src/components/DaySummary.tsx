import { useMemo, useState } from "react";
import type { AgendaItem, Task } from "../lib/api";
import { daySummary } from "../lib/summary";

export default function DaySummary({
  day,
  tasks,
  agenda,
  onClose,
  onError,
}: {
  day: string;
  tasks: Task[];
  agenda: AgendaItem[];
  onClose: () => void;
  onError: (m: string) => void;
}) {
  const text = useMemo(() => daySummary(day, tasks, agenda), [day, tasks, agenda]);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      onError("não deu para copiar; selecione o texto e use Ctrl+C");
    }
  }

  return (
    <section
      aria-label="resumo do dia"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      className="flex min-h-0 flex-1 flex-col gap-2 motion-safe:animate-aba"
    >
      <pre className="min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap rounded-lg border border-edge bg-ink/60 p-2 font-sans text-xs text-fg select-text">
        {text}
      </pre>
      <div className="flex gap-2">
        <button
          type="button"
          autoFocus
          onClick={() => void copy()}
          className="flex-1 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-on-accent"
        >
          {copied ? "copiado!" : "copiar resumo"}
        </button>
        <button type="button" onClick={onClose} title="Esc" className="rounded-lg bg-edge px-3 py-1.5 text-sm text-fg">
          voltar
        </button>
      </div>
    </section>
  );
}
