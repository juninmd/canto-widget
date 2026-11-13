import { useState } from "react";
import { t } from "../../i18n";
import ToolJwt from "./ToolsJwt";
import { ToolBase64, ToolJson, ToolUrl } from "./ToolsData";
import { ToolDiff, ToolHash, ToolRegex, ToolTime, ToolUuid } from "./ToolsMore";

export type Tool = "json" | "jwt" | "base64" | "url" | "uuid" | "hash" | "time" | "regex" | "diff";
export const TOOLS: Tool[] = ["json", "jwt", "base64", "url", "uuid", "hash", "time", "regex", "diff"];
const KEY = "canto.devTool";

function saved(): Tool {
  try {
    const raw = localStorage.getItem(KEY);
    return TOOLS.includes(raw as Tool) ? (raw as Tool) : "json";
  } catch {
    return "json";
  }
}

/** Nine small tools that run in the webview: nothing is sent anywhere. */
export default function DevTools({ initial }: { initial?: Tool }) {
  const [tool, setTool] = useState<Tool>(initial ?? saved);
  const pick = (next: Tool) => {
    setTool(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Private mode: the tool lasts until the window closes.
    }
  };
  const move = (e: React.KeyboardEvent, i: number) => {
    const to = { ArrowRight: (i + 1) % TOOLS.length, ArrowLeft: (i - 1 + TOOLS.length) % TOOLS.length, Home: 0, End: TOOLS.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    pick(TOOLS[to]);
    document.getElementById(`dev-tool-tab-${TOOLS[to]}`)?.focus();
  };
  return (
    <>
      <div role="tablist" aria-label={t("dev.tools.pick")} className="-mb-2.5 flex shrink-0 gap-0.5 overflow-x-auto border-b border-edge px-1 pt-1">
        {TOOLS.map((k, i) => (
          <button
            key={k}
            id={`dev-tool-tab-${k}`}
            type="button"
            role="tab"
            aria-selected={tool === k}
            aria-controls="dev-tool-panel"
            tabIndex={tool === k ? 0 : -1}
            onClick={() => pick(k)}
            onKeyDown={(e) => move(e, i)}
            className={`canto-hit relative -mb-px shrink-0 whitespace-nowrap rounded-t-lg border border-b-0 px-3 py-1.5 text-[12px] transition-colors ${tool === k ? "border-edge bg-raised font-semibold text-accent-text before:absolute before:inset-x-2 before:top-0 before:h-0.5 before:rounded-full before:bg-accent" : "border-transparent text-muted hover:bg-hover hover:text-fg"}`}
          >
            {t(`dev.tool.${k}`)}
          </button>
        ))}
      </div>
      <div id="dev-tool-panel" role="tabpanel" aria-labelledby={`dev-tool-tab-${tool}`} className="flex shrink-0 flex-col gap-2 rounded-b-xl rounded-tr-xl border border-t-0 border-edge bg-raised/40 p-2.5">
        <p className="text-[11px] text-faint">{t("dev.tool.note")}</p>
        {tool === "json" && <ToolJson />}
        {tool === "jwt" && <ToolJwt />}
        {tool === "base64" && <ToolBase64 />}
        {tool === "url" && <ToolUrl />}
        {tool === "uuid" && <ToolUuid />}
        {tool === "hash" && <ToolHash />}
        {tool === "time" && <ToolTime />}
        {tool === "regex" && <ToolRegex />}
        {tool === "diff" && <ToolDiff />}
      </div>
    </>
  );
}
