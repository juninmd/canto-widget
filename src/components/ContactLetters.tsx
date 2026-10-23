import { t } from "../i18n";

type Props = { letters: string[]; onJump: (letter: string) => void };

/** A to Z index over the list: only the letters that have someone, one tap scrolls there. */
export default function ContactLetters({ letters, onJump }: Props) {
  if (letters.length < 4) return null;
  return (
    <nav aria-label={t("contacts.letters")} className="flex shrink-0 flex-wrap gap-0.5">
      {letters.map((letter) => (
        <button
          key={letter}
          type="button"
          aria-label={t("contacts.jump", { letter })}
          onClick={() => onJump(letter)}
          className="canto-hit grid size-5 place-items-center rounded text-[10px] font-semibold text-muted hover:bg-accent/15 hover:text-accent-text"
        >
          {letter}
        </button>
      ))}
    </nav>
  );
}
