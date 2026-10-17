import { useState } from "react";
import { t } from "../i18n";
import { HABITS } from "../lib/protos";
import ProtoFrame from "./ProtoFrame";

/** Prototype: today's habits with the streak and the week grid; the checks are local state, no backend yet. */
export default function ProtoHabits() {
  const [done, setDone] = useState<Record<string, boolean>>(() => Object.fromEntries(HABITS.map((h) => [h.id, h.done])));

  return (
    <ProtoFrame needs={t("protos.habits.needs")}>
      <h3 className="text-[11px] text-faint">{t("protos.habits.today")}</h3>
      <ul className="flex flex-col gap-1">
        {HABITS.map((habit) => (
          <li key={habit.id} data-proto-habit={habit.id} className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-hover">
            <input
              type="checkbox"
              className="canto-box"
              checked={done[habit.id] ?? false}
              aria-label={habit.label}
              onChange={(e) => setDone((prev) => ({ ...prev, [habit.id]: e.target.checked }))}
            />
            <span className="min-w-0 flex-1 truncate text-xs text-fg">{habit.label}</span>
            <span className="shrink-0 text-[10px] text-muted">
              {t("protos.habits.streak", { n: habit.streak })} · {t("protos.habits.best", { n: habit.best })}
            </span>
          </li>
        ))}
      </ul>

      <h3 className="text-[11px] text-faint">{t("protos.habits.week")}</h3>
      <ul className="flex flex-col gap-1">
        {HABITS.map((habit) => (
          <li key={habit.id} className="flex items-center gap-2 px-1.5">
            <span className="min-w-0 flex-1 truncate text-[11px] text-muted">{habit.label}</span>
            <span className="flex shrink-0 gap-1" aria-hidden="true">
              {habit.week.map((week, index) => (
                <span
                  key={index}
                  className={`size-3 rounded-sm ${week ? "bg-accent/70" : "bg-edge"}`}
                  title={`${index + 1}`}
                />
              ))}
            </span>
          </li>
        ))}
      </ul>
    </ProtoFrame>
  );
}
