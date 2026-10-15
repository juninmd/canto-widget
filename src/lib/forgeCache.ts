import type { ForgeFilter, ForgeLists } from "./api";
import type { Forge } from "./forge";
import { NO_FILTER } from "./forge";

/** What a forge tab showed last time, so coming back paints it at once while the refresh runs. */
export type ForgeSnapshot = { status: unknown; lists: ForgeLists | null; filter: ForgeFilter };

const EMPTY: ForgeSnapshot = { status: null, lists: null, filter: NO_FILTER };
const cache = new Map<Forge, ForgeSnapshot>();

export const readForgeCache = (forge: Forge): ForgeSnapshot => cache.get(forge) ?? EMPTY;

export function patchForgeCache(forge: Forge, patch: Partial<ForgeSnapshot>) {
  cache.set(forge, { ...readForgeCache(forge), ...patch });
}

export const clearForgeCache = (forge?: Forge) => (forge ? cache.delete(forge) : cache.clear());
