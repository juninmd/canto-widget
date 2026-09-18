import { useCallback, useEffect, useState } from "react";
import { api, errText, type GithubStatus } from "../lib/api";
import { NO_FILTER, visibleSections } from "../lib/github";
import { useGithubLists } from "../lib/useGithubLists";
import GithubConnect from "./GithubConnect";
import GithubFilterBar from "./GithubFilterBar";
import GithubSection from "./GithubSection";
import Skeleton from "./Skeleton";

export default function GithubTab({ onError }: { onError: (m: string) => void }) {
  const [status, setStatus] = useState<GithubStatus | null>(null);
  const [statusError, setStatusError] = useState("");
  const gh = useGithubLists();
  const { load, clear } = gh;

  const refresh = useCallback(async () => {
    setStatusError("");
    try {
      const s = await api.githubStatus();
      setStatus(s);
      if (s.connected) await load(NO_FILTER, false);
      else clear();
    } catch (e) {
      setStatusError(errText(e));
    }
  }, [load, clear]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function disconnect() {
    try {
      await api.githubDisconnect();
      await refresh();
    } catch (e) {
      onError(errText(e));
    }
  }

  if (!status) {
    return statusError ? <p className="text-xs text-danger">{statusError}</p> : <Skeleton label="carregando o GitHub" />;
  }
  if (!status.connected) return <GithubConnect device={status.device_flow} onConnected={() => void refresh()} />;

  const { lists } = gh;
  const filtered = gh.filter.text !== "" || gh.filter.kind !== "all";
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between text-[11px] text-faint">
        <span className="truncate">@{status.login}</span>
        <span className="flex gap-3">
          <button
            type="button"
            onClick={() => void gh.load(gh.filter, true)}
            disabled={gh.loading}
            className="min-h-6 underline decoration-dotted hover:text-muted"
          >
            {gh.loading ? "..." : "atualizar"}
          </button>
          <button type="button" onClick={() => void disconnect()} className="min-h-6 underline decoration-dotted hover:text-muted">
            desconectar
          </button>
        </span>
      </div>
      <GithubFilterBar filter={gh.filter} onApply={(f) => void gh.load(f, false)} />
      {gh.error && (
        <p role="alert" className="text-xs text-danger">
          {gh.error}
        </p>
      )}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {!lists && gh.loading && <Skeleton label="carregando issues e PRs" rows={4} />}
        {lists &&
          visibleSections(gh.filter.kind).map(({ key, title }) => (
            <GithubSection
              key={key}
              title={title}
              list={lists[key]}
              login={status.login}
              filtered={filtered}
              loadingMore={gh.loadingMore === key}
              onMore={() => void gh.more(key)}
            />
          ))}
      </div>
    </div>
  );
}
