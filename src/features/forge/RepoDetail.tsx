import { useEffect, useState } from "react";
import { api, errText, type Readme, type RepoInfo } from "../../lib/api";
import type { Forge } from "./forge";
import { cleanReadme } from "./repos";
import { block, useLexer, type Render } from "../../lib/markdown";
import { timeAgo } from "../../lib/time";
import { t } from "../../i18n";
import RepoIcon from "./RepoIcon";
import Skeleton from "../../components/Skeleton";

/** Lexing the whole of a long README would stall the panel: the first screens are what a glance needs. */
const MAX_SOURCE = 16_000;
const MAX_BLOCKS = 80;
const READMES = new Map<string, Readme>();

export const clearReadmes = () => READMES.clear();

const key = (forge: Forge, r: RepoInfo) => `${forge}|${r.id || r.full_name}`;
const RENDER: Render = { text: (text) => text };

function ReadmeBody({ readme }: { readme: Readme }) {
  const lexer = useLexer("block");
  const tokens = lexer(cleanReadme(readme.text).slice(0, MAX_SOURCE))
    .filter((tok) => tok.type !== "space")
    .slice(0, MAX_BLOCKS);
  if (tokens.length === 0) return <p className="text-[11px] text-faint">{t("forge.repos.readme.empty")}</p>;
  return (
    <div className="max-h-40 space-y-1 overflow-y-auto break-words rounded-lg border border-edge bg-ink/60 p-2 text-xs text-muted">
      {tokens.map((tok, i) => block(tok, RENDER, `b${i}`))}
      {(readme.truncated || readme.text.length > MAX_SOURCE) && <p className="text-[11px] text-faint">{t("forge.repos.readme.truncated")}</p>}
    </div>
  );
}

/** What a repository's row has no room for: about, topics, numbers and, when asked, its README (cached by Rust). */
type Props = { forge: Forge; repo: RepoInfo; icon?: string; pinned: boolean; onPin: () => void; onClose: () => void };

export default function RepoDetail({ forge, repo, icon, pinned, onPin, onClose }: Props) {
  const [readme, setReadme] = useState<Readme | null>(() => READMES.get(key(forge, repo)) ?? null);
  const [shown, setShown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Another repository starts closed, with whatever README of its was already read.
  useEffect(() => {
    setReadme(READMES.get(key(forge, repo)) ?? null);
    setShown(false);
    setError("");
  }, [forge, repo]);

  async function toggle() {
    if (shown) return setShown(false);
    setShown(true);
    if (readme) return;
    setLoading(true);
    setError("");
    try {
      const got = await (forge === "github" ? api.githubReadme(repo.full_name) : api.gitlabReadme(repo.id, repo.default_branch));
      READMES.set(key(forge, repo), got);
      setReadme(got);
    } catch (e) {
      setError(errText(e));
    } finally {
      setLoading(false);
    }
  }

  const when = repo.updated_at && timeAgo(repo.updated_at);
  const meta = [repo.language, `★ ${repo.stars}`, repo.forks > 0 && `⑂ ${repo.forks}`, repo.open_issues > 0 && t("forge.repos.issues", { n: repo.open_issues }), when && t("forge.repos.updated", { when })].filter(Boolean);

  return (
    <section aria-label={t("forge.repos.detail")} className="max-h-[42%] shrink-0 space-y-2 overflow-y-auto rounded-xl border border-edge bg-ink/60 p-2.5">
      <div className="flex items-center gap-2">
        <RepoIcon src={icon} name={repo.name} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="m-0 truncate text-sm font-semibold text-fg">{repo.full_name}</h3>
          <p className="m-0 truncate text-[11px] text-muted">{meta.join(" · ")}</p>
        </div>
        <button
          type="button"
          onClick={() => void api.openLink(repo.url)}
          aria-label={t("forge.repos.open", { name: repo.full_name })}
          className="canto-hit min-h-[24px] shrink-0 rounded-md border border-edge px-2 text-[11px] text-muted hover:bg-hover hover:text-fg"
        >
          {t("forge.repos.detail.open")}
        </button>
        <button
          type="button"
          aria-pressed={pinned}
          onClick={onPin}
          aria-label={t(pinned ? "forge.repos.unpin" : "forge.repos.pin", { name: repo.full_name })}
          title={t(pinned ? "forge.repos.unpin" : "forge.repos.pin", { name: repo.full_name })}
          className={`canto-hit grid size-6 shrink-0 place-items-center rounded-md hover:text-fg ${pinned ? "text-warn" : "text-faint"}`}
        >
          {pinned ? "★" : "☆"}
        </button>
        <button type="button" onClick={onClose} aria-label={t("forge.repos.detail.close")} title={t("forge.repos.detail.close")} className="canto-hit grid size-6 shrink-0 place-items-center rounded-md text-faint hover:text-fg">
          ✕
        </button>
      </div>
      <p className={`m-0 break-words text-xs ${repo.description ? "text-fg" : "text-faint"}`}>{repo.description || t("forge.repos.noDescription")}</p>
      {repo.topics.length > 0 && (
        <ul aria-label={t("forge.repos.topics")} className="m-0 flex list-none flex-wrap gap-1 p-0">
          {repo.topics.map((topic) => (
            <li key={topic} className="rounded-full bg-accent/15 px-2 text-[11px] text-accent-text">
              {topic}
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        aria-expanded={shown}
        onClick={() => void toggle()}
        className="canto-hit min-h-[24px] rounded-md border border-edge px-2 text-[11px] text-muted hover:bg-hover hover:text-fg"
      >
        {shown ? t("forge.repos.readme.hide") : t("forge.repos.readme.show")}
      </button>
      {shown && loading && <Skeleton label={t("forge.repos.readme.loading")} rows={2} />}
      {shown && error && (
        <p role="alert" className="m-0 text-[11px] text-danger">
          {error}
        </p>
      )}
      {shown && readme && <ReadmeBody readme={readme} />}
    </section>
  );
}
