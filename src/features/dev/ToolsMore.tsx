import { useEffect, useState } from "react";
import { t } from "../../i18n";
import { Chip, CopyLine, copyText } from "./DevBits";
import { Area, Label, Line, Note, relative } from "./ToolBits";
import { digests, lineDiff, parseInstant, randomSecret, randomUuids, testRegex } from "./tools";

export function ToolUuid() {
  const [ids, setIds] = useState(() => randomUuids(5));
  const [secret, setSecret] = useState(() => randomSecret());
  return (
    <>
      <div className="flex shrink-0 items-center gap-1">
        <Label>{t("dev.uuid.title")}</Label>
        <span className="flex-1" />
        <Chip on={false} onClick={() => setIds(randomUuids(5))}>{t("dev.uuid.again")}</Chip>
        <Chip on={false} onClick={() => copyText(ids.join("\n"))}>{t("dev.uuid.copyAll")}</Chip>
      </div>
      {ids.map((id) => <CopyLine key={id} text={id} />)}
      <div className="flex shrink-0 items-center gap-1">
        <Label>{t("dev.uuid.secret")}</Label>
        <span className="flex-1" />
        <Chip on={false} onClick={() => setSecret(randomSecret())}>{t("dev.uuid.again")}</Chip>
      </div>
      <Label>{t("dev.uuid.hex")}</Label>
      <CopyLine text={secret.hex} />
      <Label>{t("dev.uuid.b64")}</Label>
      <CopyLine text={secret.base64} />
      <p className="text-[11px] text-faint">{t("dev.uuid.note")}</p>
    </>
  );
}

export function ToolHash() {
  const [text, setText] = useState("canto");
  const [key, setKey] = useState("");
  const [rows, setRows] = useState<[string, string][]>([]);
  useEffect(() => {
    let live = true;
    void digests(text, key).then((r) => live && setRows(r));
    return () => void (live = false);
  }, [text, key]);
  return (
    <>
      <Area id="dev-hash" value={text} onChange={setText} label={t("dev.hash.input")} rows={3} />
      <Line id="dev-hash-key" value={key} onChange={setKey} label={t("dev.hash.key")} />
      {rows.map(([alg, hex]) => (
        <div key={alg} className="flex shrink-0 flex-col gap-1">
          <Label>{alg}</Label>
          <CopyLine text={hex} />
        </div>
      ))}
    </>
  );
}

export function ToolTime() {
  const [text, setText] = useState(() => String(Math.floor(Date.now() / 1000)));
  const ms = parseInstant(text);
  const shift = (by: number) => ms !== null && setText(String(Math.floor((ms + by) / 1000)));
  return (
    <>
      <Line id="dev-time" value={text} onChange={setText} label={t("dev.time.input")} placeholder="1762000000 · 2026-11-12T21:00:00Z" />
      <div className="flex shrink-0 gap-1">
        <Chip on={false} onClick={() => setText(String(Math.floor(Date.now() / 1000)))}>{t("dev.time.now")}</Chip>
        <Chip on={false} onClick={() => shift(3_600_000)}>{t("dev.time.plus1h")}</Chip>
        <Chip on={false} onClick={() => shift(86_400_000)}>{t("dev.time.plus1d")}</Chip>
        <Chip on={false} onClick={() => shift(-86_400_000)}>{t("dev.time.minus1d")}</Chip>
      </div>
      {ms === null ? (
        <Note tone="warn">{t("dev.time.invalid")}</Note>
      ) : (
        <>
          <p className="flex gap-3">
            <Note>{/^-?\d+(\.\d+)?$/.test(text.trim()) ? t(Math.abs(Number(text)) > 1e11 ? "dev.time.millis" : "dev.time.seconds") : ""}</Note>
            <Note tone={ms < Date.now() ? "warn" : "ok"}>{relative(ms - Date.now())}</Note>
          </p>
          <Label>{t("dev.time.iso")}</Label>
          <CopyLine text={new Date(ms).toISOString()} />
          <Label>{t("dev.time.local")}</Label>
          <CopyLine text={new Date(ms).toLocaleString(undefined, { dateStyle: "full", timeStyle: "medium" })} />
          <Label>{t("dev.time.unixS")}</Label>
          <CopyLine text={String(Math.floor(ms / 1000))} />
          <Label>{t("dev.time.unixMs")}</Label>
          <CopyLine text={String(ms)} />
        </>
      )}
    </>
  );
}

export function ToolRegex() {
  const [pattern, setPattern] = useState("(\\w+)@(\\w+)\\.com");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("contato: ana@canto.com, bia@exemplo.com, x@outro.org");
  const r = testRegex(pattern, flags, text);
  return (
    <>
      <div className="flex shrink-0 gap-2">
        <div className="min-w-0 flex-1"><Line id="dev-re" value={pattern} onChange={setPattern} label={t("dev.re.pattern")} /></div>
        <div className="w-16 shrink-0"><Line id="dev-re-flags" value={flags} onChange={setFlags} label={t("dev.re.flags")} /></div>
      </div>
      <Area id="dev-re-text" value={text} onChange={setText} label={t("dev.re.text")} rows={3} />
      {"error" in r ? (
        <Note tone="danger">{t("dev.re.invalid", { msg: r.error })}</Note>
      ) : (
        <>
          <Note tone={r.matches.length ? "ok" : "warn"}>{t("dev.re.matches", { n: r.matches.length })}</Note>
          <p className="shrink-0 rounded-lg bg-ink/80 p-2.5 font-mono text-[11.5px] leading-relaxed whitespace-pre-wrap break-all text-fg">
            {r.pieces.map((p, i) => (p.hit ? <mark key={i} className="rounded-sm bg-accent/30 text-fg">{p.text}</mark> : <span key={i}>{p.text}</span>))}
          </p>
          <ul className="flex flex-col gap-1">
            {r.matches.slice(0, 8).map((m, i) => (
              <li key={i} className="rounded-lg bg-ink/50 px-2.5 py-1 font-mono text-[11px]">
                <span className="text-fg">{m.text}</span>
                {m.groups.length > 0 && <span className="ml-2 text-faint">{m.groups.map((g, j) => `${t("dev.re.group", { n: j + 1 })}=${g}`).join("  ")}</span>}
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

export function ToolDiff() {
  const [a, setA] = useState("porta=3000\nhost=localhost\nmodo=dev");
  const [b, setB] = useState("porta=3001\nhost=localhost\nmodo=dev\ndebug=true");
  const d = lineDiff(a, b);
  const add = d?.filter((l) => l.op === "+").length ?? 0;
  const del = d?.filter((l) => l.op === "-").length ?? 0;
  return (
    <>
      <Area id="dev-diff-a" value={a} onChange={setA} label={t("dev.diff.a")} rows={3} />
      <Area id="dev-diff-b" value={b} onChange={setB} label={t("dev.diff.b")} rows={3} />
      {!d ? (
        <Note tone="warn">{t("dev.diff.tooBig")}</Note>
      ) : (
        <>
          <p className="flex gap-3 text-[11.5px] font-medium tabular-nums">
            <span className="text-ok">+{add}</span>
            <span className="text-danger">−{del}</span>
            {!add && !del && <span className="text-muted">{t("dev.diff.same")}</span>}
          </p>
          <div className="max-h-52 shrink-0 overflow-auto rounded-lg bg-ink/80 p-2.5 font-mono text-[11px] leading-relaxed">
            {d.map((l, i) => (
              <div key={i} className={`whitespace-pre-wrap break-all ${l.op === "+" ? "bg-ok/10 text-ok" : l.op === "-" ? "bg-danger/10 text-danger" : "text-faint"}`}>
                {l.op} {l.text}
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
