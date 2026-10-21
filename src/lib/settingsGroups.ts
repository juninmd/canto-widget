export type GroupId = "appearance" | "notifications" | "privacy" | "data" | "app";

export type SectionId =
  | "skin" | "density" | "language" | "tabs"
  | "reminders" | "digest" | "dnd" | "fullscreen" | "reviewAlerts" | "myPrAlerts"
  | "activity" | "focus" | "security"
  | "google" | "clipboard" | "backup" | "sync"
  | "window" | "autostart" | "shortcuts" | "update";

type Group = { id: GroupId; sections: SectionId[]; sensitive: SectionId[] };

/** Password, backup and sync sit apart in each group, under "Zona sensível". */
export const GROUPS: Group[] = [
  { id: "appearance", sections: ["skin", "density", "language", "tabs"], sensitive: [] },
  { id: "notifications", sections: ["reminders", "digest", "dnd", "fullscreen", "reviewAlerts", "myPrAlerts"], sensitive: [] },
  { id: "privacy", sections: ["activity", "focus"], sensitive: ["security"] },
  { id: "data", sections: ["google", "clipboard"], sensitive: ["backup", "sync"] },
  { id: "app", sections: ["window", "autostart", "shortcuts", "update"], sensitive: [] },
];

/** Search terms in both languages, so "tema" and "theme" find the same setting whatever the UI language. */
const KEYWORDS: Record<SectionId, string> = {
  skin: "tema skin cor cores aparência theme color appearance",
  density: "densidade compacto espaçamento tamanho density compact spacing size",
  language: "idioma língua português inglês language english",
  tabs: "abas esconder ocultar tabs hide layout vertical horizontal lateral barra",
  reminders: "lembrete lembretes antecedência reminders lead",
  digest: "resumo do dia manhã bom dia reuniões tarefas revisões menções digest summary morning",
  dnd: "não perturbe silêncio silenciar foco do not disturb silence mute",
  fullscreen: "tela cheia jogo jogos segurar avisos fullscreen game hold",
  reviewAlerts: "revisão review pull request pr github avisos alertas alerts",
  myPrAlerts: "meus prs pr mr ci falha parado menção github gitlab avisos alertas alerts mentions stalled aprovado aprovação merge conflito comentário atribuído resposta time times approved conflict assigned replies team",
  activity: "atividade apps aplicativos histórico limpar activity history clear",
  focus: "foco estimativa tempo cronômetro focus estimate timer",
  security: "segurança senha mestra bloqueio automático biometria hello touch id security password lock biometric",
  google: "google agenda calendário conta calendar account",
  clipboard: "clipboard área de transferência histórico copiado fixados fixar limite máximo pinned limit history copied",
  backup: "backup exportar importar cópia export import",
  sync: "sincronizar sincronização pasta nuvem sync folder cloud",
  window: "janela sempre no topo posição window top position",
  autostart: "iniciar início automático ligar computador bandeja startup autostart tray",
  shortcuts: "atalhos teclado tecla shortcuts keyboard keys",
  update: "atualização atualizar versão update version",
};

const GROUP_KEYWORDS: Record<GroupId, string> = {
  appearance: "aparência appearance",
  notifications: "notificações avisos notifications alerts",
  privacy: "privacidade segurança privacy security",
  data: "dados contas data accounts",
  app: "aplicativo app",
};

const fold = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

/** Every word typed must show up in the section's terms (or its group's), accents and case aside. */
export function sectionMatches(section: SectionId, group: GroupId, query: string): boolean {
  const words = fold(query).split(/\s+/).filter(Boolean);
  const haystack = fold(`${KEYWORDS[section]} ${GROUP_KEYWORDS[group]}`);
  return words.every((w) => haystack.includes(w));
}

const KEY = "canto.settingsGroups";
const FIRST_OPEN: GroupId[] = ["appearance"];

/** Nothing saved (or corrupt) means only the first group open; unknown ids are dropped. */
export function parseOpenGroups(raw: string | null): GroupId[] {
  if (raw === null) return FIRST_OPEN;
  try {
    const list: unknown = JSON.parse(raw);
    return Array.isArray(list) ? GROUPS.map((g) => g.id).filter((id) => list.includes(id)) : FIRST_OPEN;
  } catch {
    return FIRST_OPEN;
  }
}

export function loadOpenGroups(): GroupId[] {
  try {
    return parseOpenGroups(localStorage.getItem(KEY));
  } catch {
    return FIRST_OPEN;
  }
}

export function saveOpenGroups(open: GroupId[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(open));
  } catch {
    /* private window or blocked storage: the groups just reset next time */
  }
}
