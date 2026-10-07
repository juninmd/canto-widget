import { useCallback, useEffect, useRef, useState } from "react";
import { api, errText } from "../lib/api";
import type { HealthEndpoint, HealthView } from "../lib/healthTypes";
import { summarize } from "../lib/health";
import { t } from "../i18n";
import HealthDetail from "./HealthDetail";
import HealthForm from "./HealthForm";
import HealthTile from "./HealthTile";
import Skeleton from "./Skeleton";

const POLL_MS = 10_000;

/** "Meus endpoints": a grid of status tiles; the open one stretches over the row like a list item. */
export default function HealthTab() {
  const [views, setViews] = useState<HealthView[] | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const mounted = useRef(true);

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
    void run(api.healthList);
    const timer = setInterval(() => void run(api.healthList), POLL_MS);
    return () => {
      mounted.current = false;
      clearInterval(timer);
    };
  }, [run]);

  const save = (e: HealthEndpoint) => run(() => api.healthSave(e));
  const sum = views ? summarize(views) : null;
  const trouble = sum ? sum.down + sum.slow + sum.cert : 0;

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between gap-2 text-[11px] text-faint">
        <span className={trouble > 0 ? "font-semibold text-danger" : ""}>
          {sum === null ? t("health.header") : trouble === 0 ? t("health.summary.ok") : t("health.summary.problems", sum)}
        </span>
        <button
          type="button"
          onClick={() => {
            setAdding(true);
            setOpen(null);
          }}
          className="canto-hit min-h-[24px] shrink-0 whitespace-nowrap rounded-md px-1.5 text-accent-text hover:bg-hover active:bg-active"
        >
          {t("health.add")}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
      <div className="flex-1 overflow-y-auto pr-1">
        {views === null ? (
          <Skeleton label={t("health.loading")} rows={3} />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {views.map((v) =>
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
            {adding ? (
              <HealthForm
                onCancel={() => setAdding(false)}
                onSave={(e) => {
                  setAdding(false);
                  void save(e);
                }}
              />
            ) : (
              views.length === 0 && <p className="col-span-2 px-2 py-6 text-center text-xs text-faint">{t("health.empty")}</p>
            )}
          </div>
        )}
        <p className="mt-3 text-[10px] leading-snug text-faint">{t("health.hint")}</p>
      </div>
    </div>
  );
}
