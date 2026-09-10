import { api, errText, type AgendaItem } from "../lib/api";
import { hora, minutosAte } from "../lib/agenda";
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
            className="underline decoration-dotted hover:text-muted"
          >
            testar aviso
          </button>
          <button
            type="button"
            onClick={() => void recarregar()}
            className="underline decoration-dotted hover:text-muted"
          >
            {carregando ? "..." : "atualizar"}
          </button>
        </span>
      </div>

      <ul className="flex-1 space-y-2 overflow-y-auto pr-1">
        {itens.map((e) => {
          const faltam = minutosAte(e);
          const agora = faltam <= 0 && faltam > -60;
          return (
            <li
              key={e.id}
              className={`rounded-lg border p-2 ${agora ? "border-accent bg-accent/10" : "border-edge bg-ink/60"}`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-medium text-fg">{e.titulo}</p>
                <span className="shrink-0 text-[11px] text-muted">{hora(e)}</span>
              </div>
              {e.local && <p className="truncate text-[11px] text-faint">{e.local}</p>}
              <div className="mt-1 flex gap-2 text-[11px]">
                {e.meet && (
                  <button
                    type="button"
                    onClick={() => void api.abrirLink(e.meet)}
                    className="rounded bg-accent px-2 py-0.5 font-semibold text-on-accent"
                  >
                    entrar no Meet
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void api.alertaAbrir(e)}
                  className="rounded bg-edge px-2 py-0.5 text-muted hover:text-fg"
                >
                  testar alerta
                </button>
              </div>
            </li>
          );
        })}
        {itens.length === 0 && !carregando && (
          <li className="px-2 py-6 text-center text-xs text-faint">
            {erro || "nada hoje — ou entre com o Google na aba sync"}
          </li>
        )}
      </ul>
    </div>
  );
}
