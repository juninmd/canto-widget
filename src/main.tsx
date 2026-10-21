import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import AlertWindow from "./AlertWindow";
import CaptureWindow from "./CaptureWindow";
import WindowBoundary from "./components/WindowBoundary";
import { applySkin, loadSkin, followSystem } from "./lib/theme";
import { applyDensity, loadDensity } from "./lib/density";
import { LANGUAGE } from "./i18n";
import { syncPrefs } from "./lib/prefsMirror";
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

// The tab choices are read once while rendering, so a copy restored from the file has to land first.
void syncPrefs().then(() =>
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <WindowBoundary>
        {windowParams.has("alert") ? <AlertWindow /> : windowParams.has("capture") ? <CaptureWindow /> : <App />}
      </WindowBoundary>
    </React.StrictMode>,
  ),
);
