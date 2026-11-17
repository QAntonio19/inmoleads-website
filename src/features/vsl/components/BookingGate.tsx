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
    const left = remainingToUnlock === null ? null : formatClock(remainingToUnlock);
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-muted/50 px-6 py-8 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <Lock className="h-5 w-5" aria-hidden />
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-xl font-bold sm:text-2xl">{content.locked.title}</h2>
          <p className="text-muted-foreground">{content.locked.body}</p>
        </div>
        <button
          type="button"
          disabled
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-muted px-6 py-3 font-semibold text-muted-foreground"
        >
          <Lock className="h-4 w-4" aria-hidden />
          Agendar mi sesión{left ? ` · se abre en ${left}` : ""}
        </button>
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
