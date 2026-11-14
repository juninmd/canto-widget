import { useEffect, useMemo, useRef, useState } from "react";
import { api, type ForgeLists, type PrComment } from "../../lib/api";
import type { Forge } from "./forge";
import { fetchInBatches, groupCommenters, prsWithComments, type EnrichedComment } from "./prCommenters";

/** Comments of my PRs are fetched only while the commenters view is open, four PRs at a time, once each. */
export function useForgeCommenters(forge: Forge, lists: ForgeLists | null, active: boolean) {
  const [cache, setCache] = useState<Record<string, PrComment[]>>({});
  const cacheRef = useRef(cache);
  cacheRef.current = cache;
  const [loading, setLoading] = useState(false);
  const prs = useMemo(() => (lists ? prsWithComments(lists.my_prs.items) : []), [lists]);

  useEffect(() => {
    if (!active || prs.length === 0) {
      setLoading(false);
      return;
    }
    const targets = prs.filter((p) => !cacheRef.current[`${p.repo}#${p.number}`]);
    if (targets.length === 0) return;

    let live = true;
    setLoading(true);
    fetchInBatches(targets, 4, async (pr) => {
      try {
        const cms = forge === "github" ? await api.githubPrComments(pr.repo, pr.number) : [];
        return { key: `${pr.repo}#${pr.number}`, comments: cms };
      } catch {
        return { key: `${pr.repo}#${pr.number}`, comments: [] };
      }
    })
      .then((res) => {
        if (!live) return;
        setCache((prev) => {
          const next = { ...prev };
          for (const r of res) next[r.key] = r.comments;
          return next;
        });
      })
      .finally(() => {
        if (live) setLoading(false);
      });

    return () => {
      live = false;
    };
  }, [active, prs, forge]);

  const commenters = useMemo(() => {
    const enriched: EnrichedComment[] = [];
    if (!lists?.my_prs?.items) return [];
    for (const pr of lists.my_prs.items) {
      for (const c of cache[`${pr.repo}#${pr.number}`] || []) {
        enriched.push({ ...c, repo: pr.repo, prNumber: pr.number, prTitle: pr.title, prUrl: pr.url });
      }
    }
    return groupCommenters(enriched);
  }, [lists?.my_prs?.items, cache]);

  return { commenters, loading, count: prs.length };
}
