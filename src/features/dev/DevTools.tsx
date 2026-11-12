import { useState } from "react";
import { t } from "../../i18n";
import ToolJwt from "./ToolsJwt";
import { ToolBase64, ToolJson, ToolUrl } from "./ToolsData";
import { ToolDiff, ToolHash, ToolRegex, ToolTime, ToolUuid } from "./ToolsMore";

export type Tool = "json" | "jwt" | "base64" | "url" | "uuid" | "hash" | "time" | "regex" | "diff";
export const TOOLS: Tool[] = ["json", "jwt", "base64", "url", "uuid", "hash", "time", "regex", "diff"];
const KEY = "canto.devTool";
const SEED = '{"nome":"Canto","abas":[{"id":"portas","ativa":true},{"id":"docker","ativa":false}],"versao":2}';

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
  return (
    <>
      <div role="group" aria-label={t("dev.tools.pick")} className="flex shrink-0 flex-wrap gap-x-3.5 gap-y-0.5">
        {TOOLS.map((k) => (
          <button key={k} type="button" aria-pressed={tool === k} onClick={() => pick(k)} className={`canto-hit border-b-2 px-0.5 py-1 text-[12px] ${tool === k ? "border-accent font-semibold text-fg" : "border-transparent text-muted hover:text-fg"}`}>
            {t(`dev.tool.${k}`)}
          </button>
        ))}
      </div>
      <p className="shrink-0 text-[11px] text-faint">{t("dev.tool.note")}</p>
      {tool === "json" && <ToolJson seed={SEED} />}
      {tool === "jwt" && <ToolJwt />}
      {tool === "base64" && <ToolBase64 />}
      {tool === "url" && <ToolUrl />}
      {tool === "uuid" && <ToolUuid />}
      {tool === "hash" && <ToolHash />}
      {tool === "time" && <ToolTime />}
      {tool === "regex" && <ToolRegex />}
      {tool === "diff" && <ToolDiff />}
    </>
  );
}
