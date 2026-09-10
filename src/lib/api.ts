import { invoke } from "@tauri-apps/api/core";

export type Task = {
  id: string;
  title: string;
  done: boolean;
  day: string;
  created_at: number;
  updated_at: number;
};

export type Note = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  created_at: number;
  updated_at: number;
};

export type VaultStatus = { exists: boolean; unlocked: boolean };

/// Dia local do usuario em YYYY-MM-DD. Fica no frontend porque o fuso do
/// processo Rust nao e confiavel em Linux multithread.
export function todayLocal(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
export type DriveStatus = { configured: boolean; connected: boolean; email: string };

export type ClipItem = { id: string; text: string; copied_at: number; pinned: boolean };
export type TranscriptMeta = { name: string; modified_at: number; size: number; preview: string };
export type AgendaItem = {
  id: string;
  titulo: string;
  inicio: string;
  fim: string;
  dia_inteiro: boolean;
  local: string;
  meet: string;
  link: string;
};

export const api = {
  status: () => invoke<VaultStatus>("vault_status"),
  create: (password: string) => invoke<void>("vault_create", { password }),
  unlock: (password: string) => invoke<void>("vault_unlock", { password }),
  lock: () => invoke<void>("vault_lock"),
  touch: () => invoke<void>("vault_touch"),

  tasksForDay: (day: string) => invoke<Task[]>("tasks_for_day", { day }),
  taskAdd: (title: string, day: string) => invoke<Task>("task_add", { title, day }),
  taskToggle: (id: string) => invoke<void>("task_toggle", { id }),
  taskRename: (id: string, title: string) => invoke<void>("task_rename", { id, title }),
  carryOver: (day: string) => invoke<number>("tasks_carry_over", { day }),

  notesSearch: (query: string) => invoke<Note[]>("notes_search", { query }),
  noteSave: (note: { id?: string; title: string; body: string; tags: string[] }) =>
    invoke<Note>("note_save", { id: note.id ?? null, ...note }),
  itemDelete: (id: string) => invoke<void>("item_delete", { id }),

  driveStatus: () => invoke<DriveStatus>("drive_status"),
  driveConfigure: (clientId: string, clientSecret: string) =>
    invoke<void>("drive_configure", { clientId, clientSecret }),
  driveConnect: () => invoke<string>("drive_connect"),
  driveDisconnect: () => invoke<void>("drive_disconnect"),
  driveSync: () => invoke<number>("drive_sync"),

  clipList: (query: string) => invoke<ClipItem[]>("clip_list", { query }),
  clipCopy: (id: string) => invoke<void>("clip_copy", { id }),
  clipPin: (id: string) => invoke<void>("clip_pin", { id }),
  clipDelete: (id: string) => invoke<void>("clip_delete", { id }),
  clipClear: () => invoke<void>("clip_clear"),

  transcriptsDir: () => invoke<string>("transcripts_dir"),
  transcriptsSetDir: (dir: string) => invoke<void>("transcripts_set_dir", { dir }),
  transcriptsList: (query: string) => invoke<TranscriptMeta[]>("transcripts_list", { query }),
  transcriptRead: (name: string) => invoke<string>("transcript_read", { name }),

  agendaToday: (timeMin: string, timeMax: string) =>
    invoke<AgendaItem[]>("agenda_today", { timeMin, timeMax }),
  alertaAbrir: (evento: AgendaItem) => invoke<void>("alerta_abrir", { evento }),
  alertaPayload: () => invoke<AgendaItem | null>("alerta_payload"),
  alertaFechar: () => invoke<void>("alerta_fechar"),
  abrirLink: (url: string) => invoke<void>("abrir_link", { url }),
};

export function errText(e: unknown): string {
  return typeof e === "string" ? e : e instanceof Error ? e.message : "erro inesperado";
}
