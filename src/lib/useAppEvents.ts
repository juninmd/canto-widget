import { useEffect, type MutableRefObject } from "react";
import { listen } from "@tauri-apps/api/event";
import { api } from "./api";
import { focusStore } from "./focus";
import { t } from "../i18n";
import { OPEN_TAB_EVENT, TASKS_CHANGED_EVENT } from "./alertEvents";
import type { Tab } from "../components/TabBar";

interface Options {
  unlocked: boolean;
  notify: (n: { message: string }) => void;
  refresh: () => Promise<unknown> | void;
  changeTab: (id: Tab) => void;
  onTasksChanged: () => void;
  openNormal: MutableRefObject<(mode: "normal") => Promise<unknown>>;
}

/** Events that reach the main window from Rust or from the alert pop-up, plus the activity signal that postpones auto-lock. */
export function useAppEvents({ unlocked, notify, refresh, changeTab, onTasksChanged, openNormal }: Options) {
  // Rust locks the vault on its own after a period of inactivity; the UI needs to know.
  useEffect(() => {
    const stop = listen<number>("canto://auto-lock", (e) => {
      focusStore.discard();
      notify({ message: e.payload > 0 ? t("app.autoLocked", { min: e.payload }) : t("app.lockedFromTray") });
      void refresh();
    });
    return () => {
      void stop.then((f) => f());
    };
  }, [refresh, notify]);

  // Deliberate use postpones auto-lock. Throttled: one signal per window is enough.
  useEffect(() => {
    if (!unlocked) return;
    let next = 0;
    const mark = () => {
      const now = Date.now();
      if (now < next) return;
      next = now + 30_000;
      void api.touch().catch(() => {});
    };
    window.addEventListener("pointerdown", mark);
    window.addEventListener("keydown", mark);
    return () => {
      window.removeEventListener("pointerdown", mark);
      window.removeEventListener("keydown", mark);
    };
  }, [unlocked]);

  // The pop-up lives in its own window: what it changes here arrives as events.
  useEffect(() => {
    const done = listen(TASKS_CHANGED_EVENT, onTasksChanged);
    const open = listen<Tab>(OPEN_TAB_EVENT, (e) => {
      changeTab(e.payload);
      // The tab lives in the full window, not in the dock.
      void openNormal.current("normal").catch(() => {});
    });
    return () => {
      void done.then((f) => f());
      void open.then((f) => f());
    };
  }, [changeTab, onTasksChanged, openNormal]);
}
