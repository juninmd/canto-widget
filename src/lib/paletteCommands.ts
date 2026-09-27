import type { AgendaItem } from "./api";
import type { Tab } from "../components/TabBar";
import { MOD_KEY } from "./platform";
import { SKINS, type SkinId } from "./theme";
import { PALETTE_PROVIDERS, type PaletteCommand } from "./palette";
import { t } from "../i18n";

/** Everything the palette can do, wired by App to the functions its buttons and shortcuts already use. */
export type PaletteContext = {
  tabs: readonly { id: Tab; label: string }[];
  privacy: boolean;
  nextMeeting: AgendaItem | null;
  goTab: (id: Tab) => void;
  focusNew: (tab: "tasks" | "notes") => void;
  searchTab: () => void;
  globalSearch: () => void;
  lock: () => void;
  joinMeeting: (item: AgendaItem) => void;
  setSkin: (id: SkinId) => void;
  togglePrivacy: () => void;
  toggleFullscreen: () => void;
  copySummary: () => void;
  help: () => void;
  hide: () => void;
};

/** The next meeting with a call link that hasn't ended yet; all-day events have no call to join. */
export function nextMeeting(items: readonly AgendaItem[], now = new Date()): AgendaItem | null {
  const ms = now.getTime();
  return (
    items
      .filter((e) => e.meet && !e.all_day && new Date(e.end).getTime() > ms)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0] ?? null
  );
}

export function buildCommands(ctx: PaletteContext): PaletteCommand[] {
  const tabs = ctx.tabs.map((tab, i): PaletteCommand => ({
    id: `tab.${tab.id}`,
    title: t("palette.goTab", { tab: tab.label }),
    keywords: [tab.label],
    keys: i < 9 ? ["Alt", String(i + 1)] : undefined,
    run: () => ctx.goTab(tab.id),
  }));
  const visible = new Set(ctx.tabs.map((tab) => tab.id));
  const meeting = ctx.nextMeeting;
  const core: (PaletteCommand | false)[] = [
    visible.has("tasks") && { id: "task.new", title: t("palette.newTask"), run: () => ctx.focusNew("tasks") },
    visible.has("notes") && { id: "note.new", title: t("palette.newNote"), run: () => ctx.focusNew("notes") },
    { id: "search.global", title: t("palette.globalSearch"), keys: [MOD_KEY, "K"], run: ctx.globalSearch },
    { id: "search.tab", title: t("palette.searchTab"), keys: ["/"], run: ctx.searchTab },
    !!meeting && {
      id: "meeting.join",
      title: t("palette.joinMeeting", { title: meeting.title }),
      keywords: ["meet", t("palette.keywords.meeting")],
      run: () => ctx.joinMeeting(meeting),
    },
    visible.has("tasks") && { id: "summary.copy", title: t("palette.copySummary"), run: ctx.copySummary },
    { id: "settings.open", title: t("palette.settings"), keywords: [t("palette.keywords.settings")], run: () => ctx.goTab("settings") },
    ...SKINS.map((s) => ({
      id: `skin.${s.id}`,
      title: t("palette.skin", { name: s.name }),
      keywords: ["skin", t("palette.keywords.theme")],
      run: () => ctx.setSkin(s.id),
    })),
    {
      id: "privacy.toggle",
      title: ctx.privacy ? t("palette.privacyOff") : t("palette.privacyOn"),
      keys: ["Alt", "P"],
      run: ctx.togglePrivacy,
    },
    { id: "fullscreen.toggle", title: t("palette.fullscreen"), keys: ["F11"], run: ctx.toggleFullscreen },
    { id: "help.open", title: t("palette.help"), keys: ["?"], run: ctx.help },
    { id: "window.hide", title: t("palette.hide"), run: ctx.hide },
    { id: "vault.lock", title: t("palette.lock"), keys: ["Alt", "L"], run: ctx.lock },
  ];
  return [...tabs, ...core.filter((c): c is PaletteCommand => !!c), ...PALETTE_PROVIDERS.flatMap((p) => p())];
}
