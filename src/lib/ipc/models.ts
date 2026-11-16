import { invoke } from "@tauri-apps/api/core";

/** `price`: USD per 1M tokens (blended 3:1); `speed`: median output tokens/s; null when not measured. */
export type ModelRow = {
  id: string;
  name: string;
  creator: string;
  score: number;
  price: number | null;
  speed: number | null;
  rank: number;
  badge: "new" | "up" | null;
  /** The sheet below is null (or empty) for whatever the leaderboard page didn't carry. */
  input_price: number | null;
  output_price: number | null;
  /** Seconds to the first token. */
  ttft: number | null;
  /** Tokens. */
  context: number | null;
  /** `YYYY-MM-DD`. */
  released: string | null;
  open_weights: boolean | null;
  reasoning: boolean | null;
  coding: number | null;
  math: number | null;
  inputs: string[];
};
/** `throttled`: a manual refresh inside the 3 h floor, answered from the cache until `next_fetch_at`. */
export type ModelsView = {
  alerts: boolean;
  models: ModelRow[];
  total: number;
  fetched_at: number;
  next_fetch_at: number;
  throttled: boolean;
  error: string | null;
  /** Intelligence Index version the ranking follows, e.g. `5.0`. */
  index: string;
};

export const modelsApi = {
  /** Artificial Analysis ranking; Rust fetches at most once every 3 h, `force` included. */
  modelsGet: (force = false) => invoke<ModelsView>("models_get", { force }),
  modelsAlertsSet: (enabled: boolean) => invoke<boolean>("models_alerts_set", { enabled }),
};
