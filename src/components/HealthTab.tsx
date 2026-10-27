import { useCallback, useEffect, useRef, useState } from "react";
import { api, errText } from "../lib/api";
import type { HealthEndpoint, HealthView } from "../lib/healthTypes";
import { summarize } from "../lib/health";
import { worstFirst } from "../lib/healthSort";
import { useWindowVisible } from "../lib/useWindowVisible";
import { t } from "../i18n";
import HealthDetail from "./HealthDetail";
import HealthForm from "./HealthForm";
import HealthTile from "./HealthTile";
import Skeleton from "./Skeleton";
import StatePill from "./StatePill";
import StatusToolbar from "./StatusToolbar";

const POLL_MS = 10_000;
const ADD = "canto-hit min-h-[28px] shrink-0 whitespace-nowrap rounded-lg bg-accent px-3 text-xs font-semibold text-on-accent hover:opacity-90 active:opacity-80";

/** "Meus endpoints": a column of status tiles, worst first; the open one swaps places with its tile. */
export default function HealthTab({ toolbar }: { toolbar?: HTMLElement | null }) {
  const [views, setViews] = useState<HealthView[] | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const mounted = useRef(true);
  const visible = useWindowVisible();

  const apply = useCallback((list: HealthView[] | null | undefined) => {
    if (mounted.current && Array.isArray(list)) setViews(list);
  }, []);

  const run = useCallback(
    async (call: () => Promise<HealthView[]>) => {
      try {
        apply(await call());
        if (mounted.current) setError("");
      } catch (e) {
        if (mounted.current) setError(errText(e));
      }
    },
    [apply],
  );

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Only paints tiles: Rust's health watch keeps probing and alerting while hidden; back on screen, read at once.
  useEffect(() => {
    if (!visible) return;
    void run(api.healthList);
    const timer = setInterval(() => void run(api.healthList), POLL_MS);
    return () => clearInterval(timer);
  }, [run, visible]);

  const save = (e: HealthEndpoint) => run(() => api.healthSave(e));
  const sum = views ? summarize(views) : null;
  const startAdding = () => {
    setAdding(true);
    setOpen(null);
  };

  return (
    <div className="flex h-full flex-col gap-2">
      <StatusToolbar host={toolbar}>
        <button type="button" aria-expanded={adding} onClick={startAdding} className={ADD}>
          {t("uiStatus.add")}
        </button>
      </StatusToolbar>
      <p className="text-[11.5px] text-faint">{t("health.header")}</p>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
        {views === null || sum === null ? (
          <Skeleton label={t("health.loading")} rows={3} />
        ) : (
          <>
            {adding && (
              <HealthForm
                onCancel={() => setAdding(false)}
                onSave={(e) => {
                  setAdding(false);
                  void save(e);
                }}
              />
            )}
            {views.length > 0 && (
              <div role="group" aria-label={t("uiStatus.pills.label")} className="flex flex-wrap items-center gap-1.5 rounded-xl border border-edge bg-panel px-3 py-2.5">
                <StatePill tone={sum.down > 0 ? "bad" : "ok"}>{t("uiStatus.pill.down", { n: sum.down })}</StatePill>
                <StatePill tone={sum.slow > 0 ? "warn" : "ok"}>{t("uiStatus.pill.slow", { n: sum.slow })}</StatePill>
                <StatePill tone={sum.cert > 0 ? "warn" : "ok"}>{t("uiStatus.pill.cert", { n: sum.cert })}</StatePill>
                <span className="ml-auto text-[11px] text-faint">{t("uiStatus.count", { n: views.length })}</span>
              </div>
            )}
            {worstFirst(views).map((v) =>
              open === v.endpoint.id ? (
                <HealthDetail
                  key={v.endpoint.id}
                  view={v}
                  busy={busy}
                  onClose={() => setOpen(null)}
                  onChange={(e) => void save(e)}
                  onCheck={() => {
                    setBusy(true);
                    void run(() => api.healthCheckNow(v.endpoint.id)).finally(() => mounted.current && setBusy(false));
                  }}
                  onRemove={() => {
                    setOpen(null);
                    void run(() => api.healthRemove(v.endpoint.id));
                  }}
                />
              ) : (
                <HealthTile
                  key={v.endpoint.id}
                  view={v}
                  onOpen={() => {
                    setOpen(v.endpoint.id);
                    setAdding(false);
                  }}
                />
              ),
            )}
            {views.length === 0 && !adding && (
              <div className="flex flex-col items-center gap-3 px-2 py-6 text-center">
                <p className="text-xs text-faint">{t("health.empty")}</p>
                <button type="button" onClick={startAdding} className={ADD}>
                  {t("uiStatus.emptyAdd")}
                </button>
              </div>
            )}
          </>
        )}
        <p className="mt-1 text-[10px] leading-snug text-faint">{t("health.hint")}</p>
      </div>
    </div>
  );
}
