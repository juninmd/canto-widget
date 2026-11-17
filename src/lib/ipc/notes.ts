import { invoke } from "@tauri-apps/api/core";

export type NoteLink = { kind: "task"; id: string; label: string } | { kind: "event"; id: string; label: string };
export type Note = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  created_at: number;
  updated_at: number;
  fixada?: boolean;
  link?: NoteLink | null;
};
export type NotesPage = { total: number; items: Note[] };
export type KeepImport = { imported: number; duplicates: number; skipped: number };

export const notesApi = {
  notesSearch: (query: string, limit: number) => invoke<NotesPage>("notes_search", { query, limit }),
  noteSave: (note: { id?: string; title: string; body: string; tags: string[]; link?: NoteLink | null }) =>
    invoke<Note>("note_save", { id: note.id ?? null, link: note.link ?? null, ...note }),
  /** Returns whether the note ended up pinned. */
  notePin: (id: string) => invoke<boolean>("note_pin", { id }),
  /** Opens a native save dialog; `null` when the user cancels. */
  noteExportMd: (id: string) => invoke<string | null>("note_export_md", { id }),
  /** Opens a native picker for Takeout's Keep .json files; `null` when the user cancels. */
  notesImportKeep: () => invoke<KeepImport | null>("notes_import_keep"),
  /** Seals a pasted/dropped image (base64, no `data:` prefix) and returns its id for `canto-img:<id>`. */
  noteImageSave: (data: string) => invoke<string>("note_image_save", { data }),
  /** A `data:image/...;base64,` URL; rejects with "imagem indisponível" when missing. */
  noteImageGet: (id: string) => invoke<string>("note_image_get", { id }),
  /** Returns the key for `trashUndo`, or `null` if nothing was removed. */
  itemDelete: (id: string) => invoke<string | null>("item_delete", { id }),
  trashUndo: (key: string) => invoke<boolean>("trash_undo", { key }),
};
