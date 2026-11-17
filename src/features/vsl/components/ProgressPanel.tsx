import { vslConfig } from "../config";
import { content } from "../content";
import type { WatchProgress } from "../hooks/useWatchProgress";
import { formatClock } from "../lib/watchTracker";

/** Barra de avance del video con la marca donde se abre la agenda. */
export function ProgressPanel({ progress }: { progress: WatchProgress }) {
  const pct = Math.round(progress.fraction * 100);
  const unlockPct = Math.round(vslConfig.unlockAt * 100);
  const { unlocked, remainingToUnlock } = progress;

  const status = unlocked
    ? "Listo: tu agenda está abierta"
    : remainingToUnlock === null
      ? "Dale play para empezar"
      : `Te faltan ${formatClock(remainingToUnlock)} para desbloquear tu sesión`;

  return (
    <div className="flex flex-col gap-3" aria-live="polite">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
        <span className="font-semibold tabular-nums">Tu avance: {pct}%</span>
        <span className={unlocked ? "font-semibold text-emerald-700" : "text-muted-foreground"}>{status}</span>
      </div>

      <div className="relative pt-7">
        <span
          className={`absolute top-0 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-semibold text-white ${
            unlocked ? "bg-emerald-700" : "bg-secondary"
          }`}
          style={{ left: `${unlockPct}%` }}
        >
          {unlocked ? "Agenda abierta" : "Aquí se abre tu agenda"}
        </span>
        <div
          className="relative h-3 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label="Avance del video"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${pct}%` }} />
        </div>
        <div className="absolute bottom-[-4px] top-[22px] w-0.5 bg-secondary" style={{ left: `${unlockPct}%` }} />
      </div>

      <ol className="grid grid-cols-3 gap-2 text-xs text-muted-foreground sm:text-sm">
        {content.chapters.map((c, i) => (
          <li key={c} className={i === 1 ? "text-center" : i === 2 ? "text-right" : ""}>
            {c}
          </li>
        ))}
      </ol>
    </div>
  );
}
