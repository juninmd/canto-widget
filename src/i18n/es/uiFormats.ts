import type { uiFormats as source } from "../pt-BR/uiFormats";

export const uiFormats: Record<keyof typeof source, string> = {
  "time.hourOfDay": "{h} h",
  "time.hourTick": "{h} h",
  "time.min": "{n} min",
  "time.sec": "{n} s",
  "time.h": "{h} h",
  "time.hMin": "{h} h {mm}",
};
