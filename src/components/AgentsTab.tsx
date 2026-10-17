import { useCallback, useEffect, useState } from "react";
import { api, errText, type HarnessView } from "../lib/api";
import { installedCount } from "../lib/agents";
import { useRefreshEvent } from "../lib/useRefreshEvent";
import { t } from "../i18n";
import AgentRow from "./AgentRow";
import ErrorBanner from "./ErrorBanner";
import Skeleton from "./Skeleton";

const LINK = "canto-hit min-h-[24px] shrink-0 rounded-md px-1.5 hover:bg-hover hover:text-fg active:bg-active";

/** The coding-agent CLIs: which ones are installed here and what each one shipped last. */
export default function AgentsTab({ onError }: { onError: (m: string) => void }) {
  const [views, setViews] = useState<HarnessView[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (force: boolean) => {
    setLoading(true);
    try {
      setViews(await api.harnessList(force));
      setError("");
    } catch (e) {
      setError(errText(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(false);
  }, [load]);
  useRefreshEvent("agents", () => void load(false));

  if (views === null) {
    return error ? <ErrorBanner message={error} onRetry={() => void load(false)} /> : <Skeleton label={t("agents.loading")} rows={4} />;
  }

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <span className="min-w-0 truncate font-medium text-muted">
          {t("agents.header", { installed: installedCount(views), total: views.length })}
        </span>
        <button type="button" onClick={() => void load(true)} disabled={loading} title={t("agents.refreshTitle")} className={`${LINK} text-faint`}>
          {loading ? "..." : t("agents.refresh")}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
      {views.length === 0 ? (
        <p className="text-xs text-faint">{t("agents.empty")}</p>
      ) : (
        <ul className="flex flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
          {views.map((view) => (
            <AgentRow key={view.id} view={view} onError={onError} />
          ))}
        </ul>
      )}
      <p className="text-[10px] leading-snug text-faint">
        {t("agents.hint")} · {t("agents.source")}
      </p>
    </div>
  );
}
