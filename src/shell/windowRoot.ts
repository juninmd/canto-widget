import type { ComponentType } from "react";

export type WindowKind = "alert" | "capture" | "strip" | "bar" | "main";

/** The pop-up and capture windows load the same bundle with `?alert` / `?capture` / `?strip` / `?bar` (see `tauri.conf.json`). */
export function windowKind(search: string): WindowKind {
  const params = new URLSearchParams(search);
  return params.has("alert") ? "alert" : params.has("capture") ? "capture" : params.has("strip") ? "strip" : params.has("bar") ? "bar" : "main";
}

// Each window fetches and parses only its own tree: the pop-up that rings for a meeting skips the whole widget.
const loaders: Record<WindowKind, () => Promise<{ default: ComponentType }>> = {
  alert: () => import("../AlertWindow"),
  capture: () => import("../CaptureWindow"),
  strip: () => import("../StripWindow"),
  bar: () => import("../BarWindow"),
  main: () => import("../App"),
};

export async function loadWindowRoot(kind: WindowKind): Promise<ComponentType> {
  return (await loaders[kind]()).default;
}
