import { useCallback, useEffect, useState } from "react";
import { api, errText, type GitlabStatus } from "../lib/api";
import { NO_FILTER } from "../lib/forge";
import { useForgeLists } from "../lib/useForgeLists";
import ForgeBoard from "./ForgeBoard";
import GitlabConnect from "./GitlabConnect";
import Skeleton from "./Skeleton";

const SOURCE = { lists: api.gitlabLists, section: api.gitlabSection };

export default function GitlabTab({ onError }: { onError: (m: string) => void }) {
  const [status, setStatus] = useState<GitlabStatus | null>(null);
  const [statusError, setStatusError] = useState("");
  const gl = useForgeLists(SOURCE);
  const { load, clear } = gl;

  const refresh = useCallback(async () => {
    setStatusError("");
    try {
      const s = await api.gitlabStatus();
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
      await api.gitlabDisconnect();
      await refresh();
    } catch (e) {
      onError(errText(e));
    }
  }

  if (!status) {
    return statusError ? <p className="text-xs text-danger">{statusError}</p> : <Skeleton label="carregando o GitLab" />;
  }
  if (!status.connected) return <GitlabConnect onConnected={() => void refresh()} />;
  const host = status.base_url.replace(/^https:\/\//, "");
  return <ForgeBoard forge="gitlab" login={status.username} host={host} lists={gl} onDisconnect={() => void disconnect()} />;
}
