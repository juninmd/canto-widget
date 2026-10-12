/** Decorative: the busy state is announced by the button's `aria-busy`, not by this glyph. */
export default function Spinner() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="inline-block size-3 motion-safe:animate-spin" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
  );
}
