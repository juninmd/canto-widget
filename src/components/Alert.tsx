import { useCallback, useEffect, useRef } from "react";
import { api, type AgendaItem } from "../lib/api";
import { hour, people } from "../lib/agenda";
import { TASK_PREFIX } from "../lib/reminders";
import { playAlert } from "../lib/sound";

const SNOOZE_MINUTES = 10;

type Props = { event: AgendaItem; onClose: () => void; onCompleted?: () => void };

export default function Alert({ event, onClose, onCompleted }: Props) {
  const primary = useRef<HTMLButtonElement>(null);
  const task = event.id.startsWith(TASK_PREFIX) ? event.id.slice(TASK_PREFIX.length) : null;

  const close = useCallback(() => {
    void api.alertClose();
    onClose();
  }, [onClose]);

  useEffect(() => {
    void playAlert();
    // The overlay covers the whole widget: someone arriving via keyboard needs focus
    // on the primary action and an Esc exit.
    primary.current?.focus();
  }, [event.id]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close]);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label={`${task ? "lembrete de tarefa" : "reunião começando"}: ${event.title}`}
      className="absolute inset-0 z-50 flex flex-col justify-between rounded-2xl border-2 border-accent bg-panel p-4 text-fg shadow-2xl motion-safe:animate-surgir motion-reduce:animate-fade"
    >
      <div className="min-h-0 overflow-y-auto">
        <p className="text-[11px] uppercase tracking-widest text-accent">
          {task ? "lembrete de tarefa" : "começando agora"}
        </p>
        <h1 className="mt-1 line-clamp-2 text-lg font-semibold">{event.title}</h1>
        <p className="mt-1 text-sm text-muted">{hour(event)}</p>
        {event.location && <p className="mt-1 line-clamp-2 text-xs text-faint">{event.location}</p>}
        {people(event) && <p className="mt-1 text-xs text-muted">{people(event)}</p>}
        {event.description && <p className="mt-2 line-clamp-4 whitespace-pre-line text-xs text-faint">{event.description}</p>}
        {(event.attachments ?? []).slice(0, 3).map((a) => (
          <button
            key={a.url}
            type="button"
            onClick={() => void api.openLink(a.url)}
            title={a.url}
            className="mt-1.5 block w-full truncate rounded bg-edge px-2 py-1 text-left text-xs text-fg"
          >
            📄 {a.title}
          </button>
        ))}
        {event.meet && (
          <p className="mt-2 truncate text-xs text-muted" title={event.meet}>
            {event.meet}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        {task && (
          <button
            ref={primary}
            type="button"
            onClick={() => void api.taskComplete(task).then(onCompleted).finally(close)}
            className="flex-1 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-on-accent"
          >
            concluir tarefa
          </button>
        )}
        {event.meet && (
          <button
            ref={primary}
            type="button"
            onClick={() => {
              void api.openLink(event.meet);
              close();
            }}
            className="flex-1 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-on-accent"
          >
            entrar no Meet
          </button>
        )}
        {!event.meet && event.link && (
          <button
            ref={primary}
            type="button"
            onClick={() => void api.openLink(event.link)}
            className="flex-1 rounded-lg bg-edge px-3 py-2 text-sm text-fg"
          >
            abrir no Calendar
          </button>
        )}
        <button
          type="button"
          onClick={() => void api.alertSnooze(SNOOZE_MINUTES).then(onClose, close)}
          className="rounded-lg bg-edge px-3 py-2 text-sm text-fg"
        >
          adiar {SNOOZE_MINUTES} min
        </button>
        <button
          type="button"
          onClick={close}
          title="Esc"
          className="rounded-lg bg-edge px-3 py-2 text-sm text-muted"
        >
          fechar
        </button>
      </div>
    </div>
  );
}
