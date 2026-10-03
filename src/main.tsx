import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import AlertWindow from "./AlertWindow";
import { applySkin, loadSkin, followSystem } from "./lib/theme";
import { applyDensity, loadDensity } from "./lib/density";
import { LANGUAGE } from "./i18n";
import "./styles.css";

document.documentElement.lang = LANGUAGE;
applySkin(loadSkin());
applyDensity(loadDensity());
// Stays at boot, not in the picker: the system theme can change with Settings closed.
followSystem(() => {
  if (loadSkin() === "sistema") applySkin("sistema");
});

// The pop-up window loads the same bundle with `?alert` (see `tauri.conf.json`).
const popup = new URLSearchParams(location.search).has("alert");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {popup ? <AlertWindow /> : <App />}
  </React.StrictMode>,
);
