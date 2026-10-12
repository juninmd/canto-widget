import { useEffect, useState } from "react";
import { api } from "./api";

/** null while unknown: a failed check shows no hint rather than a wrong one. */
export function useGithubConnected(): boolean | null {
  const [connected, setConnected] = useState<boolean | null>(null);
  useEffect(() => {
    let alive = true;
    // The call is wrapped so a synchronous failure also lands in the catch.
    Promise.resolve()
      .then(() => api.githubStatus())
      .then(
        (s) => alive && setConnected(typeof s?.connected === "boolean" ? s.connected : null),
        () => {},
      );
    return () => {
      alive = false;
    };
  }, []);
  return connected;
}
