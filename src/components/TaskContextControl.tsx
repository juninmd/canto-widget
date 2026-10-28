import { useEffect, useRef, useState } from "react";
import { t } from "../i18n";
import type { Task, TaskContext } from "../lib/api";
import { CONTEXT_KINDS } from "../lib/taskContext";

type Kind = TaskContext["kind"] | "";

const keyOf = (c: TaskContext | null | undefined) => (c ? `${c.kind}:${c.name}` : "");

/** "Remind me when I open Slack / join the office Wi-Fi": a place instead of a time. Saves on change, like its siblings. */
export default function TaskContextControl({ task, onChange }: { task: Task; onChange: (c: TaskContext | null) => void }) {
  const [kind, setKind] = useState<Kind>(task.context?.kind ?? "");
  const [name, setName] = useState(task.context?.name ?? "");

  // What was last sent: Enter and the blur that follows it are one save, even before the list reloads.
  const sent = useRef(keyOf(task.context));
  useEffect(() => {
    sent.current = keyOf(task.context);
  }, [task.context?.kind, task.context?.name]);

  const save = (k: Kind, n: string) => {
    const clean = n.trim();
    const next = k && clean ? { kind: k, name: clean } : null;
    if (keyOf(next) === sent.current) return;
    sent.current = keyOf(next);
    onChange(next);
  };

  return (
    <span className="flex items-center gap-1">
      <select
        aria-label={t("tasks.context.of", { title: task.title })}
        value={kind}
        onChange={(e) => {
          const next = e.target.value as Kind;
          setKind(next);
          if (!next) setName("");
          save(next, name);
        }}
        className="canto-field !rounded-md px-1 py-0.5"
      >
        <option value="">{t("tasks.context.none")}</option>
        {CONTEXT_KINDS.map((k) => (
          <option key={k} value={k}>
            {t(k === "app" ? "tasks.context.app" : "tasks.context.wifi")}
          </option>
        ))}
      </select>
      {kind && (
        <input
          type="text"
          maxLength={64}
          aria-label={t("tasks.context.nameOf", { title: task.title })}
          value={name}
          placeholder={kind === "app" ? "Slack" : "Wi-Fi"}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => save(kind, name)}
          onKeyDown={(e) => e.key === "Enter" && save(kind, name)}
          className="w-24 canto-field !rounded-md px-1 py-0.5"
        />
      )}
    </span>
  );
}
