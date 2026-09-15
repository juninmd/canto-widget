import type { Note } from "../lib/api";
import { IconeAlfinete } from "./Icones";

type Props = {
  nota: Note;
  classe: string;
  onAbrir: () => void;
  onFixar: () => void;
  onExcluir: () => void;
  onTag: (tag: string) => void;
};

export default function NotaCard({ nota: n, classe, onAbrir, onFixar, onExcluir, onTag }: Props) {
  const acao = "grid size-6 shrink-0 place-items-center rounded focus-visible:opacity-100 group-hover:opacity-100";
  return (
    <li className={`group rounded-lg border bg-ink/60 p-2 ${n.fixada ? "border-accent/60" : "border-edge"} ${classe}`}>
      <div className="flex items-start justify-between gap-2">
        <button type="button" className="min-w-0 flex-1 text-left" onClick={onAbrir}>
          <p className="truncate text-sm font-medium text-fg">{n.title}</p>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted">{n.body}</p>
        </button>
        <button
          type="button"
          onClick={onFixar}
          aria-pressed={!!n.fixada}
          aria-label={n.fixada ? `desafixar ${n.title}` : `fixar ${n.title} no topo`}
          title={n.fixada ? "desafixar" : "fixar no topo"}
          // Fixada fica sempre visivel: o alfinete e o sinal de por que o card esta no topo.
          className={`${acao} ${n.fixada ? "text-accent" : "text-faint opacity-0 hover:text-fg"}`}
        >
          <IconeAlfinete cheio={!!n.fixada} />
        </button>
        <button type="button" onClick={onExcluir} className={`${acao} text-faint opacity-0 hover:text-danger`} aria-label={`excluir ${n.title}`}>
          ×
        </button>
      </div>
      {n.tags.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {n.tags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onTag(t)}
              title={`ver só cards com #${t}`}
              className="min-h-6 rounded bg-edge px-1.5 text-[11px] text-muted hover:text-fg"
            >
              #{t}
            </button>
          ))}
        </div>
      )}
    </li>
  );
}
