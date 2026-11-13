import { useState } from "react";
import { t } from "../../i18n";
import { Chip, CopyLine, copyText } from "./DevBits";
import { Area, Label, Line, Note, Pre } from "./ToolBits";
import { decodeText, encodeText, formatJson, jsonDepth, jsonPath, parseUrl, safeDecodeUri, type JsonMode } from "./tools";

const MODES: JsonMode[] = ["format", "minify", "sort"];

export function ToolJson() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<JsonMode>("format");
  const [path, setPath] = useState("");
  const r = formatJson(text, mode);
  const found = r.ok && path ? jsonPath(r.value.value, path) : undefined;
  return (
    <>
      <Area id="dev-json" value={text} onChange={setText} label={t("dev.json.input")} rows={5} />
      <div className="flex shrink-0 gap-1">
        {MODES.map((m) => (
          <Chip key={m} on={mode === m} onClick={() => setMode(m)}>
            {t(`dev.json.${m}`)}
          </Chip>
        ))}
      </div>
      {!text.trim() ? null : !r.ok ? (
        <Note tone="danger">{t("dev.json.invalid", { msg: r.error })}</Note>
      ) : (
        <>
          <p className="flex flex-wrap gap-x-3 text-[11.5px]">
            <Note tone="ok">{t("dev.json.valid")}</Note>
            <Note>{t("dev.json.chars", { n: text.length })}</Note>
            <Note>{t("dev.json.depth", { n: jsonDepth(r.value.value) })}</Note>
          </p>
          <Pre>{r.value.out}</Pre>
          <button type="button" onClick={() => copyText(r.value.out)} className="canto-hit min-h-[28px] self-start rounded-md bg-hover px-2.5 text-[11.5px] font-medium text-fg">
            {t("dev.json.copy")}
          </button>
          <Line id="dev-json-path" value={path} onChange={setPath} label={t("dev.json.path")} />
          {path && <CopyLine text={found === undefined ? t("dev.json.pathNone") : typeof found === "string" ? found : JSON.stringify(found)} />}
        </>
      )}
    </>
  );
}

export function ToolBase64() {
  const [text, setText] = useState("");
  const [urlSafe, setUrlSafe] = useState(false);
  return (
    <>
      <Area id="dev-b64" value={text} onChange={setText} label={t("dev.b64.input")} rows={3} />
      <label className="flex items-center gap-2 text-[12px] text-muted">
        <input type="checkbox" checked={urlSafe} onChange={(e) => setUrlSafe(e.target.checked)} className="size-4 accent-[var(--color-accent)]" />
        {t("dev.b64.urlSafe")}
      </label>
      {text && (
        <>
          <Label>{t("dev.b64.encoded")}</Label>
          <CopyLine text={encodeText(text, urlSafe)} />
          <Label>{t("dev.b64.decoded")}</Label>
          <CopyLine text={decodeText(text) ?? t("dev.b64.invalid")} />
        </>
      )}
    </>
  );
}

export function ToolUrl() {
  const [text, setText] = useState("");
  const p = parseUrl(text);
  return (
    <>
      <Area id="dev-url" value={text} onChange={setText} label={t("dev.url.input")} rows={3} />
      {!text.trim() ? null : p ? (
        <div className="flex shrink-0 flex-col gap-1.5 rounded-xl bg-ink/50 p-2.5">
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[11.5px]">
            {[[t("dev.url.protocol"), p.url.protocol], [t("dev.url.host"), p.url.host], [t("dev.url.path"), p.url.pathname], [t("dev.url.hash"), p.url.hash || "—"]].map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-faint">{k}</dt>
                <dd className="break-all text-fg">{v}</dd>
              </div>
            ))}
          </dl>
          <Label>{t("dev.url.params", { n: p.params.length })}</Label>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 font-mono text-[11px]">
            {p.params.map(([k, v], i) => (
              <div key={i} className="contents">
                <dt className="text-accent-text">{k}</dt>
                <dd className="break-all text-fg">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : (
        <Note tone="warn">{t("dev.url.invalid")}</Note>
      )}
      {text && (
        <>
      <Label>{t("dev.url.encoded")}</Label>
      <CopyLine text={encodeURIComponent(text)} />
      <Label>{t("dev.url.decoded")}</Label>
      <CopyLine text={safeDecodeUri(text) ?? t("dev.url.badSeq")} />
        </>
      )}
    </>
  );
}
