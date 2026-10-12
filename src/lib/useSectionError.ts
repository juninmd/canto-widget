import { useState } from "react";
import { errText } from "./api";

/** A section that fails to save says so next to its own controls; the global handler still gets it. */
export function useSectionError(onError: (m: string) => void) {
  const [error, setError] = useState("");
  return {
    error,
    clear: () => setError(""),
    fail: (e: unknown) => {
      const message = errText(e);
      setError(message);
      onError(message);
    },
  };
}
