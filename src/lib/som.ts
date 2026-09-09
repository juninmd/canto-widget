/** Três bipes curtos, sintetizados na hora — sem arquivo de áudio no bundle. */
export async function tocarAlerta(): Promise<void> {
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  const ctx = new Ctx();
  try {
    await ctx.resume();
  } catch {
    /* alguns ambientes bloqueiam áudio sem gesto; o pop-up visual já cumpre o aviso */
  }
  const inicio = ctx.currentTime;
  for (let i = 0; i < 3; i++) {
    const t = inicio + i * 0.28;
    const osc = ctx.createOscillator();
    const ganho = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(i === 2 ? 1046 : 784, t);
    ganho.gain.setValueAtTime(0.0001, t);
    ganho.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
    ganho.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    osc.connect(ganho).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.24);
  }
  setTimeout(() => void ctx.close(), 1500);
}
