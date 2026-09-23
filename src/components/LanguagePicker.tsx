import { useState } from "react";
import { t } from "../i18n";
import { LANGUAGE_CHOICES, loadChoice, saveChoice, type LanguageChoice } from "../i18n/language";

/** Each language in its own name, so someone who picked the wrong one can still find theirs. */
const NATIVE_NAME: Record<Exclude<LanguageChoice, "auto">, string> = { "pt-BR": "Português (Brasil)", en: "English" };

/** Module-level labels are resolved at startup, so a new language takes effect by reloading the UI. */
export default function LanguagePicker({ reload = () => location.reload() }: { reload?: () => void }) {
  const [choice, setChoice] = useState<LanguageChoice>(loadChoice);

  return (
    <section className="flex flex-col gap-2">
      <h3 id="language-title" className="text-xs font-semibold text-fg">
        {t("settings.language.title")}
      </h3>
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-labelledby="language-title">
        {LANGUAGE_CHOICES.map((c) => (
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
            {c === "auto" ? t("settings.language.auto") : NATIVE_NAME[c]}
          </button>
        ))}
      </div>
    </section>
  );
}
