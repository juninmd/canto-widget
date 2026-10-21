import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { api, errText, type Contact, type ContactsView } from "../lib/api";
import { avatarTone } from "../lib/agenda";
import { filterContacts, groupByLetter, subtitle, type ContactFilter } from "../lib/contacts";
import { googleGate, initials } from "../lib/google";
import { useRefreshEvent } from "../lib/useRefreshEvent";
import { t } from "../i18n";
import ErrorBanner from "./ErrorBanner";
import GoogleGate from "./GoogleGate";
import { SearchIcon } from "./Icons";
import Skeleton from "./Skeleton";

type Props = { onNotice: (message: string) => void };

const FILTERS: ContactFilter[] = ["all", "starred", "email", "phone"];
const MINI = "canto-hit rounded-md px-2 py-0.5 text-[11px]";

function Detail({ label, values, onCopy }: { label: string; values: string[]; onCopy: (value: string) => void }) {
  return (
    <>
      {values.map((value) => (
        <div key={value} className="flex items-center gap-2">
          <span className="w-12 shrink-0 text-[10px] uppercase tracking-wider text-faint">{label}</span>
          <span className="min-w-0 flex-1 select-text truncate text-xs text-fg">{value}</span>
          <button
            type="button"
            aria-label={t("contacts.copy", { value })}
            onClick={() => onCopy(value)}
            className={`${MINI} bg-edge/60 hover:bg-hover`}
          >
            {t("contacts.copyShort")}
          </button>
        </div>
      ))}
    </>
  );
}

/** The Google address book: search as you type, filters with counts, A to Z sections and one click to copy a number or e-mail. */
export default function ContactsTab({ onNotice }: Props) {
  const [view, setView] = useState<ContactsView | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<ContactFilter>("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setView(await api.contactsList());
      setError("");
    } catch (e) {
      setError(errText(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);
  useRefreshEvent("contacts", () => void load());

  const items = view?.items ?? [];
  const counts = useMemo<Record<ContactFilter, number>>(
    () => ({
      all: items.length,
      starred: items.filter((c) => c.starred).length,
      email: items.filter((c) => c.emails.length > 0).length,
      phone: items.filter((c) => c.phones.length > 0).length,
    }),
    [items],
  );
  const groups = useMemo(() => groupByLetter(filterContacts(items, filter, search)), [items, filter, search]);

  const gate = googleGate(error);
  if (gate) return <GoogleGate kind={gate} onConnected={() => void load()} />;
  if (view === null) {
    return error ? <ErrorBanner message={error} busy={loading} onRetry={() => void load()} /> : <Skeleton label={t("google.fetching")} rows={5} />;
  }

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      onNotice(t("contacts.copied"));
    } catch (e) {
      setError(errText(e));
    }
  };
  const shown = groups.reduce((sum, g) => sum + g.items.length, 0);
  let index = 0;
  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto pr-0.5">
      {error && <ErrorBanner message={error} busy={loading} onRetry={() => void load()} />}
      <section className="wx-glass wx-rise flex items-center justify-between gap-2 bg-gradient-to-br from-accent/15 via-accent/5 to-transparent p-3">
        <div>
          <p data-contacts-total className="text-3xl font-semibold tabular-nums tracking-tight text-fg">{view.total}</p>
          <span className="text-[11px] text-muted">{t("contacts.total")}</span>
        </div>
        <span className="flex items-center gap-1.5">
          {counts.starred > 0 && (
            <span className="rounded-full bg-warn/15 px-2 py-0.5 text-[11px] font-semibold text-warn">★ {counts.starred}</span>
          )}
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            aria-label={t("google.refresh")}
            className="canto-hit flex size-6 items-center justify-center rounded-full text-muted hover:bg-hover hover:text-fg disabled:opacity-60"
          >
            <span aria-hidden="true" className={`inline-block text-sm leading-none ${loading ? "wx-spin" : ""}`}>↻</span>
          </button>
        </span>
      </section>
      <label className="canto-field flex items-center gap-2 rounded-lg border border-edge bg-ink px-2.5 text-xs">
        <span aria-hidden="true" className="text-faint [&>svg]:size-3.5"><SearchIcon /></span>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("contacts.search")}
          aria-label={t("contacts.search")}
          maxLength={100}
          className="min-w-0 flex-1 bg-transparent py-1.5 text-fg outline-none placeholder:text-faint"
        />
      </label>
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={filter === id}
            onClick={() => setFilter(id)}
            className="canto-hit rounded-full border border-edge px-2.5 py-0.5 text-[11px] text-muted aria-pressed:border-accent/50 aria-pressed:bg-accent/15 aria-pressed:text-accent-text"
          >
            {t(`contacts.filter.${id}`)} <span className="tabular-nums opacity-70">{counts[id]}</span>
          </button>
        ))}
      </div>
      {shown === 0 ? (
        <p className="wx-glass p-3 text-xs text-muted">{items.length === 0 ? t("contacts.empty") : t("contacts.noMatch")}</p>
      ) : (
        groups.map((group) => (
          <section key={group.letter} aria-label={group.letter} className="wx-glass shrink-0">
            <h3 className="px-3 pb-0.5 pt-2 text-[10px] font-semibold uppercase tracking-widest text-accent-text">{group.letter}</h3>
            <ul className="divide-y divide-edge">
              {group.items.map((contact: Contact) => {
                const expanded = open === contact.id;
                index += 1;
                return (
                  <li key={contact.id} data-contact={contact.id} className="wx-rise" style={{ "--i": Math.min(index, 12) } as CSSProperties}>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      onClick={() => setOpen(expanded ? "" : contact.id)}
                      className="canto-hit flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-hover"
                    >
                      <span
                        aria-hidden="true"
                        className={`grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-bold text-fg ${avatarTone(contact.emails[0] ?? contact.name)}`}
                      >
                        {initials(contact.name)}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-xs font-semibold text-fg">{contact.name}</span>
                        <span className="truncate text-[11px] text-muted">{subtitle(contact)}</span>
                      </span>
                      {contact.starred && <span role="img" aria-label={t("contacts.starred")} className="text-warn">★</span>}
                      <span aria-hidden="true" className={`text-[9px] text-faint transition-transform ${expanded ? "rotate-180" : ""}`}>▾</span>
                    </button>
                    {expanded && (
                      <div className="flex flex-col gap-1.5 bg-ink/40 px-3 pb-2.5 pt-1.5">
                        <Detail label={t("contacts.email")} values={contact.emails} onCopy={(v) => void copy(v)} />
                        <Detail label={t("contacts.phone")} values={contact.phones} onCopy={(v) => void copy(v)} />
                        {contact.emails.length + contact.phones.length === 0 && <p className="text-[11px] text-faint">{t("contacts.noDetails")}</p>}
                        {contact.link && (
                          <button
                            type="button"
                            onClick={() => void api.openLink(contact.link).catch((e) => setError(errText(e)))}
                            className={`${MINI} self-start bg-accent/15 text-accent-text hover:bg-accent/25`}
                          >
                            {t("contacts.open")}
                          </button>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
      {view.total > items.length && (
        <p className="px-1 pb-1 text-center text-[11px] text-faint">{t("contacts.capped", { shown: items.length, total: view.total })}</p>
      )}
    </div>
  );
}
