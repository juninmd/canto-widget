import { api } from "./api";

/** "MM:SS", or "H:MM:SS" past the hour. */
export function clock(secs: number): string {
  const s = Math.max(0, Math.floor(secs));
  const [h, m, r] = [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60];
  const mm = String(m).padStart(2, "0");
  const rr = String(r).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${rr}` : `${mm}:${rr}`;
}

export const minutesOf = (secs: number) => Math.floor(secs / 60);

export const isOver = (secs: number, estimateMin?: number | null) => !!estimateMin && secs > estimateMin * 60;

/** Estimates worth a chip; anything else is one of these or none. */
export const ESTIMATES = [15, 25, 45, 60, 90] as const;

export type Running = {
  id: string;
  title: string;
  estimateMin: number | null;
  /** Seconds already in the vault when this run began. */
  savedSecs: number;
  /** Wall-clock ms of the last successful flush; only advances by whole seconds, so no time is lost. */
  flushedAt: number;
  /** Ring the "over the estimate" nudge once per run. */
  nudged: boolean;
};

type Deps = { add: (id: string, secs: number) => Promise<unknown>; now: () => number; every: number };

/**
 * One task runs at a time. Time is counted from the wall clock (a hidden webview's timers sleep) and
 * flushed to the vault every minute and on pause, so a crash loses at most a minute.
 */
export function createFocusStore(deps: Deps) {
  let running: Running | null = null;
  let timer: ReturnType<typeof setInterval> | undefined;
  const listeners = new Set<() => void>();
  let onError: (e: unknown) => void = () => {};
  let onSaved: () => void = () => {};
  const emit = (next: Running | null) => {
    running = next;
    listeners.forEach((l) => l());
  };
  const pending = (r: Running) => Math.max(0, Math.floor((deps.now() - r.flushedAt) / 1000));

  /** Seconds this run has added on top of what the vault already holds. */
  const unflushed = () => (running ? pending(running) : 0);
  const totalSecs = () => (running ? running.savedSecs + pending(running) : 0);

  async function flush(announce: boolean) {
    const r = running;
    if (!r) return;
    const secs = pending(r);
    if (secs === 0) return;
    try {
      await deps.add(r.id, secs);
    } catch (e) {
      onError(e);
      return;
    }
    if (running?.id === r.id) emit({ ...running, savedSecs: running.savedSecs + secs, flushedAt: running.flushedAt + secs * 1000 });
    if (announce) onSaved();
  }

  return {
    subscribe(l: () => void) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    get: () => running,
    unflushed,
    totalSecs,
    setHandlers(h: { onError?: (e: unknown) => void; onSaved?: () => void }) {
      onError = h.onError ?? onError;
      onSaved = h.onSaved ?? onSaved;
    },
    async start(task: { id: string; title: string; estimateMin?: number | null; trackedSecs?: number }) {
      if (running?.id === task.id) return;
      await this.stop();
      emit({
        id: task.id,
        title: task.title,
        estimateMin: task.estimateMin ?? null,
        savedSecs: task.trackedSecs ?? 0,
        flushedAt: deps.now(),
        nudged: false,
      });
      timer = setInterval(() => void flush(false), deps.every);
    },
    /** Keeps the estimate in sync when it is edited while the task runs. */
    setEstimate(id: string, estimateMin: number | null) {
      if (running?.id === id) emit({ ...running, estimateMin });
    },
    markNudged() {
      if (running) emit({ ...running, nudged: true });
    },
    async stop() {
      clearInterval(timer);
      await flush(true);
      emit(null);
    },
    /** For a vault that just locked: nothing can be saved, and the last minute is the price. */
    discard() {
      clearInterval(timer);
      emit(null);
    },
  };
}

export const focusStore = createFocusStore({ add: api.taskAddTime, now: Date.now, every: 60_000 });
