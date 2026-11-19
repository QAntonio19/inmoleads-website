import { ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { content } from "../content";
import { formatClock } from "../lib/watchTracker";

interface Props {
  unlocked: boolean;
  remainingToUnlock: number | null;
  onStart: () => void;
}

/** Tarjeta de la agenda: bloqueada hasta el 60% del video, luego abre el formulario. */
export function BookingGate({ unlocked, remainingToUnlock, onStart }: Props) {
  if (!unlocked) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-muted/50 px-6 py-8 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <Lock className="h-5 w-5" aria-hidden />
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-xl font-bold sm:text-2xl">{content.locked.title}</h2>
          <p className="text-muted-foreground">{content.locked.body}</p>
        </div>
        <LockedButton label="Agendar mi sesión" remainingToUnlock={remainingToUnlock} />
        <p className="max-w-md text-sm text-muted-foreground">{content.locked.note}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-primary bg-card px-6 py-8 text-center shadow-[0_20px_60px_-15px_hsl(18_100%_50%/0.3)]">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
        <CheckCircle2 className="h-4 w-4" aria-hidden />
        {content.unlocked.badge}
      </span>
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">{content.unlocked.title}</h2>
        <p className="mx-auto max-w-xl text-muted-foreground">{content.unlocked.body}</p>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-7 py-3.5 text-lg font-semibold text-primary-foreground transition hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-ring/40"
      >
        {content.unlocked.cta}
        <ArrowRight className="h-5 w-5" aria-hidden />
      </button>
      <p className="text-sm text-muted-foreground">{content.unlocked.foot}</p>
    </div>
  );
}

/**
 * Botón de la agenda mientras sigue bloqueada, con la cuenta regresiva.
 * Sin `onClick` queda deshabilitado; con `onClick` (CTA final) se puede tocar para volver al video.
 */
export function LockedButton({
  label,
  remainingToUnlock,
  onClick,
}: {
  label: string;
  remainingToUnlock: number | null;
  onClick?: () => void;
}) {
  const left = remainingToUnlock === null ? null : formatClock(remainingToUnlock);
  return (
    <button
      type="button"
      disabled={!onClick}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg bg-muted px-6 py-3 font-semibold text-muted-foreground ${
        onClick
          ? "transition hover:bg-border focus:outline-none focus-visible:ring-4 focus-visible:ring-ring/40"
          : "cursor-not-allowed"
      }`}
    >
      <Lock className="h-4 w-4 shrink-0" aria-hidden />
      <span>
        {label}
        {left ? ` · se abre en ${left}` : ""}
      </span>
    </button>
  );
}
