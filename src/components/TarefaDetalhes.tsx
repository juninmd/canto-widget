import type { Repetir, Task } from "../lib/api";
import { diaDaSemana, ROTULO_REPETIR } from "../lib/lembretes";
import { IconeRelogio } from "./Icones";

const SEMANA = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

function valorRepetir(r: Repetir | null | undefined): string {
  return r?.tipo ?? "";
}

/** Horário e repetição de uma tarefa. Cada mudança grava na hora: não há "salvar" para esquecer. */
export default function TarefaDetalhes({
  tarefa,
  onMudar,
  onFechar,
}: {
  tarefa: Task;
  onMudar: (hora: string | null, repetir: Repetir | null) => void;
  onFechar: () => void;
}) {
  const semanal: Repetir = { tipo: "semanal", dia: diaDaSemana(tarefa.day) };
  const opcoes: { valor: string; rotulo: string; regra: Repetir | null }[] = [
    { valor: "", rotulo: "não repete", regra: null },
    { valor: "diaria", rotulo: "todo dia", regra: { tipo: "diaria" } },
    { valor: "dias_uteis", rotulo: "dias úteis (seg–sex)", regra: { tipo: "dias_uteis" } },
    { valor: "semanal", rotulo: `toda ${SEMANA[semanal.dia]}`, regra: semanal },
  ];
  const repetir = tarefa.repetir ?? null;

  return (
    <div
      className="ml-6 flex flex-wrap items-center gap-2 rounded-lg border border-edge bg-ink/60 p-2 text-xs text-muted motion-safe:animate-aba"
      onKeyDown={(e) => e.key === "Escape" && onFechar()}
    >
      <label className="flex items-center gap-1">
        lembrar às
        <input
          type="time"
          aria-label={`horário do lembrete de ${tarefa.title}`}
          value={tarefa.hora ?? ""}
          onChange={(e) => onMudar(e.target.value || null, repetir)}
          className="rounded border border-line bg-ink px-1 py-0.5 text-fg outline-none focus:border-accent"
        />
      </label>
      <select
        aria-label={`repetir ${tarefa.title}`}
        value={valorRepetir(repetir)}
        onChange={(e) => onMudar(tarefa.hora ?? null, opcoes.find((o) => o.valor === e.target.value)?.regra ?? null)}
        className="rounded border border-line bg-ink px-1 py-0.5 text-fg outline-none focus:border-accent"
      >
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.rotulo}
          </option>
        ))}
      </select>
      <button type="button" onClick={onFechar} className="ml-auto min-h-6 px-1 hover:text-fg">
        fechar
      </button>
    </div>
  );
}

/** Horário e ↻ visíveis na linha, e o botão que abre os detalhes. */
export function SeloDetalhes({ tarefa: t, aberto, onAlternar }: { tarefa: Task; aberto: boolean; onAlternar: () => void }) {
  return (
    <>
      {(t.hora || t.repetir) && (
        <span className="shrink-0 text-[11px] text-muted" title={t.repetir ? ROTULO_REPETIR[t.repetir.tipo] : undefined}>
          {t.hora}
          {t.repetir && <span aria-label={`repete ${ROTULO_REPETIR[t.repetir.tipo]}`}> ↻</span>}
        </span>
      )}
      <button
        type="button"
        onClick={onAlternar}
        aria-expanded={aberto}
        className="grid size-6 shrink-0 place-items-center rounded text-faint opacity-0 hover:text-fg focus-visible:opacity-100 group-hover:opacity-100 aria-expanded:opacity-100"
        aria-label={`horário e repetição de ${t.title}`}
        title="horário e repetição"
      >
        <IconeRelogio />
      </button>
    </>
  );
}
