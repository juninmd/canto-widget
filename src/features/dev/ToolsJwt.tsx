import { useEffect, useState } from "react";
import { t, type MessageKey } from "../../i18n";
import { Chip, CopyLine, copyText } from "./DevBits";
import { Area, Label, Line, Note, Pre, relative } from "./ToolBits";
import { JWT_ALGS, decodeJwt, expiry, signJwt, verifyJwt } from "./tools";

const SEED = { alg: "HS256", typ: "JWT" };
const CLAIMS = ["sub", "iss", "aud", "name", "roles", "email", "iat", "exp", "nbf"];
const EXPIRES: [string, number][] = [["none", 0], ["1h", 3600], ["1d", 86400], ["30d", 2592000]];

const pretty = (v: unknown) => JSON.stringify(v, null, 2);
const parse = (s: string): object | null => {
  try {
    const v: unknown = JSON.parse(s);
    return v && typeof v === "object" ? v : null;
  } catch {
    return null;
  }
};

/** Decode a token and check its signature, or write a header and payload and get a signed one. */
export default function ToolJwt() {
  const [mode, setMode] = useState<"decode" | "encode">("decode");
  const [token, setToken] = useState("");
  const [secret, setSecret] = useState("segredo-de-teste");
  const [header, setHeader] = useState(pretty(SEED));
  const [payload, setPayload] = useState(pretty({ sub: "42", name: "Antonio", roles: ["admin"] }));
  const [made, setMade] = useState("");
  const [valid, setValid] = useState<boolean | null | undefined>(undefined);

  const sample = async (expired: boolean) => {
    const now = Math.floor(Date.now() / 1000);
    setToken(await signJwt(SEED, { sub: "42", name: "Antonio", roles: ["admin"], iat: now - 86400, exp: now + (expired ? -3600 : 3 * 86400) }, secret));
  };

  useEffect(() => void sample(false), []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let live = true;
    void verifyJwt(token, secret).then((v) => live && setValid(v));
    return () => void (live = false);
  }, [token, secret]);

  const h = parse(header);
  const p = parse(payload);
  useEffect(() => {
    let live = true;
    if (!h || !p || mode !== "encode") return setMade("");
    void signJwt(h, p, secret).then((v) => live && setMade(v), () => live && setMade(""));
    return () => void (live = false);
  }, [header, payload, secret, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const jwt = decodeJwt(token);
  const exp = jwt ? expiry(jwt.payload) : null;
  const setAlg = (alg: string) => h && setHeader(pretty({ ...h, alg }));
  const setExpiry = (seconds: number) => {
    if (!p) return;
    const { exp: _drop, ...rest } = p as Record<string, unknown>;
    const now = Math.floor(Date.now() / 1000);
    setPayload(pretty(seconds ? { ...rest, iat: now, exp: now + seconds } : rest));
  };
  const claim = (k: string, v: unknown) => (["iat", "exp", "nbf"].includes(k) && typeof v === "number" ? new Date(v * 1000).toLocaleString() : typeof v === "object" ? JSON.stringify(v) : String(v));

  return (
    <>
      <div className="flex shrink-0 gap-1">
        {(["decode", "encode"] as const).map((m) => (
          <Chip key={m} on={mode === m} onClick={() => setMode(m)}>
            {t(`dev.jwt.${m}`)}
          </Chip>
        ))}
      </div>
      {mode === "decode" ? (
        <>
          <Area id="dev-jwt" value={token} onChange={setToken} label={t("dev.jwt.token")} rows={4} />
          {!jwt ? (
            <Note tone="warn">{t("dev.jwt.invalid")}</Note>
          ) : (
            <>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Note>{String(jwt.header.alg)}</Note>
                {jwt.header.alg === "none" && <Note tone="danger">{t("dev.jwt.algNone")}</Note>}
                {exp?.kind === "none" ? <Note tone="warn">{t("dev.jwt.expNone")}</Note> : exp && <Note tone={exp.kind === "expired" ? "danger" : "ok"}>{t(exp.kind === "expired" ? "dev.jwt.expExpired" : "dev.jwt.expValid", { span: relative(exp.ms) })}</Note>}
                {valid !== undefined && <Note tone={valid === null ? "muted" : valid ? "ok" : "danger"}>{valid === null ? t("dev.jwt.unverifiable") : valid ? t("dev.jwt.verified") : t("dev.jwt.mismatch")}</Note>}
                <span className="flex-1" />
                <Chip on={false} onClick={() => void sample(false)}>{t("dev.jwt.sample")}</Chip>
                <Chip on={false} onClick={() => void sample(true)}>{t("dev.jwt.sampleOld")}</Chip>
              </p>
              <div className="grid shrink-0 gap-2 sm:grid-cols-2">
                <div className="flex min-w-0 flex-col gap-1"><Label>{t("dev.jwt.header")}</Label><Pre max="max-h-40">{pretty(jwt.header)}</Pre></div>
                <div className="flex min-w-0 flex-col gap-1">
                  <Label>{t("dev.jwt.claims")}</Label>
                  <dl className="grid grid-cols-[auto_1fr] content-start gap-x-3 gap-y-0.5 rounded-lg bg-ink/80 p-2.5 text-[11px]">
                    {Object.entries(jwt.payload).map(([k, v]) => (
                      <div key={k} className="contents">
                        <dt className="text-faint">{CLAIMS.includes(k) ? t(`dev.jwt.claim.${k}` as MessageKey) : k}</dt>
                        <dd className="break-all text-fg">{claim(k, v)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
              <button type="button" onClick={() => copyText(pretty(jwt.payload))} className="canto-hit min-h-[28px] self-start rounded-md bg-hover px-2.5 text-[11.5px] font-medium text-fg">{t("dev.copy")} {t("dev.jwt.payload")}</button>
            </>
          )}
          <Line id="dev-jwt-secret" value={secret} onChange={setSecret} label={t("dev.jwt.secret")} />
        </>
      ) : (
        <>
          <div className="grid shrink-0 gap-2 sm:grid-cols-2">
            <div className="flex flex-col gap-1"><Area id="dev-jwt-header" value={header} onChange={setHeader} label={t("dev.jwt.header")} rows={5} />{!h && <Note tone="danger">{t("dev.jwt.badJson")}</Note>}</div>
            <div className="flex flex-col gap-1"><Area id="dev-jwt-payload" value={payload} onChange={setPayload} label={t("dev.jwt.payload")} rows={5} />{!p && <Note tone="danger">{t("dev.jwt.badJson")}</Note>}</div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-1">
            <span className="mr-1 text-[11px] text-faint">{t("dev.jwt.expire")}</span>
            {EXPIRES.map(([k, s]) => <Chip key={k} on={false} onClick={() => setExpiry(s)}>{t(`dev.jwt.exp.${k}` as MessageKey)}</Chip>)}
            <span className="flex-1" />
            <select aria-label={t("dev.jwt.alg")} value={String((h as { alg?: string } | null)?.alg ?? "")} onChange={(e) => setAlg(e.target.value)} className="canto-field h-7 px-1.5 text-[11.5px]">
              {JWT_ALGS.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
          <Line id="dev-jwt-secret-enc" value={secret} onChange={setSecret} label={t("dev.jwt.secret")} />
          <Label>{t("dev.jwt.generated")}</Label>
          {made ? (
            <>
              <CopyLine text={made} />
              <button type="button" onClick={() => (setToken(made), setMode("decode"))} className="canto-hit min-h-[28px] self-start rounded-md bg-accent px-3 text-[11.5px] font-semibold text-on-accent">{t("dev.jwt.open")}</button>
            </>
          ) : (
            <Note tone="muted">{t("dev.jwt.fix")}</Note>
          )}
        </>
      )}
    </>
  );
}
