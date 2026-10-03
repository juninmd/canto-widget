import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api, type AgendaItem, type AlertOutcome } from "../lib/api";
import { kindOf, sortAlerts, toneOf } from "../lib/alerts";
import { playAlert } from "../lib/sound";
import { t } from "../i18n";
import AlertActions from "./AlertActions";
import AlertDetail from "./AlertDetail";
import AlertStrip, { TONE } from "./AlertStrip";

type Props = {
  events: AgendaItem[];
  onDismiss: (id: string) => void;
  onCompleted?: () => void;
  onOpenModels?: () => void;
  onOpenNotes?: () => void;
};

/** Everything pending at once: a strip of mini cards picks which one the card below details. */
export default function Alert({ events, onDismiss, onCompleted, onOpenModels, onOpenNotes }: Props) {
  const primary = useRef<HTMLButtonElement>(null);
  const items = useMemo(() => sortAlerts(events), [events]);
  // Sticky: a worse alert arriving must not swap the card under someone about to act on another one.
  const [picked, setPicked] = useState(() => items[0]?.id ?? "");
  const event = items.find((e) => e.id === picked) ?? items[0];
  const seen = useRef(new Set<string>());

  useEffect(() => {
    if (event && event.id !== picked) setPicked(event.id);
  }, [event, picked]);

  // Forgetting it lets the same id ring again (a snooze firing, a service getting worse) with a sound.
  const hide = useCallback(
    (id: string) => {
      seen.current.delete(id);
      onDismiss(id);
    },
    [onDismiss],
  );

  const dismiss = useCallback(
    (id: string, outcome?: AlertOutcome) => {
      void api.alertClose(id, outcome);
      hide(id);
    },
    [hide],
  );

  // A sound only for an alert that wasn't on screen yet; the list refreshes whenever another one arrives.
  useEffect(() => {
    const fresh = items.some((e) => !seen.current.has(e.id));
    items.forEach((e) => seen.current.add(e.id));
    if (fresh) void playAlert();
  }, [items]);

  // The overlay covers the widget: keyboard users need focus on the primary action and an Esc exit.
  // Picking from the strip keeps focus there, so a keyboard user isn't pulled away after every choice.
  // Only inside a window that already has focus: the pop-up never takes it, and asking for it from the page
  // would pull the foreground away from the game in front.
  useEffect(() => {
    if (document.hasFocus() && !document.activeElement?.closest("[data-alert-strip]")) primary.current?.focus();
  }, [event?.id]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && event) dismiss(event.id);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [event, dismiss]);

  if (!event) return null;
  const label = t("alert.dialogLabel", { kind: t(`alert.kind.${kindOf(event)}`), title: event.title });

  return (
    <div className="absolute inset-0 z-50 flex">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={label}
        className={`flex h-full w-full flex-col gap-3 overflow-hidden rounded-2xl border-2 bg-panel p-4 text-fg shadow-2xl motion-safe:animate-surgir motion-reduce:animate-fade ${TONE[toneOf(event)].border}`}
      >
        {items.length > 1 && <AlertStrip items={items} selected={event.id} onSelect={setPicked} />}
        <AlertDetail event={event} onOpenNotes={onOpenNotes} />
        <AlertActions
          ref={primary}
          event={event}
          onDismiss={(outcome) => dismiss(event.id, outcome)}
          onHide={() => hide(event.id)}
          onCompleted={onCompleted}
          onOpenModels={onOpenModels}
        />
      </div>
    </div>
  );
}
