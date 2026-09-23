import { useEffect, useState } from "react";
import { api, errText, type GeminiDoc } from "../lib/api";
import { LOCALE, t } from "../i18n";
import Skeleton from "./Skeleton";

const DAYS = 14;

export function geminiWindow(now = new Date()): { timeMin: string; timeMax: string } {
  return { timeMin: new Date(now.getTime() - DAYS * 86_400_000).toISOString(), timeMax: now.toISOString() };
}

/** An all-day "YYYY-MM-DD" parsed as a Date is UTC midnight, which is the previous day in Brazil. */
function day(start: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(start)) return start.split("-").reverse().join("/");
  const d = new Date(start);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString(LOCALE);
}

/** Gemini keeps its notes in the organizer's Drive; the Calendar attachment is the link that reaches them. */
export default function GeminiDocs({ query }: { query: string }) {
  const [docs, setDocs] = useState<GeminiDoc[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    const { timeMin, timeMax } = geminiWindow();
    api.geminiDocs(timeMin, timeMax).then(
      (d) => alive && setDocs(d ?? []),
      (e) => {
        if (!alive) return;
        setError(errText(e));
        setDocs([]);
      },
    );
    return () => {
      alive = false;
    };
  }, []);

  const q = query.trim().toLowerCase();
  const shown = (docs ?? []).filter((d) => !q || `${d.meeting} ${d.title}`.toLowerCase().includes(q));

  return (
    <section aria-label={t("gemini.heading")} className="mb-3">
      <h3 className="mb-1 text-xs font-semibold text-fg">
        {t("gemini.heading")} <span className="font-normal text-faint">{t("gemini.lastDays", { days: DAYS })}</span>
      </h3>
      {docs === null ? (
        <Skeleton label={t("gemini.loading")} rows={2} />
      ) : error ? (
        <p className="px-2 py-1 text-[11px] text-faint">{t("gemini.unavailable", { error })}</p>
      ) : shown.length === 0 ? (
        <p className="px-2 py-1 text-[11px] text-faint">
          {q ? t("gemini.noMatch") : t("gemini.empty", { days: DAYS })}
        </p>
      ) : (
        <ul className="space-y-1.5">
          {shown.map((d) => (
            <li key={d.url}>
              <button
                type="button"
                onClick={() => void api.openLink(d.url)}
                title={d.url}
                className="w-full rounded-lg border border-edge bg-ink/60 p-2 text-left hover:border-line"
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-medium text-fg">{d.meeting}</span>
                  <span className="shrink-0 text-[11px] text-faint">{day(d.start)}</span>
                </span>
                <span className="block truncate text-[11px] text-muted">📄 {d.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
