import { invoke } from "@tauri-apps/api/core";

/** `dia` da semanal: 0 = domingo ... 6 = sábado. */
export type Repetir = { tipo: "diaria" } | { tipo: "dias_uteis" } | { tipo: "semanal"; dia: number };

export type Task = {
  id: string;
  title: string;
  done: boolean;
  day: string;
  created_at: number;
  updated_at: number;
  /** "HH:MM" local do lembrete. */
  hora?: string | null;
  repetir?: Repetir | null;
  serie?: string | null;
};

export type Note = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  created_at: number;
  updated_at: number;
  fixada?: boolean;
};

export type VaultStatus = { exists: boolean; unlocked: boolean };
export type StatusBiometria = { disponivel: boolean; ativa: boolean; nome: string };
export type JanelaCfg = { posicao: [number, number] | null; tamanho: [number, number] | null; sempre_no_topo: boolean };

/// Dia local do usuario em YYYY-MM-DD. Fica no frontend porque o fuso do
/// processo Rust nao e confiavel em Linux multithread.
export function todayLocal(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
export type DriveStatus = {
  configured: boolean;
  embutido?: boolean;
  connected: boolean;
  email: string;
  nome?: string;
  /** Foto da conta como `data:` URL, ou vazia. */
  avatar?: string;
};
export type ResumoImport = { tarefas: number; notas: number };

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
  /** Marca como feita sem alternar: repetir não reabre. */
  taskConcluir: (id: string) => invoke<void>("task_concluir", { id }),
  taskRename: (id: string, title: string) => invoke<void>("task_rename", { id, title }),
  carryOver: (day: string) => invoke<number>("tasks_carry_over", { day }),
  taskSetDetalhes: (id: string, hora: string | null, repetir: Repetir | null) =>
    invoke<void>("task_set_detalhes", { id, hora, repetir }),
  /** Vigia de fundo: não adia o auto-lock; trancado devolve lista vazia. */
  tasksLembretes: (day: string) => invoke<Task[]>("tasks_lembretes", { day }),

  notesSearch: (query: string) => invoke<Note[]>("notes_search", { query }),
  noteSave: (note: { id?: string; title: string; body: string; tags: string[] }) =>
    invoke<Note>("note_save", { id: note.id ?? null, ...note }),
  /** Devolve se a nota ficou fixada. */
  notePin: (id: string) => invoke<boolean>("note_pin", { id }),
  /** Devolve a chave de `lixeiraDesfazer`, ou `null` se nada foi removido. */
  itemDelete: (id: string) => invoke<string | null>("item_delete", { id }),
  lixeiraDesfazer: (chave: string) => invoke<boolean>("lixeira_desfazer", { chave }),

  biometriaStatus: () => invoke<StatusBiometria>("biometria_status"),
  biometriaAtivar: () => invoke<void>("biometria_ativar"),
  biometriaDesbloquear: () => invoke<void>("biometria_desbloquear"),
  biometriaDesativar: () => invoke<void>("biometria_desativar"),

  janelaConfig: () => invoke<JanelaCfg>("janela_config"),
  janelaSempreNoTopo: (ativo: boolean) => invoke<void>("janela_sempre_no_topo", { ativo }),
  janelaRestaurar: () => invoke<void>("janela_restaurar"),

  autostartStatus: () => invoke<boolean>("autostart_status"),
  autostartSet: (enabled: boolean) => invoke<void>("autostart_set", { enabled }),

  /** `null` quando o usuario cancela o dialogo. */
  backupExportar: () => invoke<string | null>("backup_exportar"),
  backupImportar: () => invoke<ResumoImport | null>("backup_importar"),

  driveStatus: () => invoke<DriveStatus>("drive_status"),
  driveConfigure: (clientId: string, clientSecret: string) =>
    invoke<void>("drive_configure", { clientId, clientSecret }),
  driveConnect: () => invoke<string>("drive_connect"),
  driveDisconnect: () => invoke<void>("drive_disconnect"),

  clipList: (query: string) => invoke<ClipItem[]>("clip_list", { query }),
  clipCopy: (id: string) => invoke<void>("clip_copy", { id }),
  clipPin: (id: string) => invoke<void>("clip_pin", { id }),
  clipDelete: (id: string) => invoke<string | null>("clip_delete", { id }),
  clipClear: () => invoke<string | null>("clip_clear"),

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
