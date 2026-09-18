import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { exitDuration } from "./motion";

export type Toast = {
  message: string;
  type?: "info" | "erro";
  action?: { label: string; run: () => void };
};

type ActiveToast = Toast & { id: number };

const MAX_VISIBLE = 3;
export const INFO_DURATION_MS = 6000;

const ToastContext = createContext<((a: Toast) => void) | null>(null);

export function useToast(): (a: Toast) => void {
  const notify = useContext(ToastContext);
  if (!notify) throw new Error("useToast outside ToastProvider");
  return notify;
}

export function ToastProvider({ children, durationMs = INFO_DURATION_MS }: { children: ReactNode; durationMs?: number }) {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);
  const nextId = useRef(1);

  const close = useCallback((id: number) => setToasts((l) => l.filter((a) => a.id !== id)), []);

  const notify = useCallback((a: Toast) => {
    setToasts((l) => {
      // Polling that fails the same way every time (clipboard every 2.5s) can't stack the same toast.
      if (!a.action && l.some((x) => !x.action && x.message === a.message && x.type === a.type)) return l;
      return [...l, { ...a, id: nextId.current++ }].slice(-MAX_VISIBLE);
    });
  }, []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="pointer-events-none absolute inset-x-3 bottom-3 z-40 flex flex-col gap-2">
        {/* Separate regions: an error interrupts the screen reader, the rest wait their turn. */}
        <div role="alert" className="flex flex-col gap-2">
          {toasts.filter((a) => a.type === "erro").map((a) => (
            <ToastItem key={a.id} toast={a} close={close} durationMs={null} />
          ))}
        </div>
        <div role="status" className="flex flex-col gap-2">
          {toasts.filter((a) => a.type !== "erro").map((a) => (
            <ToastItem key={a.id} toast={a} close={close} durationMs={durationMs} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

/** `durationMs` null: an error stays until dismissed, to give time to read it (NN/g). */
function ToastItem({ toast, close, durationMs }: { toast: ActiveToast; close: (id: number) => void; durationMs: number | null }) {
  const [paused, setPaused] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const { id } = toast;

  // Leaves with an exit animation before unmounting; with reduced motion requested, it vanishes at once.
  const dismiss = useCallback(() => {
    const ms = exitDuration();
    if (!ms) return close(id);
    setLeaving(true);
    setTimeout(() => close(id), ms);
  }, [close, id]);

  // Pauses on hover or focus: an adjustable deadline (WCAG 2.2.1).
  useEffect(() => {
    if (durationMs === null || paused) return;
    // Stable dependencies: a new toast arriving doesn't reset the others' deadline.
    const t = setTimeout(dismiss, durationMs);
    return () => clearTimeout(t);
  }, [durationMs, paused, dismiss]);

  const isError = toast.type === "erro";
  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={`pointer-events-auto flex items-center gap-2 rounded-lg border bg-ink px-3 py-1.5 text-xs text-fg shadow-lg ${
        isError ? "border-danger" : "border-line"
      } ${leaving ? "pointer-events-none motion-safe:animate-baixar" : "motion-safe:animate-entrar motion-reduce:animate-fade"}`}
    >
      <span className={`min-w-0 flex-1 break-words ${isError ? "text-danger" : ""}`}>{toast.message}</span>
      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action!.run();
            dismiss();
          }}
          className="min-h-6 shrink-0 rounded px-2 font-semibold text-accent hover:bg-edge"
        >
          {toast.action.label}
        </button>
      )}
      <button
        type="button"
        onClick={dismiss}
        aria-label="fechar aviso"
        className="grid size-6 shrink-0 place-items-center rounded text-muted hover:text-fg"
      >
        ×
      </button>
    </div>
  );
}
