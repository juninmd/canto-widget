import { CERT_WARN_DAYS, certDays } from "./health";
import type { HealthView } from "./healthTypes";

/** Down first, then slow, then a certificate about to expire, then waiting for a first reading, then fine. */
function rank(v: HealthView): number {
  if (v.health === "down") return 0;
  if (v.health === "slow") return 1;
  if (v.endpoint.kind === "dns" && (certDays(v.samples) ?? Infinity) <= CERT_WARN_DAYS) return 2;
  return v.health === "unknown" ? 3 : 4;
}

/** Stable: endpoints in the same rung keep the order the user added them in. */
export function worstFirst(views: HealthView[]): HealthView[] {
  return views
    .map((v, i) => ({ v, i, r: rank(v) }))
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .map((x) => x.v);
}
