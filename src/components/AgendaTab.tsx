import { useState } from "react";
import { api, errText, type AgendaItem } from "../lib/api";
import AgendaCard from "./AgendaCard";
import Skeleton from "./Skeleton";
import type { Agenda } from "../lib/useAgenda";

/// Synthetic event so the user can check the pop-up and sound without waiting for a meeting.
function testEvent(): AgendaItem {
  const now = new Date();
  return {
    id: `teste-${now.getTime()}`,
    title: "Reunião de teste do Canto",
    start: now.toISOString(),
    end: new Date(now.getTime() + 30 * 60_000).toISOString(),
    all_day: false,
    location: "Sala virtual",
    meet: "https://meet.google.com/abc-defg-hij",
    link: "",
    organizer: "você",
    guests: 3,
    description: "Evento de exemplo para conferir o aviso, o som e os detalhes da reunião.",
  };
}

export default function AgendaTab({
  agenda,
  onError,
}: {
  agenda: Agenda;
  onError: (m: string) => void;
}) {
  const { items, loading, error, reload } = agenda;
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between text-[11px] text-faint">
        <span>agenda de hoje · aviso 1 min antes</span>
        <span className="flex gap-3">
          <button
            type="button"
            title="abre o pop-up com um evento de exemplo, para conferir som e aviso"
            onClick={() => void api.alertOpen(testEvent()).catch((e) => onError(errText(e)))}
            className="min-h-6 underline decoration-dotted hover:text-muted"
          >
            testar aviso
          </button>
          <button
            type="button"
            onClick={() => void reload()}
            className="min-h-6 underline decoration-dotted hover:text-muted"
          >
            {loading ? "..." : "atualizar"}
          </button>
        </span>
      </div>

      <ul className="flex-1 space-y-2 overflow-y-auto pr-1">
        {items.map((e) => (
          <AgendaCard key={e.id} event={e} open={open === e.id} onToggle={() => setOpen(open === e.id ? null : e.id)} />
        ))}
        {items.length === 0 && loading && !error && (
          <li>
            <Skeleton label="carregando a agenda" />
          </li>
        )}
        {items.length === 0 && !loading && (
          <li className="px-2 py-6 text-center text-xs text-faint">
            {error || "nenhum evento hoje. Para ver sua agenda, entre com o Google em Ajustes."}
          </li>
        )}
      </ul>
    </div>
  );
}
