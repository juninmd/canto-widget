import { useEffect } from "react";
import { api, type AgendaItem } from "../lib/api";
import { hora } from "../lib/agenda";
import { tocarAlerta } from "../lib/som";

export default function Alerta({ evento, onFechar }: { evento: AgendaItem; onFechar: () => void }) {
  useEffect(() => {
    void tocarAlerta();
  }, [evento.id]);

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-between rounded-2xl border-2 border-accent bg-panel p-4 text-fg shadow-2xl">
      <div className="min-h-0">
        <p className="text-[11px] uppercase tracking-widest text-accent">começando agora</p>
        <h1 className="mt-1 line-clamp-2 text-lg font-semibold">{evento.titulo}</h1>
        <p className="mt-1 text-sm text-muted">{hora(evento)}</p>
        {evento.local && <p className="mt-1 line-clamp-2 text-xs text-faint">{evento.local}</p>}
        {evento.meet && (
          <p className="mt-2 truncate text-xs text-muted" title={evento.meet}>
            {evento.meet}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        {evento.meet && (
          <button
            type="button"
            onClick={() => {
              void api.abrirLink(evento.meet);
              void api.alertaFechar();
              onFechar();
            }}
            className="flex-1 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-on-accent"
          >
            entrar no Meet
          </button>
        )}
        {!evento.meet && evento.link && (
          <button
            type="button"
            onClick={() => void api.abrirLink(evento.link)}
            className="flex-1 rounded-lg bg-edge px-3 py-2 text-sm text-fg"
          >
            abrir no Calendar
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            void api.alertaFechar();
            onFechar();
          }}
          className="rounded-lg bg-edge px-3 py-2 text-sm text-muted"
        >
          fechar
        </button>
      </div>
    </div>
  );
}
