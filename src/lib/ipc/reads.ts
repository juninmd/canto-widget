import { invoke } from "@tauri-apps/api/core";

/** One card in the Leituras tab; `has_image` only says a thumbnail exists (the bytes come by id). */
export type ReadArticle = {
  id: string;
  title: string;
  url: string;
  host: string;
  source: string;
  /** ms epoch; 0 when the entry carries no date. */
  published_at: number;
  summary: string;
  unread: boolean;
  has_image: boolean;
};
export type ReadFeed = { url: string; label: string; error: string | null };
export type ReadsView = { feeds: ReadFeed[]; items: ReadArticle[]; fetched_at: number };

export const readsApi = {
  /** Leituras: the saved feeds, newest first; thumbnails and favicons come as `data:` URLs, by id/host. */
  readsGet: (force = false) => invoke<ReadsView>("reads_get", { force }),
  /** The address is checked and parsed before it is saved. */
  readsAdd: (feed: string) => invoke<ReadsView>("reads_add", { feed }),
  readsRemove: (feed: string) => invoke<ReadsView>("reads_remove", { feed }),
  readsMark: (id: string, read: boolean) => invoke<ReadsView>("reads_mark", { id, read }),
  readsThumb: (id: string) => invoke<string | null>("reads_thumb", { id }),
  readsFavicon: (host: string) => invoke<string | null>("reads_favicon", { host }),
};
