import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import AlertWindow from "./AlertWindow";
import CaptureWindow from "./CaptureWindow";
import { applySkin, loadSkin, followSystem } from "./lib/theme";
import { applyDensity, loadDensity } from "./lib/density";
import { LANGUAGE } from "./i18n";
import { RTL_LANGUAGES } from "./i18n/languages";
import "./styles.css";

document.documentElement.lang = LANGUAGE;
document.documentElement.dir = RTL_LANGUAGES.includes(LANGUAGE) ? "rtl" : "ltr";
applySkin(loadSkin());
applyDensity(loadDensity());
// Stays at boot, not in the picker: the system theme can change with Settings closed.
followSystem(() => {
  if (loadSkin() === "sistema") applySkin("sistema");
});

// The pop-up and capture windows load the same bundle with `?alert` / `?capture` (see `tauri.conf.json`).
const windowParams = new URLSearchParams(location.search);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {windowParams.has("alert") ? <AlertWindow /> : windowParams.has("capture") ? <CaptureWindow /> : <App />}
  </React.StrictMode>,
);
