import { useCallback, useEffect, useState } from "react";
import { api, errText, type GitlabStatus } from "../lib/api";
import { t } from "../i18n";
import { useForgeLists } from "../lib/useForgeLists";
import { useRefreshEvent } from "../lib/useRefreshEvent";
import { patchForgeCache, readForgeCache } from "../lib/forgeCache";
import ErrorBanner from "./ErrorBanner";
import ForgeBoard from "./ForgeBoard";
import GitlabConnect from "./GitlabConnect";
import Skeleton from "./Skeleton";

const SOURCE = { lists: api.gitlabLists, section: api.gitlabSection };

export default function GitlabTab({ onError }: { onError: (m: string) => void }) {
  const [status, setStatus] = useState<GitlabStatus | null>(() => readForgeCache("gitlab").status as GitlabStatus | null);
  const [statusError, setStatusError] = useState("");
  const gl = useForgeLists(SOURCE, "gitlab");
  const { load, clear, seedFilter, setError } = gl;

  const refresh = useCallback(async () => {
    setStatusError("");
    try {
      const s = await api.gitlabStatus();
      setStatus(s);
      patchForgeCache("gitlab", { status: s });
      if (s.connected) await load(seedFilter, true);
      else clear();
    } catch (e) {
      // With a cached board on screen the failure joins the board's banner instead of replacing it.
      if (readForgeCache("gitlab").status) setError(errText(e));
      else setStatusError(errText(e));
    }
  }, [load, clear, seedFilter, setError]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useRefreshEvent("gitlab", () => void (status?.connected ? gl.load(gl.filter, true, true) : refresh()));

  async function disconnect() {
    try {
      await api.gitlabDisconnect();
      await refresh();
    } catch (e) {
      onError(errText(e));
    }
  }

  if (!status) {
    return statusError ? <ErrorBanner message={statusError} onRetry={() => void refresh()} /> : <Skeleton label={t("gitlab.loading")} />;
  }
  if (!status.connected) return <GitlabConnect onConnected={() => void refresh()} />;
  const host = status.base_url.replace(/^https:\/\//, "");
  return <ForgeBoard forge="gitlab" login={status.username} host={host} lists={gl} onDisconnect={() => void disconnect()} />;
}
