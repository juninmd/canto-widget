import type { ExtendedRepeat, Repeat, Task } from "../lib/api";
import { dayOfWeek } from "../lib/reminders";

const WEEK = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
type Kind = "" | "diaria" | "dias_uteis" | "semanal" | "mensal" | "dias_especificos";

function kindOf(task: Task): Kind {
  if (task.extended_repeat?.tipo === "monthly") return "mensal";
  if (task.extended_repeat?.tipo === "specific_days") return "dias_especificos";
  return (task.repetir?.tipo as Kind | undefined) ?? "";
}

const fieldClass = "rounded border border-line bg-ink px-1 py-0.5 text-fg outline-none focus:border-accent";

type Props = { task: Task; onLegacy: (repeat: Repeat | null) => void; onExtended: (repeat: ExtendedRepeat | null) => void };

/** Legacy (`Repeat`) and extended (monthly / specific weekdays) recurrence: mutually exclusive, one control. */
export default function RepeatControl({ task, onLegacy, onExtended }: Props) {
  const kind = kindOf(task);
  const weekday = dayOfWeek(task.day);
  const dayOfMonth = Number(task.day.slice(8, 10));

  function change(next: Kind) {
    if (next === "") {
      onLegacy(null);
      onExtended(null);
    } else if (next === "diaria") onLegacy({ tipo: "diaria" });
    else if (next === "dias_uteis") onLegacy({ tipo: "dias_uteis" });
    else if (next === "semanal") onLegacy({ tipo: "semanal", dia: weekday });
    else if (next === "mensal") onExtended({ tipo: "monthly", day: dayOfMonth });
    else onExtended({ tipo: "specific_days", days: [weekday] });
  }

  return (
    <>
      <select aria-label={`repetir ${task.title}`} value={kind} onChange={(e) => change(e.target.value as Kind)} className={fieldClass}>
        <option value="">não repete</option>
        <option value="diaria">todo dia</option>
        <option value="dias_uteis">dias úteis (seg–sex)</option>
        <option value="semanal">toda {WEEK[weekday]}</option>
        <option value="mensal">todo mês</option>
        <option value="dias_especificos">dias específicos</option>
      </select>
      {task.extended_repeat?.tipo === "monthly" && (
        <label className="flex items-center gap-1">
          dia
          <input
            type="number"
            min={1}
            max={31}
            aria-label={`dia do mês de ${task.title}`}
            value={task.extended_repeat.day}
            onChange={(e) => onExtended({ tipo: "monthly", day: Math.min(31, Math.max(1, Number(e.target.value) || 1)) })}
            className={`${fieldClass} w-14`}
          />
        </label>
      )}
      {task.extended_repeat?.tipo === "specific_days" && (
        <div className="flex gap-1" role="group" aria-label={`dias específicos de ${task.title}`}>
          {WEEK.map((label, i) => {
            const days = task.extended_repeat?.tipo === "specific_days" ? task.extended_repeat.days : [];
            const on = days.includes(i);
            return (
              <button
                key={i}
                type="button"
                aria-pressed={on}
                aria-label={label}
                title={label}
                disabled={on && days.length === 1}
                onClick={() => onExtended({ tipo: "specific_days", days: (on ? days.filter((d) => d !== i) : [...days, i]).sort() })}
                className={`size-6 rounded ${on ? "bg-accent text-on-accent" : "bg-edge text-muted hover:text-fg"} disabled:opacity-60`}
              >
                {label[0].toUpperCase()}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
