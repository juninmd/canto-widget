import { useState } from "react";

/** Session-only on purpose: forgetting it was left on only over-blurs, never under-protects on the next open. */
export function usePrivacyMode() {
  const [privacy, setPrivacy] = useState(false);
  return { privacy, togglePrivacy: () => setPrivacy((v) => !v) };
}
