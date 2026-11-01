import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { api, type AgendaItem, type AlertOutcome } from "../lib/api";
import { kindOf, sortAlerts, toneOf } from "../lib/alerts";
import { playAlert } from "../lib/sound";
import { t } from "../i18n";
import AlertActions from "./AlertActions";
import AlertDetail from "./AlertDetail";
import AlertStrip, { TONE } from "./AlertStrip";
import { CrossIcon } from "./Icons";
import AlertFx from "./AlertFx";
import WeatherAlertFx from "./WeatherAlertFx";
import { alertFx } from "../lib/alertFx";

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

  // The whole queue at once, like the notifications screen: one call to Rust, every card leaves here.
  const closeAll = useCallback(() => {
    void api.alertCloseAll();
    items.forEach((e) => hide(e.id));
  }, [items, hide]);

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

  // The window hugs the card: it measures itself and Rust sizes the pop-up to it, so no empty space covers the corner.
  const card = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = card.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    // Layout size, not getBoundingClientRect: the entry animation scales the card to 98%, and measuring that
    // left the window a few pixels short, cutting off the card's top border.
    const fit = (entries: ResizeObserverEntry[]) => {
      const height = entries[0]?.borderBoxSize?.[0]?.blockSize ?? el.offsetHeight;
      void api.alertResize(Math.ceil(height)).catch(() => {});
    };
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [event?.id]);

  if (!event) return null;
  const label = t("alert.dialogLabel", {
    kind: t(`alert.kind.${kindOf(event)}`),
    title: event.title,
  });

  const tone = TONE[toneOf(event)];
  const fx = alertFx(event);
  // Red tone = something is wrong now: the border pulses and the sky gets more of everything.
  const severe = fx.intense && toneOf(event) === "danger";

  return (
    <div className="absolute inset-x-0 bottom-0 z-50 flex">
      <div
        ref={card}
        role="alertdialog"
        aria-modal="true"
        aria-label={label}
        style={{ "--wx-sky": fx.sky } as CSSProperties}
        className={`relative isolate flex w-full flex-col gap-2 overflow-hidden rounded-2xl border bg-panel p-3 text-fg shadow-2xl ${tone.border} ${
          `${fx.enter} ${severe ? "wx-severe" : ""}`
        }`}
      >
        <span aria-hidden="true" className="wx-sky pointer-events-none absolute inset-0 -z-20" />
        {fx.scene === "weather" ? (
          <WeatherAlertFx key={event.id + String(severe)} id={event.id} severe={severe} />
        ) : (
          <AlertFx key={event.id + fx.scene + String(fx.intense)} scene={fx.scene} tone={fx.tone} intense={fx.intense} />
        )}
        {severe && <span aria-hidden="true" className="wx-alarm pointer-events-none absolute inset-0 -z-10 rounded-2xl" />}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-current to-transparent opacity-10 ${tone.text}`}
        />
        <button
          type="button"
          onClick={() => dismiss(event.id)}
          aria-label={t("alert.close")}
          title="Esc"
          className="absolute right-2 top-2 z-10 grid size-6 place-items-center rounded-md text-faint transition hover:bg-edge hover:text-fg"
        >
          <CrossIcon />
        </button>
        {items.length > 1 && <AlertStrip items={items} selected={event.id} onSelect={setPicked} />}
        <AlertDetail event={event} onOpenNotes={onOpenNotes} />
        <AlertActions
          ref={primary}
          event={event}
          onDismiss={(outcome) => dismiss(event.id, outcome)}
          onHide={() => hide(event.id)}
          onCloseAll={items.length > 1 ? closeAll : undefined}
          count={items.length}
          hideClose
          onCompleted={onCompleted}
          onOpenModels={onOpenModels}
        />
      </div>
    </div>
  );
}
