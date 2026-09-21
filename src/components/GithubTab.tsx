import { useCallback, useEffect, useState } from "react";
import { api, errText, type GithubStatus } from "../lib/api";
import { NO_FILTER } from "../lib/forge";
import { useForgeLists } from "../lib/useForgeLists";
import ForgeBoard from "./ForgeBoard";
import GithubConnect from "./GithubConnect";
import Skeleton from "./Skeleton";

const SOURCE = { lists: api.githubLists, section: api.githubSection };

export default function GithubTab({ onError }: { onError: (m: string) => void }) {
  const [status, setStatus] = useState<GithubStatus | null>(null);
  const [statusError, setStatusError] = useState("");
  const gh = useForgeLists(SOURCE);
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
  return <ForgeBoard forge="github" login={status.login} lists={gh} onDisconnect={() => void disconnect()} />;
}
