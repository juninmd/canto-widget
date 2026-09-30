import { useEffect } from "react";
import { t } from "../i18n";
import { api, errText } from "../lib/api";
import { clock, focusStore, isOver } from "../lib/focus";
import { readNudge } from "../lib/focusNudge";
import { useRunning, useTick } from "../lib/useFocus";
import { useToast } from "../lib/toast";

/** Pinned under every tab while a task is in focus: the clock, the estimate, pause and done. */
export default function FocusBar({ onDone, onError }: { onDone: () => void; onError: (m: string) => void }) {
  const run = useRunning();
  const notify = useToast();
  useTick(run !== null);
  const secs = run ? focusStore.totalSecs() : 0;
  const over = run !== null && isOver(secs, run.estimateMin);

  useEffect(() => {
    if (!run || !over || run.nudged) return;
    focusStore.markNudged();
    if (readNudge()) notify({ message: t("focus.overNudge", { title: run.title }) });
  }, [run, over, notify]);

  if (!run) return null;
  const pct = run.estimateMin ? Math.min(100, (secs / (run.estimateMin * 60)) * 100) : 0;

  async function finish() {
    const id = run!.id;
    await focusStore.stop();
    try {
      await api.taskComplete(id);
    } catch (e) {
      onError(errText(e));
    }
    onDone();
  }

  return (
    <section aria-label={t("focus.barLabel")} className="shrink-0 border-t border-edge bg-ink/60">
      {run.estimateMin && (
        <div className="h-0.5 bg-edge" role="presentation">
          <div className={`h-full ${over ? "bg-danger" : "bg-accent"}`} style={{ width: `${pct}%` }} />
        </div>
      )}
      <div className="flex items-center gap-2 px-3 py-1.5 text-xs">
        <span className="shrink-0 rounded-full border border-accent px-1.5 text-[10px] text-accent">{t("focus.badge")}</span>
        <span className="min-w-0 flex-1 truncate text-fg">{run.title}</span>
        <span className={`shrink-0 font-mono tabular-nums ${over ? "text-danger" : "text-accent"}`} role="timer">
          {clock(secs)}
          {run.estimateMin ? ` / ${run.estimateMin} min` : ""}
        </span>
        <button type="button" onClick={() => void focusStore.stop()} className="min-h-6 shrink-0 rounded border border-line px-2 hover:text-fg">
          {t("focus.pauseButton")}
        </button>
        <button type="button" onClick={() => void finish()} className="min-h-6 shrink-0 rounded border border-line px-2 hover:text-fg">
          {t("focus.doneButton")}
        </button>
      </div>
    </section>
  );
}
