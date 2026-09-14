import { api, errText, type AgendaItem } from "../lib/api";
import { hora, situacao } from "../lib/agenda";
import type { Agenda } from "../lib/useAgenda";

/// Evento sintetico para o usuario conferir o pop-up e o som sem esperar uma reuniao.
function eventoDeTeste(): AgendaItem {
  const agora = new Date();
  return {
    id: `teste-${agora.getTime()}`,
    titulo: "Reunião de teste do Canto",
    inicio: agora.toISOString(),
    fim: new Date(agora.getTime() + 30 * 60_000).toISOString(),
    dia_inteiro: false,
    local: "Sala virtual",
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
  const { itens, carregando, erro, recarregar } = agenda;

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between text-[11px] text-faint">
        <span>agenda de hoje · aviso 1 min antes</span>
        <span className="flex gap-3">
          <button
            type="button"
            title="abre o pop-up com um evento de exemplo, para conferir som e aviso"
            onClick={() => void api.alertaAbrir(eventoDeTeste()).catch((e) => onError(errText(e)))}
            className="min-h-6 underline decoration-dotted hover:text-muted"
          >
            testar aviso
          </button>
          <button
            type="button"
            onClick={() => void recarregar()}
            className="min-h-6 underline decoration-dotted hover:text-muted"
          >
            {carregando ? "..." : "atualizar"}
          </button>
        </span>
      </div>

      <ul className="flex-1 space-y-2 overflow-y-auto pr-1">
        {itens.map((e) => {
          const { rotulo, agora } = situacao(e);
          return (
            <li
              key={e.id}
              className={`rounded-lg border p-2 ${agora ? "border-accent bg-accent/10" : "border-edge bg-ink/60"}`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-medium text-fg">{e.titulo}</p>
                <span className="shrink-0 text-[11px] text-muted">{hora(e)}</span>
              </div>
              {rotulo && (
                <p className={`text-[11px] font-semibold ${agora ? "text-fg" : "text-muted"}`}>{rotulo}</p>
              )}
              {e.local && <p className="truncate text-[11px] text-faint">{e.local}</p>}
              {e.meet && (
                <button
                  type="button"
                  onClick={() => void api.abrirLink(e.meet)}
                  className={`mt-1.5 min-h-7 rounded px-2.5 text-xs font-semibold ${
                    agora ? "bg-accent text-on-accent" : "bg-edge text-fg"
                  }`}
                >
                  entrar no Meet
                </button>
              )}
            </li>
          );
        })}
        {itens.length === 0 && !carregando && (
          <li className="px-2 py-6 text-center text-xs text-faint">
            {erro || "nenhum evento hoje. Para ver sua agenda, entre com o Google em Ajustes."}
          </li>
        )}
      </ul>
    </div>
  );
}
