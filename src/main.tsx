import React from "react";
import ReactDOM from "react-dom/client";
import WindowBoundary from "./components/WindowBoundary";
import { applySkin, loadSkin, followSystem } from "./lib/theme";
import { applyDensity, loadDensity } from "./lib/density";
import { LANGUAGE } from "./i18n";
import { IS_MOBILE } from "./lib/platform";
import { syncPrefs } from "./lib/prefsMirror";
import { RTL_LANGUAGES } from "./i18n/languages";
import { loadWindowRoot, windowKind } from "./lib/windowRoot";
import "./styles.css";

document.documentElement.lang = LANGUAGE;
// Styles keyed on this reach the page behind the safe areas, which no component owns.
if (IS_MOBILE) document.documentElement.dataset.mobile = "";
document.documentElement.dir = RTL_LANGUAGES.includes(LANGUAGE) ? "rtl" : "ltr";
applySkin(loadSkin());
applyDensity(loadDensity());
// Stays at boot, not in the picker: the system theme can change with Settings closed.
followSystem(() => {
  if (loadSkin() === "sistema") applySkin("sistema");
});

// The tab choices are read once while rendering, so a copy restored from the file has to land first; the window's
// own code downloads meanwhile instead of after.
void Promise.all([loadWindowRoot(windowKind(location.search)), syncPrefs()]).then(([Root]) =>
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <WindowBoundary>
        <Root />
      </WindowBoundary>
    </React.StrictMode>,
  ),
);
