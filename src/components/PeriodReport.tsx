import { t } from "../i18n";
import { useEffect, useMemo, useRef, useState } from "react";
import { MOD_KEY } from "../lib/platform";
import { api, errText, type AgendaItem, type ForgeOpened, type VaultPeriod } from "../lib/api";
import { periodBounds } from "../lib/period";
import { periodSummary } from "../lib/periodSummary";

const EMPTY: VaultPeriod = { done: [], done_total: 0, notes: [], notes_total: 0 };

/** Week or month report: vault, agenda and forges load independently, and a missing one only leaves its part out. */
export default function PeriodReport({
  period,
  today,
  onClose,
  onError,
}: {
  period: "week" | "month";
  today: string;
  onClose: () => void;
  onError: (m: string) => void;
}) {
  const bounds = useMemo(() => periodBounds(period, today), [period, today]);
  const [vault, setVault] = useState<VaultPeriod | null>(null);
  const [agenda, setAgenda] = useState<{ items: AgendaItem[]; error?: string } | null>(null);
  const [forges, setForges] = useState<ForgeOpened | null>(null);
  const [copied, setCopied] = useState(false);
  // A parent re-render hands a new onError; that must not refetch the whole period.
  const reportError = useRef(onError);
  reportError.current = onError;
  const text = useMemo(
    () => periodSummary(period, bounds, { vault: vault ?? EMPTY, agenda: agenda?.items ?? [], forges }),
    [period, bounds, vault, agenda, forges],
  );

  useEffect(() => {
    let live = true;
    const { fromDay, toDay, fromMs, toMs } = bounds;
    api
      .reportVault(fromDay, toDay, fromMs, toMs)
      .then((v) => live && setVault(v))
      .catch((e) => {
        if (!live) return;
        setVault(EMPTY);
        reportError.current(errText(e));
      });
    api
      .reportAgenda(fromMs, toMs)
      .then((items) => live && setAgenda({ items: items ?? [] }))
      .catch((e) => live && setAgenda({ items: [], error: errText(e) }));
    api
      .forgesActivityBetween(fromMs, toMs)
      .then((o) => live && setForges(o))
      .catch((e) => live && setForges({ items: [], errors: [errText(e)] }));
    return () => {
      live = false;
    };
  }, [bounds]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      onError(t("summary.copyFailed", { mod: MOD_KEY }));
    }
  }

  return (
    <section
      aria-label={t("report.heading")}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      className="flex min-h-0 flex-1 flex-col gap-2 motion-safe:animate-aba"
    >
      <pre className="min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap rounded-lg border border-edge bg-ink/60 p-2 font-sans text-xs text-fg select-text">
        {text}
      </pre>
      {(!vault || !agenda || !forges) && (
        <p role="status" className="text-[11px] text-faint">
          {t("report.loading")}
        </p>
      )}
      {agenda?.error && <p className="text-[11px] text-faint">{t("report.agendaError", { error: agenda.error })}</p>}
      {forges?.errors.map((e) => (
        <p key={e} className="text-[11px] text-faint">
          {t("summary.forgeError", { error: e })}
        </p>
      ))}
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => void copy()}
          className="flex-1 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-on-accent"
        >
          {copied ? t("summary.copied") : t("report.copy")}
        </button>
        <button type="button" onClick={onClose} title="Esc" className="rounded-lg bg-edge px-3 py-1.5 text-sm text-fg">
          {t("summary.back")}
        </button>
      </div>
    </section>
  );
}
