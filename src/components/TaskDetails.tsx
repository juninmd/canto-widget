import { useState } from "react";
import { api } from "../lib/api";
import type { Repeat, Task } from "../lib/api";
import { dayOfWeek, REPEAT_LABEL } from "../lib/reminders";
import { ClockIcon, PullIcon } from "./Icons";

const WEEK = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

function repeatValue(r: Repeat | null | undefined): string {
  return r?.tipo ?? "";
}

/** A task's time, repeat rule and linked PR/MR. Every change saves immediately: there's no "save" to forget. */
export default function TaskDetails({
  task,
  onChange,
  onLinkPr,
  onClose,
}: {
  task: Task;
  onChange: (time: string | null, repeat: Repeat | null) => void;
  onLinkPr: (url: string | null) => void;
  onClose: () => void;
}) {
  const [prUrl, setPrUrl] = useState(task.pr_url ?? "");
  const weekly: Repeat = { tipo: "semanal", dia: dayOfWeek(task.day) };
  const options: { value: string; label: string; rule: Repeat | null }[] = [
    { value: "", label: "não repete", rule: null },
    { value: "diaria", label: "todo dia", rule: { tipo: "diaria" } },
    { value: "dias_uteis", label: "dias úteis (seg–sex)", rule: { tipo: "dias_uteis" } },
    { value: "semanal", label: `toda ${WEEK[weekly.dia]}`, rule: weekly },
  ];
  const repeat = task.repetir ?? null;

  return (
    <div
      className="ml-6 flex flex-wrap items-center gap-2 rounded-lg border border-edge bg-ink/60 p-2 text-xs text-muted motion-safe:animate-aba"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <label className="flex items-center gap-1">
        lembrar às
        <input
          type="time"
          aria-label={`horário do lembrete de ${task.title}`}
          value={task.hora ?? ""}
          onChange={(e) => onChange(e.target.value || null, repeat)}
          className="rounded border border-line bg-ink px-1 py-0.5 text-fg outline-none focus:border-accent"
        />
      </label>
      <select
        aria-label={`repetir ${task.title}`}
        value={repeatValue(repeat)}
        onChange={(e) => onChange(task.hora ?? null, options.find((o) => o.value === e.target.value)?.rule ?? null)}
        className="rounded border border-line bg-ink px-1 py-0.5 text-fg outline-none focus:border-accent"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <label className="flex flex-1 items-center gap-1">
        PR/MR
        <input
          type="url"
          aria-label={`link do PR ou MR de ${task.title}`}
          value={prUrl}
          placeholder="https://..."
          onChange={(e) => setPrUrl(e.target.value)}
          onBlur={() => prUrl.trim() !== (task.pr_url ?? "") && onLinkPr(prUrl.trim() || null)}
          onKeyDown={(e) => e.key === "Enter" && onLinkPr(prUrl.trim() || null)}
          className="min-w-0 flex-1 rounded border border-line bg-ink px-1 py-0.5 text-fg outline-none focus:border-accent"
        />
      </label>
      <button type="button" onClick={onClose} className="ml-auto min-h-6 px-1 hover:text-fg">
        fechar
      </button>
    </div>
  );
}

/** Time and ↻ visible on the row, plus the button that opens the details. */
export function TaskBadge({ task: t, open, onToggle }: { task: Task; open: boolean; onToggle: () => void }) {
  return (
    <>
      {(t.hora || t.repetir) && (
        <span className="shrink-0 text-[11px] text-muted" title={t.repetir ? REPEAT_LABEL[t.repetir.tipo] : undefined}>
          {t.hora}
          {t.repetir && <span aria-label={`repete ${REPEAT_LABEL[t.repetir.tipo]}`}> ↻</span>}
        </span>
      )}
      {t.pr_url && (
        <button
          type="button"
          onClick={() => void api.openLink(t.pr_url!)}
          className="grid size-6 shrink-0 place-items-center rounded text-faint hover:text-fg"
          aria-label={`abrir PR/MR de ${t.title}`}
          title="abrir PR/MR"
        >
          <PullIcon />
        </button>
      )}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="grid size-6 shrink-0 place-items-center rounded text-faint opacity-0 hover:text-fg focus-visible:opacity-100 group-hover:opacity-100 aria-expanded:opacity-100"
        aria-label={`horário e repetição de ${t.title}`}
        title="horário e repetição"
      >
        <ClockIcon />
      </button>
    </>
  );
}
