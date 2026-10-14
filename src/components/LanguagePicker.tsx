import { useState } from "react";
import { t } from "../i18n";
import { LANGUAGE_CHOICES, loadChoice, saveChoice, type LanguageChoice } from "../i18n/language";
import { NATIVE_NAMES } from "../i18n/languages";

/** Module-level labels are resolved at startup, so a new language takes effect by reloading the UI. */
export default function LanguagePicker({ reload = () => location.reload() }: { reload?: () => void }) {
  const [choice, setChoice] = useState<LanguageChoice>(loadChoice);
  const [search, setSearch] = useState("");
  const normalize = (text: string) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  const visible = LANGUAGE_CHOICES.filter((code) => code === "auto" ||
    normalize(`${NATIVE_NAMES[code]} ${code}`).includes(normalize(search.trim())));

  return (
    <section className="flex flex-col gap-2">
      <h3 id="language-title" className="text-xs font-semibold text-fg">
        {t("settings.language.title")}
      </h3>
      <input type="search" value={search} onChange={(event) => setSearch(event.target.value)}
        aria-label={t("settings.language.search")} placeholder={t("settings.language.search")}
        className="rounded-lg border border-edge bg-ink px-2 py-1 text-xs text-fg" />
      <div className="flex max-h-44 flex-wrap gap-1.5 overflow-y-auto" role="radiogroup" aria-labelledby="language-title">
        {visible.map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            lang={c === "auto" ? undefined : c}
            aria-checked={choice === c}
            onClick={() => {
              if (c === choice) return;
              setChoice(c);
              saveChoice(c);
              reload();
            }}
            className={`min-h-7 rounded-lg border px-2.5 text-xs ${
              choice === c ? "border-accent text-fg" : "border-edge text-muted hover:text-fg"
            }`}
          >
            {c === "auto" ? t("settings.language.auto") : c === "pt-BR" ? "Português (Brasil)" : NATIVE_NAMES[c]}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted">{t("settings.language.translationNote")}</p>
    </section>
  );
}
