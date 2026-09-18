import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { applySkin, loadSkin, followSystem } from "./lib/theme";
import "./styles.css";

applySkin(loadSkin());
// Stays at boot, not in the picker: the system theme can change with Settings closed.
followSystem(() => {
  if (loadSkin() === "sistema") applySkin("sistema");
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
