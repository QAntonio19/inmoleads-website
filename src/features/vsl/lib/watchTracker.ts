// Cuenta los segundos realmente vistos de un video. Adelantar con la barra no
// suma, y volver a ver la misma parte tampoco cuenta doble.

/** Un salto mayor a esto entre dos lecturas se considera un seek, no reproducción. */
const MAX_STEP_SECONDS = 1.5;

export class WatchTracker {
  private seen: Uint8Array;
  private last: number | null = null;
  readonly duration: number;

  constructor(duration: number, saved?: string | null) {
    this.duration = duration;
    this.seen = new Uint8Array(Math.ceil(duration));
    if (saved && saved.length === this.seen.length) {
      for (let i = 0; i < saved.length; i++) this.seen[i] = saved[i] === "1" ? 1 : 0;
    }
  }

  /** Registra la posición actual del reproductor mientras reproduce. */
  tick(time: number): void {
    const prev = this.last;
    this.last = time;
    if (prev === null) return;
    const step = time - prev;
    if (step <= 0 || step > MAX_STEP_SECONDS) return;
    const from = Math.floor(prev);
    const to = Math.min(Math.floor(time), this.seen.length - 1);
    for (let s = from; s <= to; s++) this.seen[s] = 1;
  }

  /** Llamar al pausar o al saltar, para que el siguiente tick no sume el hueco. */
  reset(): void {
    this.last = null;
  }

  get watchedSeconds(): number {
    let n = 0;
    for (const v of this.seen) n += v;
    return Math.min(n, this.duration);
  }

  get fraction(): number {
    return this.duration > 0 ? this.watchedSeconds / this.duration : 0;
  }

  serialize(): string {
    return Array.from(this.seen, (v) => (v ? "1" : "0")).join("");
  }
}

export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
