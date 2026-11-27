import { Spinner as SonidoSpinner } from "@juninmd/sonido";

/** Decorative: the busy state is announced by the button's `aria-busy`, not by this glyph. */
export default function Spinner() {
  return <SonidoSpinner size={12} />;
}
