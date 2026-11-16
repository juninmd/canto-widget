import { invoke } from "@tauri-apps/api/core";

export type ClipMode = "json_pretty" | "json_compact" | "one_line" | "upper" | "lower";
// `preview` is the first 500 characters; copying fetches the stored text in Rust.
export type ClipItem = { id: string; preview: string; chars: number; kept: number; truncated: boolean; copied_at: number; pinned: boolean };
/** `revision` is absent from older backends and mocks; then every poll refetches. */
export type ClipList = { items: ClipItem[]; max_pinned: number; revision?: string };

export const clipboardApi = {
  clipList: (query: string) => invoke<ClipList>("clip_list", { query }),
  /** A stamp of the history that costs one `stat`; the list is only fetched (and decrypted) again when it moves. */
  clipRevision: () => invoke<string | null>("clip_revision"),
  /** Phones only: reads the clipboard once; the desktop watches it in the background. */
  clipCapture: () => invoke<void>("clip_capture"),
  clipCopy: (id: string) => invoke<void>("clip_copy", { id }),
  /** Copies the item rewritten by `mode` (see `clipTransforms`); the history entry stays as it was. */
  clipCopyAs: (id: string, mode: ClipMode) => invoke<void>("clip_copy_as", { id, mode }),
  clipPin: (id: string) => invoke<void>("clip_pin", { id }),
  clipDelete: (id: string) => invoke<string | null>("clip_delete", { id }),
  clipClear: () => invoke<string | null>("clip_clear"),
  clipSetMaxPinned: (max: number) => invoke<void>("clip_set_max_pinned", { max }),
};
