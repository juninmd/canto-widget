import { api, errText, type AgendaItem } from "../lib/api";
import { hour, status } from "../lib/agenda";
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
        {items.map((e) => {
          const { label, now } = status(e);
          return (
            <li
              key={e.id}
              className={`rounded-lg border p-2 ${now ? "border-accent bg-accent/10" : "border-edge bg-ink/60"}`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-medium text-fg">{e.title}</p>
                <span className="shrink-0 text-[11px] text-muted">{hour(e)}</span>
              </div>
              {label && (
                <p className={`text-[11px] font-semibold ${now ? "text-fg" : "text-muted"}`}>{label}</p>
              )}
              {e.location && <p className="truncate text-[11px] text-faint">{e.location}</p>}
              {e.meet && (
                <button
                  type="button"
                  onClick={() => void api.openLink(e.meet)}
                  className={`mt-1.5 min-h-7 rounded px-2.5 text-xs font-semibold ${
                    now ? "bg-accent text-on-accent" : "bg-edge text-fg"
                  }`}
                >
                  entrar no Meet
                </button>
              )}
            </li>
          );
        })}
        {items.length === 0 && !loading && (
          <li className="px-2 py-6 text-center text-xs text-faint">
            {error || "nenhum evento hoje. Para ver sua agenda, entre com o Google em Ajustes."}
          </li>
        )}
      </ul>
    </div>
  );
}
