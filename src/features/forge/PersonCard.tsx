import { useEffect, useState } from "react";
import { api, type GithubProfile } from "../../lib/api";
import { t } from "../../i18n";

/** The public profile behind a login, fetched once the person is picked; a failed lookup just leaves no card. */
export default function PersonCard({ login }: { login: string }) {
  const [profile, setProfile] = useState<GithubProfile | null>(null);

  useEffect(() => {
    let live = true;
    setProfile(null);
    api.githubProfile(login).then(
      (p) => live && setProfile(p),
      () => {},
    );
    return () => {
      live = false;
    };
  }, [login]);

  if (!profile) return null;
  const meta = [profile.company, profile.location].filter(Boolean).join(" · ");
  const facts = t("forge.person.facts", { repos: profile.public_repos, followers: profile.followers, year: profile.since });
  return (
    <section aria-label={t("forge.person.label", { login })} className="rounded-xl border border-edge bg-ink/60 px-3 py-2 text-[11px]">
      <p className="font-semibold text-fg">{profile.name || `@${profile.login}`}</p>
      {meta && <p className="text-muted">{meta}</p>}
      {profile.bio && <p className="mt-1 text-fg">{profile.bio}</p>}
      <p className="mt-1 text-faint">{profile.since > 0 ? facts : t("forge.person.factsNoYear", { repos: profile.public_repos, followers: profile.followers })}</p>
      {profile.url && (
        <a href={profile.url} target="_blank" rel="noreferrer" className="text-accent-text hover:underline">
          {t("forge.person.open")}
        </a>
      )}
    </section>
  );
}
